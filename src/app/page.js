import HeroSection from "@/components/hero-section";
import ServicesOverview from "@/components/services-overview";
import VisionImpact from "@/components/vision-impact";
import HowItWorks from "@/components/how-it-works";
import CTASection from "@/components/cta-section";
import FooterEnhanced from "@/components/footer-enhanced";
import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <ServicesOverview />
      <HowItWorks />
      <VisionImpact />
      <CTASection />
      <FooterEnhanced />
    </>
  );
}
