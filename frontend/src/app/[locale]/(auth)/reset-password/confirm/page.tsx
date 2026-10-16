import ResetPasswordConfirmForm from "@/components/auth/ResetPasswordConfirmForm";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default async function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string }>;
}) {
  const { uid = "", token = "" } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10 dark:bg-gray-950">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="pill" />
      </div>
      <ResetPasswordConfirmForm uid={uid} token={token} />
    </main>
  );
}
