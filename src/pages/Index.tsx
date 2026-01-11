import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import RolesSection from "@/components/landing/RolesSection";
import TechStackSection from "@/components/landing/TechStackSection";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <RolesSection />
        <section id="technology">
          <TechStackSection />
        </section>
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
      <DiabetesChatbot />
    </div>
  );
};

export default Index;
