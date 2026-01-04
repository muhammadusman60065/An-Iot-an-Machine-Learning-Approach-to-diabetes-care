import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TechStackSection from "@/components/landing/TechStackSection";
import Footer from "@/components/landing/Footer";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="technology">
          <TechStackSection />
        </section>
      </main>
      <Footer />
      <DiabetesChatbot />
    </div>
  );
};

export default Index;
