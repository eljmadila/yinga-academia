import React from 'react';
import { cookies } from 'next/headers';
import QAClient from './QAClient';

export default async function InstructorQAPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  return <QAClient token={token} />;
}