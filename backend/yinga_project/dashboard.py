from django.db.models import Count

from apps.accounts.models import User
from apps.courses.models import Course
from apps.progress.models import Progress
from apps.students.models import Enrollment
from apps.payments.models import Payment


def dashboard_callback(request, context):
    total_progress = Progress.objects.count()
    completed_progress = Progress.objects.filter(is_completed=True).count()
    context.update(
        {
            'metrics': [
                {'label': 'Learners', 'value': User.objects.filter(role='STUDENT').count(), 'icon': 'group'},
                {'label': 'Published courses', 'value': Course.objects.filter(is_published=True).count(), 'icon': 'school'},
                {'label': 'Active enrollments', 'value': Enrollment.objects.filter(status='ACTIVE').count(), 'icon': 'how_to_reg'},
                {'label': 'Successful payments', 'value': Payment.objects.filter(status='SUCCESS').count(), 'icon': 'payments'},
            ],
            'recent_courses': Course.objects.select_related('instructor').annotate(
                lesson_count=Count('lessons')
            ).order_by('-created_at')[:5],
            'completion_rate': round(completed_progress / total_progress * 100) if total_progress else 0,
        }
    )
    return context