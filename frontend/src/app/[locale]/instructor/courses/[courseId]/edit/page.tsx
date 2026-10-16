import React from 'react';
import CourseEditor from '@/components/instructor/CourseEditor';

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div className="py-6">
      <CourseEditor courseIdProp={courseId} />
    </div>
  );
}
