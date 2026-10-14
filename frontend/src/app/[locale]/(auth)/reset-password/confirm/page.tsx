import ResetPasswordConfirmForm from "@/components/auth/ResetPasswordConfirmForm";

export default async function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string }>;
}) {
  const { uid = "", token = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10 dark:bg-gray-950">
      <ResetPasswordConfirmForm uid={uid} token={token} />
    </main>
  );
}
