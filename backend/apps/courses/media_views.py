"""
Streams media files with HTTP Range support.

Django's built-in `django.views.static.serve` always returns the full file
(HTTP 200), which prevents browsers from seeking inside videos or resuming
playback at a saved timecode. This view answers Range requests with 206
Partial Content so the HTML5 video player can jump anywhere in the file.
"""
import mimetypes
import os
import re

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from django.utils._os import safe_join


def _can_access_video(request, path):
    if not path.startswith('videos/'):
        return True

    from apps.courses.models import Lesson, VideoMedia
    from apps.students.models import Enrollment

    video = VideoMedia.objects.filter(video_file=path).select_related('lesson__course').first()
    lesson = video.lesson if video else Lesson.objects.filter(video_file=path).select_related('course').first()
    if not lesson:
        return False
    if lesson.is_free_preview:
        return True

    user = request.user
    if not user.is_authenticated:
        return False
    if user.is_staff or (user.role == 'INSTRUCTOR' and lesson.course.instructor_id == user.id):
        return True
    return Enrollment.objects.filter(
        student=user,
        course=lesson.course,
        status__in=['ACTIVE', 'COMPLETED'],
    ).exists()

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")
CHUNK_SIZE = 8192 * 16


def _file_iterator(path, start, length):
    with open(path, "rb") as f:
        f.seek(start)
        remaining = length
        while remaining > 0:
            data = f.read(min(CHUNK_SIZE, remaining))
            if not data:
                break
            remaining -= len(data)
            yield data


def serve_media_with_range(request, path):
    try:
        full_path = safe_join(str(settings.MEDIA_ROOT), path)
    except Exception:
        raise Http404("Invalid path")

    if not _can_access_video(request, path):
        raise Http404("File not found")

    if not os.path.isfile(full_path):
        raise Http404("File not found")

    size = os.path.getsize(full_path)
    content_type = mimetypes.guess_type(full_path)[0] or "application/octet-stream"
    range_header = request.headers.get("Range", "")
    match = RANGE_RE.match(range_header)

    if match:
        start_s, end_s = match.groups()
        if start_s == "":
            # suffix range: last N bytes
            length = int(end_s)
            start = max(size - length, 0)
            end = size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
        end = min(end, size - 1)

        if start >= size or start > end:
            resp = HttpResponse(status=416)
            resp["Content-Range"] = f"bytes */{size}"
            return resp

        length = end - start + 1
        resp = StreamingHttpResponse(_file_iterator(full_path, start, length), status=206, content_type=content_type)
        resp["Content-Length"] = str(length)
        resp["Content-Range"] = f"bytes {start}-{end}/{size}"
    else:
        resp = FileResponse(open(full_path, "rb"), content_type=content_type)
        resp["Content-Length"] = str(size)

    resp["Accept-Ranges"] = "bytes"
    resp["Access-Control-Allow-Origin"] = "*"
    return resp
