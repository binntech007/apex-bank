import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPaymentMethods } from '@/actions/payment-methods';
import PaymentSettingsClient from './PaymentSettingsClient';

export default async function PaymentSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch saved banks and cards on the server 📥
  const { banks = [], cards = [] } = await getPaymentMethods(session.user.id);

  return (
    <PaymentSettingsClient 
      userId={session.user.id} 
      initialBanks={banks} 
      initialCards={cards} 
    />
  );
}