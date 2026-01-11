import { Cpu, Database, Cloud, Wifi, Code, Layers, Zap, Shield } from "lucide-react";

const frontendTech = [
  { name: "React 18", description: "Modern UI library" },
  { name: "Vite", description: "Fast build tool" },
  { name: "TypeScript", description: "Type-safe code" },
  { name: "Tailwind CSS", description: "Utility-first styling" },
  { name: "shadcn/ui", description: "Beautiful components" },
  { name: "Recharts", description: "Data visualization" },
];

const backendTech = [
  { name: "Firebase Realtime DB", description: "Real-time data sync" },
  { name: "Firebase Auth", description: "Secure authentication" },
  { name: "Edge Functions", description: "Serverless logic" },
  { name: "Cloud Storage", description: "File management" },
];

const hardwareTech = [
  { name: "ESP8266 NodeMCU", description: "WiFi microcontroller" },
  { name: "MAX30100", description: "Heart rate & SpO₂ sensor" },
  { name: "DHT11", description: "Temperature & humidity" },
  { name: "Glucose Sensor", description: "Blood glucose monitoring" },
];

const mlTech = [
  { name: "Anomaly Detection", description: "Pattern recognition" },
  { name: "Threshold Analysis", description: "Real-time alerts" },
  { name: "Trend Prediction", description: "Health forecasting" },
];

const TechStackSection = () => {
  return (
    <section id="technology" className="py-24 bg-gradient-to-b from-card/50 to-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-full text-warning text-sm font-medium mb-6">
            <Layers size={16} />
            <span>Technology Stack</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built with <span className="gradient-text">Modern Technology</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            DiaCare leverages cutting-edge technologies across frontend, backend, hardware, and machine learning 
            to deliver a robust, scalable healthcare monitoring solution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Frontend */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Frontend</h3>
                <p className="text-sm text-muted-foreground">Web Application</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {frontendTech.map((tech) => (
                <div key={tech.name} className="p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-info" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Backend</h3>
                <p className="text-sm text-muted-foreground">Cloud Infrastructure</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {backendTech.map((tech) => (
                <div key={tech.name} className="p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hardware */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">IoT Hardware</h3>
                <p className="text-sm text-muted-foreground">Sensors & Microcontroller</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {hardwareTech.map((tech) => (
                <div key={tech.name} className="p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ML */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Machine Learning</h3>
                <p className="text-sm text-muted-foreground">Intelligent Analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {mlTech.map((tech) => (
                <div key={tech.name} className="p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Summary */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl border border-border/50">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">IoT Layer</h4>
              <p className="text-sm text-muted-foreground">ESP8266 collects sensor data and transmits via Wi-Fi</p>
            </div>
            <div>
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Cloud Layer</h4>
              <p className="text-sm text-muted-foreground">Firebase provides real-time sync and secure storage</p>
            </div>
            <div>
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Application Layer</h4>
              <p className="text-sm text-muted-foreground">React dashboard with ML-powered insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
