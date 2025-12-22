import { Activity, Brain, Bell, Users, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Continuous tracking of glucose, heart rate, and temperature using ESP8266 IoT sensors.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "ML Anomaly Detection",
    description: "Advanced machine learning algorithms detect health anomalies before they become critical.",
    color: "info",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Immediate notifications when readings fall outside safe thresholds.",
    color: "warning",
  },
  {
    icon: Users,
    title: "Role-based Access",
    description: "Tailored dashboards for patients, doctors, and administrators.",
    color: "success",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encryption ensures your health data remains confidential.",
    color: "primary",
  },
  {
    icon: Smartphone,
    title: "Accessible Anywhere",
    description: "Access your health data from any device, anytime, anywhere.",
    color: "info",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Health Monitoring
          </h2>
          <p className="text-muted-foreground text-lg">
            DiabetesCare integrates cutting-edge IoT technology with machine learning 
            to provide a complete diabetes management solution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const bgColors: Record<string, string> = {
              primary: "bg-primary-light",
              info: "bg-info-light",
              warning: "bg-warning-light",
              success: "bg-success-light",
            };
            const textColors: Record<string, string> = {
              primary: "text-primary",
              info: "text-info",
              warning: "text-warning",
              success: "text-success",
            };

            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 ${bgColors[feature.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${textColors[feature.color]}`} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
