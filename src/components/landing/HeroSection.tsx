import { ArrowRight, Shield, Cpu, Heart, Activity, Zap, Users } from "lucide-react";
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
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium animate-fade-in">
              <Cpu size={16} />
              <span>IoT & Machine Learning Powered</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up">
              Smart Diabetes <br />
              <span className="gradient-text">Healthcare Monitoring</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Real-time health monitoring powered by IoT sensors and machine learning. 
              Get instant alerts, track your vitals, and share data with your healthcare provider—all in one platform.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Real-time Data</p>
                  <p className="text-xs text-muted-foreground">Instant vitals sync</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Smart Alerts</p>
                  <p className="text-xs text-muted-foreground">AI-powered warnings</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button 
                size="lg" 
                className="gradient-bg text-white px-8 py-6 text-lg font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2"
                onClick={() => navigate("/about")}
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-6 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary-end/80 border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Trusted by patients & doctors</p>
                <p className="text-xs text-muted-foreground">Secure, HIPAA-aware platform</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 border border-primary/10 rounded-full animate-pulse" />
                <div className="absolute w-64 h-64 border border-primary/15 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute w-48 h-48 border border-primary/20 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              </div>

              {/* Central Device */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 gradient-bg rounded-3xl shadow-2xl flex items-center justify-center animate-scale-in">
                <div className="text-center text-white">
                  <Heart className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-3xl font-bold">98</p>
                  <p className="text-sm opacity-80">BPM</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card rounded-2xl shadow-lg p-4 border border-border/50 animate-float z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Glucose</p>
                    <p className="font-bold text-foreground">120 mg/dL</p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Normal</span>
                </div>
              </div>

              <div className="absolute bottom-16 left-4 bg-card rounded-2xl shadow-lg p-4 border border-border/50 animate-float z-10" style={{ animationDelay: "-2s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                    <span className="text-info font-bold text-sm">°C</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="font-bold text-foreground">36.5°C</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-16 right-4 bg-card rounded-2xl shadow-lg p-4 border border-border/50 animate-float z-10" style={{ animationDelay: "-4s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">O₂</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SpO₂</p>
                    <p className="font-bold text-foreground">98%</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 right-0 bg-warning/10 border border-warning/30 rounded-xl p-3 animate-float z-10" style={{ animationDelay: "-1s" }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-warning">All Clear</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold gradient-text">24/7</p>
            <p className="text-sm text-muted-foreground">Real-time Monitoring</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold gradient-text">99%</p>
            <p className="text-sm text-muted-foreground">Detection Accuracy</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold gradient-text">&lt;1s</p>
            <p className="text-sm text-muted-foreground">Alert Response</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold gradient-text">100%</p>
            <p className="text-sm text-muted-foreground">Secure & Private</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
