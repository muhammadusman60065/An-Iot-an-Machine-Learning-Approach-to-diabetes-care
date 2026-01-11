import { 
  Activity, Brain, Bell, Users, Shield, BarChart3, 
  FileText, Calendar, Settings, MessageSquare, 
  Phone, Heart, Zap, Download
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-time Vital Monitoring",
    description: "Continuous tracking of glucose, heart rate, SpO₂, temperature, and humidity with live data sync every few seconds.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Historical Trends & Charts",
    description: "Interactive charts displaying health patterns over time. Analyze trends to understand your health better.",
    color: "info",
  },
  {
    icon: Bell,
    title: "Smart Health Alerts",
    description: "Instant notifications when readings exceed safe thresholds. Never miss a critical health event with severity-based alerts.",
    color: "warning",
  },
  {
    icon: FileText,
    title: "PDF Health Reports",
    description: "Generate and download comprehensive health reports in PDF format. Select date ranges up to 30 days for detailed analysis.",
    color: "success",
  },
  {
    icon: Calendar,
    title: "Appointment Management",
    description: "Schedule appointments with your assigned doctor. View upcoming consultations and manage your healthcare calendar.",
    color: "primary",
  },
  {
    icon: Settings,
    title: "Complete Profile & Settings",
    description: "Manage your profile, emergency contacts, notification preferences, and display settings all in one place.",
    color: "info",
  },
  {
    icon: Phone,
    title: "Emergency Contacts",
    description: "Store emergency contact information for quick access during critical situations. Keep your loved ones informed.",
    color: "destructive",
  },
  {
    icon: MessageSquare,
    title: "AI Health Chatbot",
    description: "Get instant answers to diabetes-related questions with our AI-powered chatbot assistant available 24/7.",
    color: "success",
  },
  {
    icon: Brain,
    title: "ML Anomaly Detection",
    description: "Advanced machine learning algorithms detect unusual patterns and predict potential health risks before they escalate.",
    color: "primary",
  },
];

const FeaturesSection = () => {
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
    primary: "group-hover:border-primary/30",
    info: "group-hover:border-info/30",
    warning: "group-hover:border-warning/30",
    success: "group-hover:border-success/30",
    destructive: "group-hover:border-destructive/30",
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-card/50 to-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Zap size={16} />
            <span>Platform Features</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Complete <span className="gradient-text">Health Management</span> Suite
          </h2>
          <p className="text-muted-foreground text-lg">
            DiaCare provides everything you need for comprehensive diabetes care—from real-time monitoring 
            to intelligent insights, reports, and seamless care coordination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in ${borderColors[feature.color]}`}
                style={{ animationDelay: `${index * 0.05}s` }}
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
      </div>
    </section>
  );
};

export default FeaturesSection;
