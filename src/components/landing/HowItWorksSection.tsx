import { Cpu, Wifi, Database, Monitor, Brain, Bell, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Cpu,
    title: "IoT Sensors",
    subtitle: "Data Collection",
    description: "Glucose sensor, MAX30100 (heart rate & SpO₂), DHT11 (temperature & humidity) connected to ESP8266 microcontroller",
    color: "primary",
  },
  {
    icon: Wifi,
    title: "ESP8266 + Wi-Fi",
    subtitle: "Data Transmission",
    description: "NodeMCU ESP8266 transmits sensor readings over Wi-Fi to the cloud every few seconds",
    color: "info",
  },
  {
    icon: Database,
    title: "Firebase Realtime DB",
    subtitle: "Cloud Storage",
    description: "Data is stored in Firebase Realtime Database with structured paths for each patient's vitals",
    color: "warning",
  },
  {
    icon: Monitor,
    title: "Web Dashboard",
    subtitle: "Visualization",
    description: "React-based responsive dashboard displays real-time charts, trends, and health status indicators",
    color: "success",
  },
  {
    icon: Brain,
    title: "ML Anomaly Detection",
    subtitle: "Intelligent Analysis",
    description: "Machine learning models analyze patterns to detect anomalies and predict potential health risks",
    color: "primary",
  },
  {
    icon: Bell,
    title: "Alerts & Notifications",
    subtitle: "Proactive Care",
    description: "Instant alerts are triggered when readings exceed safe thresholds, notifying patients and doctors",
    color: "destructive",
  },
];

const HowItWorksSection = () => {
  const bgColors: Record<string, string> = {
    primary: "bg-primary/10",
    info: "bg-info/10",
    warning: "bg-warning/10",
    success: "bg-success/10",
    destructive: "bg-destructive/10",
  };
  const textColors: Record<string, string> = {
    primary: "text-primary",
    info: "text-info",
    warning: "text-warning",
    success: "text-success",
    destructive: "text-destructive",
  };
  const borderColors: Record<string, string> = {
    primary: "border-primary/30",
    info: "border-info/30",
    warning: "border-warning/30",
    success: "border-success/30",
    destructive: "border-destructive/30",
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-info/10 border border-info/20 rounded-full text-info text-sm font-medium mb-6">
            <Cpu size={16} />
            <span>System Architecture</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How <span className="gradient-text">DiaCare</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">
            End-to-end data flow from IoT sensors to intelligent health insights, 
            enabling continuous monitoring and proactive diabetes care.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="relative">
          {/* Connection Lines - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-info/20 to-success/20 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative group"
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold z-20 shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div 
                    className={`bg-card rounded-2xl p-6 shadow-card border ${borderColors[step.color]} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-14 h-14 ${bgColors[step.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${textColors[step.color]}`} />
                    </div>
                    <p className={`text-xs font-semibold ${textColors[step.color]} uppercase tracking-wider mb-1`}>
                      {step.subtitle}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow - only on desktop between items */}
                  {index < steps.length - 1 && index % 3 !== 2 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-30">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-16 p-6 bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl border border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                Seamless Data Pipeline
              </h3>
              <p className="text-muted-foreground">
                From sensor reading to dashboard display in under 1 second. Our architecture ensures 
                reliable, real-time health data transmission with Firebase's secure infrastructure 
                and intelligent anomaly detection at every step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
