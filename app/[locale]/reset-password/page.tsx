
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  const token =
    typeof params.token === 'string' ? params.token : '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d19] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1424] p-6 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 text-2xl font-bold tracking-wide text-white">
            APEX <span className="text-blue-500">VAULT</span>
          </div>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
