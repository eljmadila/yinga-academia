import React from 'react';
import { cookies } from "next/headers";
import CreateCourseClient from './CreateCourseClient';

export default async function InstructorCreateCoursePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  return (
    <CreateCourseClient token={token} />
  );
}