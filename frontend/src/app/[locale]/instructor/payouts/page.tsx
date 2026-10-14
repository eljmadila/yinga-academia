import React from 'react';
import { cookies } from 'next/headers';
import PayoutsClient from './PayoutsClient';

export default async function InstructorPayoutsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  return <PayoutsClient token={token} />;
}
