import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPendingKycSubmissions } from '@/actions/admin-kyc';
import AdminKycClient from '@/components/admin/AdminKycClient';

export default async function AdminKycPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { submissions = [] } = await getPendingKycSubmissions();

  return <AdminKycClient initialSubmissions={submissions} />;
}