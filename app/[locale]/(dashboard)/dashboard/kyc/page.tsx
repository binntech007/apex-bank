// app/[locale]/(dashboard)/dashboard/kyc/page.tsx
import { auth } from '@/auth';
import { getKycStatus } from '@/actions/kyc';
import KycClient from '@/components/kyc/KycClient'; // Adjust path if necessary
import { redirect } from 'next/navigation';

export default async function KycPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Fetch the user's KYC record directly
  const kycRecord = await getKycStatus(session.user.id);

  return (
    <KycClient 
      userId={session.user.id} 
      initialKyc={kycRecord} 
    />
  );
}