from rest_framework import serializers
from django.conf import settings
from PIL import Image
from .models import Course, Module, Lesson, VideoMedia

class VideoMediaSerializer(serializers.ModelSerializer):
    lesson = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = VideoMedia
        fields = ('id', 'title', 'video_url', 'file_size', 'duration_seconds', 'order', 'lesson', 'created_at', 'updated_at')
        read_only_fields = ('id', 'lesson', 'created_at', 'updated_at')


class LessonSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False)
    module = serializers.PrimaryKeyRelatedField(queryset=Module.objects.all(), required=False, allow_null=True)
    video_media = VideoMediaSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Lesson
        fields = ('id', 'course', 'module', 'title', 'content', 'video_url', 'video_file', 'order', 'duration_minutes', 'is_free_preview', 'video_media')
        read_only_fields = ('id', 'video_file')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        can_access = instance.is_free_preview
        if user and user.is_authenticated:
            can_access = can_access or user.is_staff or (
                user.role == 'INSTRUCTOR' and instance.course.instructor_id == user.id
            ) or Enrollment.objects.filter(
                student=user,
                course=instance.course,
                status__in=['ACTIVE', 'COMPLETED'],
            ).exists()

        if not can_access:
            data['content'] = ''
            data['video_url'] = None
            data['video_file'] = None
            data['video_media'] = []
        return data

    def validate_video_file(self, value):
        if value and value.size > settings.MAX_VIDEO_CHUNK_BYTES:
            raise serializers.ValidationError('Upload videos through the chunked uploader.')
        return value


class ModuleSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False)
    lessons = LessonSerializer(many=True, required=False)

    class Meta:
        model = Module
        fields = ('id', 'course', 'title', 'description', 'order', 'lessons', 'created_at', 'updated_at')
        read_only_fields = ('id', 'course', 'created_at', 'updated_at')

    def create(self, validated_data):
        lessons_data = validated_data.pop('lessons', [])
        module = Module.objects.create(**validated_data)

        for lesson_data in lessons_data:
            Lesson.objects.create(course=module.course, module=module, **lesson_data)

        return module


from apps.accounts.models import User
from apps.instructors.models import InstructorProfile
from django.db.models import Avg
from apps.students.models import Enrollment, Review

class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = ('specialty', 'website', 'linkedin', 'github', 'youtube', 'twitter')

class InstructorSerializer(serializers.ModelSerializer):
    profile = InstructorProfileSerializer(source='instructor_profile', read_only=True)
    total_students = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_courses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'title', 'bio', 'avatar', 'profile', 'total_students', 'average_rating', 'total_courses')

    def get_total_students(self, obj):
        return Enrollment.objects.filter(course__instructor=obj).values('student').distinct().count()

    def get_average_rating(self, obj):
        avg = Review.objects.filter(course__instructor=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0
        
    def get_total_courses(self, obj):
        return obj.courses.filter(is_published=True).count()

class CourseSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    modules = ModuleSerializer(many=True, required=False)
    lessons = LessonSerializer(many=True, required=False, read_only=True)
    enrollments_count = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'instructor', 'title', 'description', 'price', 'category', 'level', 'learning_objectives', 'course_includes', 'thumbnail', 'trailer_url', 'status', 'is_published', 'modules', 'lessons', 'enrollments_count', 'total_revenue', 'is_favorite', 'is_enrolled', 'average_rating', 'reviews_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'instructor', 'created_at', 'updated_at')

    def validate_thumbnail(self, value):
        if value and value.size > settings.MAX_COURSE_THUMBNAIL_BYTES:
            raise serializers.ValidationError('Course thumbnails must not exceed 5 MiB.')
        if value:
            value.seek(0)
            with Image.open(value) as image:
                if max(image.size) > settings.MAX_IMAGE_DIMENSION:
                    raise serializers.ValidationError('Course thumbnail dimensions must not exceed 4096 pixels.')
            value.seek(0)
        return value

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            from apps.students.models import Enrollment
            return Enrollment.objects.filter(
                student=request.user,
                course=obj,
                status__in=['ACTIVE', 'COMPLETED'],
            ).exists()
        return False

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return request.user in obj.favorites.all()
        return False

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_enrollments_count(self, obj):
        from apps.students.models import Enrollment
        return Enrollment.objects.filter(course=obj).count()

    def get_total_revenue(self, obj):
        from apps.payments.models import Order
        from django.db.models import Sum
        rev = Order.objects.filter(course=obj, status='COMPLETED').aggregate(total=Sum('amount'))['total']
        return float(rev) if rev else 0.0

    def create(self, validated_data):
        modules_data = validated_data.pop('modules', [])
        lessons_data = validated_data.pop('lessons', [])

        instructor = validated_data.pop('instructor', None)
        if instructor is None:
            request = self.context.get('request')
            instructor = request.user if request else None
        if instructor is None and 'instructor' in self.initial_data:
            instructor = self.initial_data.get('instructor')

        course = Course.objects.create(instructor=instructor, **validated_data)

        for module_data in modules_data:
            module_lessons = module_data.pop('lessons', [])
            module = Module.objects.create(course=course, **module_data)

            for lesson_data in module_lessons:
                Lesson.objects.create(course=course, module=module, **lesson_data)

        for lesson_data in lessons_data:
            Lesson.objects.create(course=course, **lesson_data)

        return course
