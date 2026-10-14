from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Enrollment, Review, Question, Answer
from .serializers import EnrollmentSerializer, ReviewSerializer, QuestionSerializer, AnswerSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Students only see their own enrollments, instructors might see their course enrollments
        if self.request.user.role == 'INSTRUCTOR':
            return Enrollment.objects.filter(course__instructor=self.request.user)
        return Enrollment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.price > 0:
            raise ValidationError({'course': 'Paid courses require verified payment.'})
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def checkout(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({"error": "course_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.shortcuts import get_object_or_404
        from apps.courses.models import Course
        course = get_object_or_404(Course, id=course_id)
        user = request.user

        if course.price > 0:
            return Response(
                {'error': 'Paid courses require verified payment.'},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        
        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({"error": "Already enrolled"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Note: Payment gateway integration (Flutterwave/M-Pesa) will handle the order/payment creation.
        
        enrollment = Enrollment.objects.create(
            student=user,
            course=course,
            status='ACTIVE'
        )
        
        return Response({
            "message": "Successfully enrolled",
            "enrollment_id": enrollment.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def certificate(self, request):
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id required'}, status=400)
            
        enrollment = Enrollment.objects.filter(student=request.user, course_id=course_id).first()
        if not enrollment:
            return Response({'error': 'Not enrolled'}, status=400)
            
        if enrollment.status != 'COMPLETED':
            return Response({'error': 'Course not completed'}, status=400)
            
        # Generate PDF
        from django.http import HttpResponse
        import io
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import landscape, A4
        from reportlab.lib.units import inch
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)
        
        # Border
        c.setStrokeColorRGB(0.14, 0.39, 0.85) # brand-500 approx
        c.setLineWidth(10)
        c.rect(0.5*inch, 0.5*inch, width-1*inch, height-1*inch)
        
        # Title
        c.setFont("Helvetica-Bold", 40)
        c.drawCentredString(width/2.0, height - 2.5*inch, "CERTIFICAT DE RÉUSSITE")
        
        # Subtitle
        c.setFont("Helvetica", 20)
        c.drawCentredString(width/2.0, height - 3.5*inch, "Décerné à :")
        
        # Student name
        c.setFont("Helvetica-Oblique", 30)
        student_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email
        c.drawCentredString(width/2.0, height - 4.2*inch, student_name)
        
        # Course text
        c.setFont("Helvetica", 16)
        c.drawCentredString(width/2.0, height - 5.5*inch, "pour avoir complété avec succès le cours :")
        
        # Course title
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(width/2.0, height - 6.2*inch, enrollment.course.title)
        
        # Footer
        from datetime import date
        import os
        from django.conf import settings
        
        logo_path = os.path.join(settings.BASE_DIR, 'apps', 'yinga_app', 'static', 'yinga', 'logo-yinga-full.png')
        if os.path.exists(logo_path):
            from reportlab.lib.utils import ImageReader
            logo = ImageReader(logo_path)
            c.drawImage(logo, 1.2*inch, 0.7*inch, width=2.5*inch, height=0.8*inch, mask='auto', preserveAspectRatio=True)
        else:
            c.setFont("Helvetica", 12)
            c.drawString(1.5*inch, 1*inch, "Yinga Academia")
            
        c.setFont("Helvetica", 12)
        c.drawRightString(width-1.5*inch, 1*inch, f"Date: {date.today().strftime('%d/%m/%Y')}")
        
        c.showPage()
        c.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"Certificat_{enrollment.course.id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response



class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        qs = Review.objects.all().select_related('student', 'course').order_by('-created_at')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        
        # Check if user is enrolled
        if not Enrollment.objects.filter(student=user, course=course).exists():
            raise ValidationError("You must be enrolled to leave a review.")
            
        serializer.save(student=user)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        lesson_id = self.request.query_params.get('lesson_id')
        
        if user.role == 'INSTRUCTOR':
            qs = Question.objects.filter(lesson__course__instructor=user)
        else:
            qs = Question.objects.all()
            
        qs = qs.select_related('student', 'lesson', 'lesson__course').prefetch_related('answers', 'answers__author').order_by('-created_at')
        
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class AnswerViewSet(viewsets.ModelViewSet):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.request.query_params.get('question_id')
        qs = Answer.objects.all().select_related('author', 'question').order_by('created_at')
        if question_id:
            qs = qs.filter(question_id=question_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
