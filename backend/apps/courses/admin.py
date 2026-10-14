from django.contrib import admin, messages
from unfold.admin import ModelAdmin, TabularInline

from .models import Course, Module, Lesson, VideoMedia


class VideoMediaInline(TabularInline):
    model = VideoMedia
    extra = 1
    fields = ('order', 'title', 'video_url', 'duration_seconds', 'file_size')


class LessonInline(TabularInline):
    model = Lesson
    extra = 1
    fields = ('order', 'module', 'title', 'duration_minutes', 'is_free_preview', 'video_url')


class ModuleInline(TabularInline):
    model = Module
    extra = 1
    fields = ('order', 'title', 'description')


class CourseAdmin(ModelAdmin):
    list_display = ('title', 'instructor', 'price', 'level', 'status', 'is_published', 'created_at')
    list_filter = ('status', 'is_published', 'level', 'category')
    search_fields = ('title', 'instructor__email')
    inlines = [ModuleInline, LessonInline]
    list_per_page = 25
    actions = ['approve_courses', 'reject_courses']

    @admin.action(description='Approuver les cours sélectionnés (Publier)')
    def approve_courses(self, request, queryset):
        updated = queryset.update(status='PUBLISHED', is_published=True)
        self.message_user(request, f"{updated} cours ont été approuvés et publiés avec succès.", messages.SUCCESS)

    @admin.action(description='Rejeter les cours sélectionnés (Brouillon)')
    def reject_courses(self, request, queryset):
        updated = queryset.update(status='DRAFT', is_published=False)
        self.message_user(request, f"{updated} cours ont été renvoyés à l'état de brouillon.", messages.WARNING)


@admin.register(Course)
class RegisteredCourseAdmin(CourseAdmin):
    pass


@admin.register(Module)
class ModuleAdmin(ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    ordering = ('course', 'order')


@admin.register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ('title', 'course', 'module', 'order', 'duration_minutes', 'is_free_preview')
    list_filter = ('is_free_preview', 'module', 'course')
    search_fields = ('title', 'course__title', 'module__title')
    ordering = ('course', 'module', 'order')
    inlines = [VideoMediaInline]


@admin.register(VideoMedia)
class VideoMediaAdmin(ModelAdmin):
    list_display = ('title', 'lesson', 'duration_seconds', 'file_size', 'order')
    list_filter = ('lesson',)
    search_fields = ('title', 'lesson__title')
    ordering = ('lesson', 'order')
