from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Progress
from .serializers import ProgressSerializer
from apps.courses.models import Lesson
from apps.students.models import Enrollment

class ProgressViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        lesson = serializer.validated_data['lesson']
        if not Enrollment.objects.filter(student=self.request.user, course=lesson.course, status__in=['ACTIVE', 'COMPLETED']).exists():
            raise PermissionDenied('Enrollment is required to record course progress.')
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        lesson = serializer.instance.lesson
        if not Enrollment.objects.filter(student=self.request.user, course=lesson.course, status__in=['ACTIVE', 'COMPLETED']).exists():
            raise PermissionDenied('An active enrollment is required to update course progress.')
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def update_progress(self, request):
        lesson_id = request.data.get('lesson_id')
        timecode = request.data.get('current_timecode')
        is_completed = request.data.get('is_completed')
        
        if not lesson_id:
            return Response({'error': 'lesson_id is required'}, status=400)
            
        lesson = get_object_or_404(Lesson, id=lesson_id)

        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=lesson.course,
            status__in=['ACTIVE', 'COMPLETED'],
        ).first()
        if not enrollment:
            raise PermissionDenied('An active enrollment is required to record course progress.')
        
        progress, created = Progress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )
        
        if timecode is not None:
            progress.current_timecode = float(timecode)
            
        if is_completed is not None:
            progress.is_completed = bool(is_completed)
            
        progress.save()
            
        # Check if course is completed
        total_lessons = Lesson.objects.filter(course=lesson.course).count()
        completed_lessons = Progress.objects.filter(student=request.user, lesson__course=lesson.course, is_completed=True).count()
        
        course_completed = False
        progress_percentage = 0
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
            if completed_lessons == total_lessons:
                enrollment.status = 'COMPLETED'
                enrollment.save()
                course_completed = True
                
        from apps.students.models import Review
        has_reviewed = Review.objects.filter(student=request.user, course=lesson.course).exists()

        return Response({
            'status': 'success', 
            'is_completed': progress.is_completed, 
            'course_completed': course_completed,
            'progress_percentage': progress_percentage,
            'has_reviewed': has_reviewed
        })

    @action(detail=False, methods=['get'])
    def by_course(self, request):
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id query parameter is required'}, status=400)
            
        progresses = Progress.objects.filter(student=request.user, lesson__course_id=course_id)
        if request.query_params.get('include_incomplete') != '1':
            progresses = progresses.filter(is_completed=True)
        serializer = self.get_serializer(progresses, many=True)
        return Response(serializer.data)
