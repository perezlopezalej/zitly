import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { Navigation } from '@/components/landing/navigation'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { MetricsSection } from '@/components/landing/metrics-section'
import { IntegrationsSection } from '@/components/landing/integrations-section'
import { SecuritySection } from '@/components/landing/security-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CtaSection } from '@/components/landing/cta-section'
import { FooterSection } from '@/components/landing/footer-section'

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
