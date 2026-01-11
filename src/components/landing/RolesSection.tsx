import { User, Stethoscope, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    icon: User,
    title: "Patient",
    description: "View your real-time vitals, historical trends, health alerts, and manage your profile. Download PDF reports and book appointments with your doctor.",
    features: ["Real-time vitals dashboard", "Health alerts & notifications", "PDF report generation", "Appointment booking", "Profile & settings management"],
    color: "primary",
    gradient: "from-primary to-primary-end",
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    description: "Monitor all assigned patients, view their health data, respond to critical alerts, and manage appointments. Make informed decisions with comprehensive patient insights.",
    features: ["Multi-patient monitoring", "Critical alert management", "Patient health history", "Appointment management", "Care recommendations"],
    color: "info",
    gradient: "from-info to-primary",
  },
  {
    icon: Users,
    title: "Family Member",
    description: "Stay informed about your loved one's health status. Receive notifications for critical alerts and access read-only health summaries for peace of mind.",
    features: ["Health status overview", "Emergency notifications", "Read-only access", "Peace of mind monitoring"],
    color: "success",
    gradient: "from-success to-info",
  },
  {
    icon: ShieldCheck,
    title: "Administrator",
    description: "Full system administration including user management, analytics, system alerts, and configuration. Ensure smooth operation of the entire platform.",
    features: ["User management", "System analytics", "Platform configuration", "Access control", "System health monitoring"],
    color: "warning",
    gradient: "from-warning to-destructive",
  },
];

const RolesSection = () => {
  const navigate = useNavigate();

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

  return (
    <section id="roles" className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-sm font-medium mb-6">
            <Users size={16} />
            <span>Role-Based Access</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tailored <span className="gradient-text">Dashboards</span> for Everyone
          </h2>
          <p className="text-muted-foreground text-lg">
            DiaCare provides specialized interfaces for each user role, ensuring everyone has access 
            to the features and information they need for optimal diabetes care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
                
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 ${bgColors[role.color]} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${textColors[role.color]}`} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {role.title}
                      </h3>
                      <p className={`text-sm font-medium ${textColors[role.color]}`}>
                        Dashboard Access
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${bgColors[role.color].replace('/10', '')}`} />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="gradient-bg text-white px-8 py-6 text-lg font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-105"
            onClick={() => navigate("/login")}
          >
            Access Your Dashboard
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
