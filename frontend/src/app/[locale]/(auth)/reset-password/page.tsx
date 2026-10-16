import ResetPasswordRequestForm from "@/components/auth/ResetPasswordRequestForm";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10 dark:bg-gray-950">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="pill" />
      </div>
      <ResetPasswordRequestForm />
    </main>
  );
}
