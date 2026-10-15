import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yinga_project.settings')
django.setup()

import cloudinary.uploader
from apps.courses.models import Course
from apps.accounts.models import User

def sync_media_to_cloudinary():
    media_root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media')
    print(f"Scanning media root: {media_root}")
    
    # 1. Sync Course Thumbnails
    courses = Course.objects.filter(thumbnail__isnull=False).exclude(thumbnail='')
    print(f"\nFound {courses.count()} courses with thumbnails:")
    for course in courses:
        rel_path = str(course.thumbnail)
        full_path = os.path.join(media_root, rel_path)
        if os.path.exists(full_path):
            name_no_ext, _ = os.path.splitext(rel_path.replace('\\', '/'))
            public_id = f"media/{name_no_ext}"
            print(f"Uploading '{course.title}' thumbnail from {full_path} as public_id='{public_id}'...")
            try:
                res = cloudinary.uploader.upload(
                    full_path,
                    public_id=public_id,
                    overwrite=True,
                    resource_type='image'
                )
                print(f"  -> SUCCESS: {res.get('secure_url')}")
            except Exception as e:
                print(f"  -> ERROR uploading {rel_path}: {e}")
        else:
            print(f"  -> Local file not found: {full_path}")

    # 2. Sync User Avatars
    users = User.objects.filter(avatar__isnull=False).exclude(avatar='')
    print(f"\nFound {users.count()} users with avatars:")
    for user in users:
        rel_path = str(user.avatar)
        full_path = os.path.join(media_root, rel_path)
        if os.path.exists(full_path):
            name_no_ext, _ = os.path.splitext(rel_path.replace('\\', '/'))
            public_id = f"media/{name_no_ext}"
            print(f"Uploading user '{user.email}' avatar as public_id='{public_id}'...")
            try:
                res = cloudinary.uploader.upload(
                    full_path,
                    public_id=public_id,
                    overwrite=True,
                    resource_type='image'
                )
                print(f"  -> SUCCESS: {res.get('secure_url')}")
            except Exception as e:
                print(f"  -> ERROR uploading {rel_path}: {e}")
        else:
            print(f"  -> Local file not found: {full_path}")

    print("\nMedia sync to Cloudinary completed successfully.")

if __name__ == '__main__':
    sync_media_to_cloudinary()
