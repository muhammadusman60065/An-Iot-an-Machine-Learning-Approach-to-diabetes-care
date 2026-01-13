import { User, Stethoscope, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const roles = [
  {
    icon: User,
    title: "Patient",
    description: "View your real-time vitals, historical trends, health alerts, and manage your profile. Download PDF reports and stay connected with your healthcare team.",
    features: ["Real-time vitals dashboard", "Health alerts & notifications", "PDF report generation", "Profile & settings management"],
    color: "primary",
    gradient: "from-primary to-primary-end",
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    description: "Monitor all assigned patients, view their health data, respond to critical alerts, and add new patients via email. Make informed decisions with comprehensive patient insights.",
    features: ["Multi-patient monitoring", "Critical alert management", "Patient health history", "Add patients via email", "Care recommendations"],
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
    description: "Full system administration including user management, patient/doctor management, family access control, and system monitoring. Ensure smooth operation of the entire platform.",
    features: ["Patient & doctor management", "Family access control", "System analytics", "Access control", "System health monitoring"],
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <section id="roles" className="py-24 bg-gradient-to-b from-background to-card/50 overflow-hidden">
      <div className="container">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={16} />
            </motion.div>
            <span>Role-Based Access</span>
          </motion.div>
          <motion.h2 
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tailored <motion.span 
              className="gradient-text inline-block"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% auto",
              }}
            >
              Dashboards
            </motion.span> for Everyone
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            DiaCare provides specialized interfaces for each user role, ensuring everyone has access 
            to the features and information they need for optimal diabetes care.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-xl transition-all duration-300 relative"
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Gradient Header */}
                <motion.div 
                  className={`h-2 bg-gradient-to-r ${role.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  style={{ transformOrigin: "left" }}
                />
                
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                      className={`w-14 h-14 ${bgColors[role.color]} rounded-xl flex items-center justify-center flex-shrink-0 relative z-10`}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -10, 10, 0],
                      }}
                    >
                      <Icon className={`w-7 h-7 ${textColors[role.color]}`} />
                    </motion.div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {role.title}
                      </h3>
                      <p className={`text-sm font-medium ${textColors[role.color]}`}>
                        Dashboard Access
                      </p>
                    </div>
                  </div>
                  
                  <motion.p 
                    className="text-muted-foreground mb-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    {role.description}
                  </motion.p>
                  
                  <motion.ul 
                    className="space-y-2"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {role.features.map((feature, idx) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center gap-2 text-sm"
                        variants={featureVariants}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className={`w-1.5 h-1.5 rounded-full ${bgColors[role.color].replace('/10', '')}`}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            delay: idx * 0.1 + index * 0.3,
                          }}
                        />
                        <span className="text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="gradient-bg text-white px-8 py-6 text-lg font-semibold shadow-lg hover:opacity-90 transition-all relative overflow-hidden group"
              onClick={() => navigate("/login")}
            >
              <motion.span
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative flex items-center">
                Access Your Dashboard
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} className="ml-2" />
                </motion.div>
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RolesSection;
