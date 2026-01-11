import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Secure Authentication",
    description: "Role-based login with Firebase Authentication ensures only authorized users access the platform.",
  },
  {
    icon: Eye,
    title: "Access Control",
    description: "Granular permissions ensure patients see only their data, while doctors access assigned patients only.",
  },
  {
    icon: Server,
    title: "Firebase Security Rules",
    description: "Database read/write rules enforce data isolation and prevent unauthorized access at the server level.",
  },
  {
    icon: Shield,
    title: "Data Encryption",
    description: "All data transmission is encrypted using HTTPS/TLS protocols to protect sensitive health information.",
  },
];

const SecuritySection = () => {
  return (
    <section id="security" className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-sm font-medium">
              <Shield size={16} />
              <span>Security & Privacy</span>
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Your Health Data is <span className="gradient-text">Protected</span>
            </h2>
            
            <p className="text-muted-foreground text-lg">
              DiaCare is built with security as a core principle. Your sensitive health information 
              is protected through multiple layers of security, ensuring confidentiality and integrity.
            </p>

            <div className="space-y-4">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Security Badge */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50">
              <div className="text-center mb-8">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Security Highlights
                </h3>
                <p className="text-muted-foreground">
                  Built with healthcare data protection in mind
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground font-medium">Role-based access control (RBAC)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground font-medium">Firebase security rules enabled</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground font-medium">Encrypted data transmission (HTTPS)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground font-medium">Patient data isolation</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground font-medium">Secure authentication flows</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Educational Project Note</p>
                    <p className="text-xs text-muted-foreground">
                      This is a final year project demonstrating IoT healthcare concepts. 
                      For production use, additional compliance measures (HIPAA, GDPR) would be required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
