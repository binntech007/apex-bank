// app/[locale]/page.tsx
import { LandingLoader } from '@/components/landing/LandingLoader';
import { TopBar } from '@/components/landing/TopBar';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { OnboardingSteps } from '@/components/landing/OnboardingSteps';
import { GlobalNetwork } from '@/components/landing/GlobalNetwork';
import { SecurityOverview } from '@/components/landing/SecurityOverview';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default async function Page() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white">
      <LandingLoader />
      
      {/* Sticky Header Wrapper Container */}
      <div className="sticky top-0 z-100 w-full">
        <TopBar />
        <Navbar />
      </div>

      <main className="flex-1 flex flex-col">
        <Hero />
        <Features />
        <OnboardingSteps />
        <GlobalNetwork />
        <SecurityOverview />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}