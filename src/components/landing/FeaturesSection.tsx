import { 
  Activity, Brain, Bell, Users, Shield, BarChart3, 
  FileText, Calendar, Settings, MessageSquare, 
  Phone, Heart, Zap, Download
} from "lucide-react";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-card/50 to-background overflow-hidden">
      <div className="container">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6"
            whileHover={{ scale: 1.05, y: -2 }}
            animate={{ 
              boxShadow: [
                "0 0 0px rgba(102, 126, 234, 0)",
                "0 0 20px rgba(102, 126, 234, 0.3)",
                "0 0 0px rgba(102, 126, 234, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              <Zap size={16} />
            </motion.div>
            <span>Platform Features</span>
          </motion.div>
          <motion.h2 
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Complete <motion.span 
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
              Health Management
            </motion.span> Suite
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            DiaCare provides everything you need for comprehensive diabetes care—from real-time monitoring 
            to intelligent insights, reports, and seamless care coordination.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`group bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${borderColors[feature.color]}`}
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className={`w-full h-full bg-gradient-to-br ${
                    feature.color === 'primary' ? 'from-primary/5 to-transparent' :
                    feature.color === 'info' ? 'from-info/5 to-transparent' :
                    feature.color === 'warning' ? 'from-warning/5 to-transparent' :
                    feature.color === 'success' ? 'from-success/5 to-transparent' :
                    'from-destructive/5 to-transparent'
                  }`} />
                </div>
                
                <motion.div 
                  className={`w-14 h-14 ${bgColors[feature.color]} rounded-xl flex items-center justify-center mb-5 relative z-10`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    <Icon className={`w-7 h-7 ${textColors[feature.color]}`} />
                  </motion.div>
                </motion.div>
                
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  initial={false}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
