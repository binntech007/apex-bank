// app/register/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { initiateRegistration, verifyAndRegister } from '@/actions/register';
import { CustomerRegisterSchema } from '@/lib/validations/auth';
import { InputGroup } from '@/components/auth/InputGroup';
import { CurrencyPicker, Currency } from '@/components/auth/CurrencyPicker';
import { StepIndicator } from '@/components/auth/StepIndicator';
import { Crown, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Steps 1, 2, and verification (Step 3)
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State 📝
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('male');
  const [country, setCountry] = useState('United Kingdom');
  const [primaryCurrency, setPrimaryCurrency] = useState<Currency>('USD');
  const [streetAddress, setStreetAddress] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Verification Code State 🔢
  const [verificationCode, setVerificationCode] = useState('');

  const t = useTranslations('CustomerRegisterPage');

  const handleNextStep = () => {
    setFieldErrors({});
    setGeneralError('');

    const step1Data = { fullName, email, password, gender, country, primaryCurrency };
    const step1Schema = CustomerRegisterSchema.pick({
      fullName: true,
      email: true,
      password: true,
      gender: true,
      country: true,
      primaryCurrency: true,
    });

    const validation = step1Schema.safeParse(step1Data);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          formattedErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    setStep(2);
  };

  // Step 2 Submission: Triggers email code dispatch via Zoho
  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setGeneralError(t('errors.termsRequired'));
      return;
    }

    const payload = {
      fullName,
      email,
      password,
      phone,
      gender,
      country,
      primaryCurrency,
      streetAddress,
      governmentId,
    };

    const validation = CustomerRegisterSchema.safeParse(payload);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          formattedErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);
    setGeneralError('');
    setFieldErrors({});

    const res = await initiateRegistration(payload);

    if (!res.success) {
      if (res.fieldErrors) {
        const serverErrors: Record<string, string> = {};
        Object.entries(res.fieldErrors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages[0]) {
            serverErrors[key] = messages[0];
          }
        });
        setFieldErrors(serverErrors);
      } else {
        setGeneralError(res.error || t('errors.registrationFailed'));
      }
      setLoading(false);
      return;
    }

    // Move to Code Verification Screen (Step 3)
    setLoading(false);
    setStep(3);
  };

  // Step 3 Submission: Verifies code and finalizes account creation
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setGeneralError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setGeneralError('');

    const res = await verifyAndRegister(email, verificationCode, primaryCurrency);

    if (!res.success) {
      setGeneralError(res.error || 'Verification failed.');
      setLoading(false);
      return;
    }

    const authRes = await signIn('credentials', { email, password, name: fullName, redirect: false });

    if (authRes?.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setGeneralError(t('errors.loginPrompt'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-obsidian text-[#E2E8F0] items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-[#263346] bg-[#151C28] p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
            <Crown size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-xs text-slate-400">
            {step === 3 ? 'Email Verification' : t('subtitle', { step })}
          </p>
        </div>

        {step < 3 && <StepIndicator currentStep={step} totalSteps={2} />}

        {generalError && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
            {generalError}
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <div className="space-y-4">
            <InputGroup
              label={t('fields.fullNameLabel')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fields.fullNamePlaceholder')}
              error={fieldErrors.fullName}
            />

            <InputGroup
              label={t('fields.emailLabel')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              error={fieldErrors.email}
            />

            <InputGroup
              label={t('fields.passwordLabel')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={fieldErrors.password}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {t('fields.genderLabel')}
                </label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3 py-3 text-white focus:border-[#8B5CF6] focus:outline-none"
                >
                  <option value="male">{t('genderOptions.male')}</option>
                  <option value="female">{t('genderOptions.female')}</option>
                  <option value="other">{t('genderOptions.other')}</option>
                  <option value="prefer_not_to_say">{t('genderOptions.preferNotToSay')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {t('fields.countryLabel')}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3 py-3 text-white focus:border-[#8B5CF6] focus:outline-none"
                >
                  <option value="United Kingdom">United Kingdom 🇬🇧</option>
                  <option value="United States">United States 🇺🇸</option>
                  <option value="Germany">Germany 🇩🇪</option>
                  <option value="France">France 🇫🇷</option>
                  <option value="Spain">Spain 🇪🇸</option>
                  <option value="Italy">Italy 🇮🇹</option>
                  <option value="Canada">Canada 🇨🇦</option>
                  <option value="Australia">Australia 🇦🇺</option>
                  <option value="Mexico">Mexico 🇲🇽</option>
                  <option value="Philippine">Philippine 🇵🇭</option>
                  <option value="Thailand">Thailand 🇹🇭</option>
                  <option value="South Africa">South Africa 🇿🇦</option>
                </select>
              </div>
            </div>

            <CurrencyPicker selected={primaryCurrency} onSelect={setPrimaryCurrency} />

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition mt-2 shadow-lg shadow-[#8B5CF6]/20"
            >
              {t('buttons.continue')} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleInitiateSubmit} className="space-y-4">
            <InputGroup
              label={t('fields.phoneLabel')}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 20 7946 0912"
              error={fieldErrors.phone}
            />

            <InputGroup
              label={t('fields.addressLabel')}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="10 Downing Street, London"
              error={fieldErrors.streetAddress}
            />

            <InputGroup
              label={t('fields.idLabel')}
              value={governmentId}
              onChange={(e) => setGovernmentId(e.target.value)}
              placeholder={t('fields.idPlaceholder')}
              error={fieldErrors.governmentId}
            />

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#263346] bg-[#0B0F17]/50">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-[#263346] bg-[#0B0F17] text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                {t('termsText')}
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#263346] px-4 py-3.5 font-semibold text-slate-300 hover:bg-[#263346] transition"
              >
                <ArrowLeft size={16} /> {t('buttons.back')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Verification Code Input Screen */}
        {step === 3 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-xs text-slate-300 text-center">
              We have sent a 6-digit verification code to <span className="font-semibold text-white">{email}</span>. Please check your inbox.
            </p>

            <InputGroup
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
            >
              {loading ? t('buttons.creating') : t('buttons.openAccount')}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400">
          {t('footer.prompt')}{' '}
          <Link href="/login" className="font-semibold text-[#A78BFA] hover:underline">
            {t('footer.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}