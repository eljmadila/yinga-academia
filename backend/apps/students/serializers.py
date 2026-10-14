from rest_framework import serializers
from .models import Enrollment, Review, Question, Answer

from apps.courses.serializers import CourseSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    def validate_course(self, course):
        if self.instance and course.pk != self.instance.course_id:
            raise serializers.ValidationError('An enrollment cannot be moved to another course.')
        return course
    
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'course', 'status', 'enrolled_at', 'course_details', 'progress_percentage')
        read_only_fields = ('id', 'student', 'status', 'enrolled_at')

    def get_progress_percentage(self, obj):
        from apps.courses.models import Lesson
        from apps.progress.models import Progress
        
        total_lessons = Lesson.objects.filter(course=obj.course).count()
        if total_lessons == 0:
            return 0
            
        completed_lessons = Progress.objects.filter(
            student=obj.student,
            lesson__course=obj.course,
            is_completed=True
        ).count()
        
        return int((completed_lessons / total_lessons) * 100)


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('id', 'student', 'created_at')

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.email.split('@')[0]

class AnswerSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ('id', 'question', 'author', 'author_name', 'author_role', 'body', 'is_accepted', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.email.split('@')[0]

    def get_author_role(self, obj):
        return obj.author.role

class QuestionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    lesson_details = serializers.SerializerMethodField()
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'student', 'student_name', 'lesson', 'lesson_details', 'title', 'body', 'is_resolved', 'created_at', 'updated_at', 'answers')
        read_only_fields = ('id', 'student', 'created_at', 'updated_at')

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.email.split('@')[0]

    def get_lesson_details(self, obj):
        if not obj.lesson:
            return None
        course = getattr(obj.lesson, 'course', None)
        return {
            'id': str(obj.lesson.id),
            'title': obj.lesson.title,
            'course': {
                'id': str(course.id) if course else None,
                'title': course.title if course else "Course",
            } if course else None,
        }
