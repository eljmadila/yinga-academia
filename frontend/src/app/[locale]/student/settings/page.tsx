import React from 'react';
import { cookies } from 'next/headers';
import SettingsClient from './SettingsClient';

export default async function StudentSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  return <SettingsClient token={token} />;
}