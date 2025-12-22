import { ArrowRight, Shield, Cpu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-primary text-sm font-medium animate-fade-in">
              <Cpu size={16} />
              <span>IoT & Machine Learning Powered</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up">
              Smart Healthcare for{" "}
              <span className="gradient-text">Diabetes</span>{" "}
              Management
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              DiabetesCare combines IoT sensors with advanced ML algorithms to provide 
              real-time health monitoring, anomaly detection, and personalized care 
              for diabetes patients.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" onClick={() => navigate("/login")}>
                Get Started
                <ArrowRight size={20} />
              </Button>
              <Button variant="heroOutline" onClick={() => navigate("/about")}>
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">Real-time Monitoring</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">99%</p>
                <p className="text-sm text-muted-foreground">Detection Accuracy</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">&lt;1s</p>
                <p className="text-sm text-muted-foreground">Alert Response</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Central Device */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-card rounded-3xl shadow-xl flex items-center justify-center glass-card animate-scale-in">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-heading text-foreground">98</p>
                  <p className="text-sm text-muted-foreground">BPM</p>
                </div>
              </div>

              {/* Orbiting Cards */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-card rounded-2xl shadow-lg p-4 glass-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                    <span className="text-success font-bold">G</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Glucose</p>
                    <p className="font-bold text-foreground">120 mg/dL</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 bg-card rounded-2xl shadow-lg p-4 glass-card animate-float" style={{ animationDelay: "-2s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                    <span className="text-info font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="font-bold text-foreground">36.5°C</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-0 bg-card rounded-2xl shadow-lg p-4 glass-card animate-float" style={{ animationDelay: "-4s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-bold text-success">Normal</p>
                  </div>
                </div>
              </div>

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50%" cy="50%" r="30%" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
