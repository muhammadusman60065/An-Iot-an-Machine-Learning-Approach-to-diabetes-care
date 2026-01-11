import { Activity, Brain, Bell, Users, Shield, Smartphone, Heart, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Continuous tracking of glucose, heart rate, SpO₂, and temperature using ESP8266 IoT sensors with instant data sync.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "ML Anomaly Detection",
    description: "Advanced machine learning algorithms detect health anomalies before they become critical, enabling proactive care.",
    color: "info",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Immediate notifications when readings fall outside safe thresholds. Never miss a critical health event.",
    color: "warning",
  },
  {
    icon: Users,
    title: "Role-based Dashboards",
    description: "Tailored interfaces for patients, doctors, and administrators with appropriate access controls.",
    color: "success",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encryption and HIPAA-aware security ensures your health data remains completely confidential.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Interactive charts and historical trends help you understand patterns in your health data over time.",
    color: "info",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Zap size={16} />
            <span>Powerful Features</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need for <span className="gradient-text">Smart Health Monitoring</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            DiabetesCare combines cutting-edge IoT technology with machine learning 
            to provide a comprehensive diabetes management solution for patients and healthcare providers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const bgColors: Record<string, string> = {
              primary: "bg-primary/10",
              info: "bg-info/10",
              warning: "bg-warning/10",
              success: "bg-success/10",
            };
            const textColors: Record<string, string> = {
              primary: "text-primary",
              info: "text-info",
              warning: "text-warning",
              success: "text-success",
            };
            const borderColors: Record<string, string> = {
              primary: "group-hover:border-primary/30",
              info: "group-hover:border-info/30",
              warning: "group-hover:border-warning/30",
              success: "group-hover:border-success/30",
            };

            return (
              <div
                key={feature.title}
                className={`group bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in ${borderColors[feature.color]}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 ${bgColors[feature.color]} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${textColors[feature.color]}`} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-full">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full gradient-bg border-2 border-background flex items-center justify-center text-white text-xs font-bold">P</div>
              <div className="w-8 h-8 rounded-full gradient-bg border-2 border-background flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="w-8 h-8 rounded-full gradient-bg border-2 border-background flex items-center justify-center text-white text-xs font-bold">A</div>
            </div>
            <span className="text-sm text-muted-foreground pr-4">
              For <strong className="text-foreground">Patients</strong>, <strong className="text-foreground">Doctors</strong>, and <strong className="text-foreground">Admins</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
