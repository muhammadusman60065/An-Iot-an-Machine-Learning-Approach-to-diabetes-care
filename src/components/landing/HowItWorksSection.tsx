import { Cpu, Wifi, Database, Monitor, Brain, Bell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-card/50 overflow-hidden">
      <div className="container">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-info/10 border border-info/20 rounded-full text-info text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Cpu size={16} />
            </motion.div>
            <span>System Architecture</span>
          </motion.div>
          <motion.h2 
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            How <motion.span 
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
              DiaCare
            </motion.span> Works
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            End-to-end data flow from IoT sensors to intelligent health insights, 
            enabling continuous monitoring and proactive diabetes care.
          </motion.p>
        </motion.div>

        {/* Flow Diagram */}
        <div className="relative">
          {/* Connection Lines - Desktop */}
          <motion.div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-info/20 to-success/20 -translate-y-1/2 z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
            style={{ transformOrigin: "left" }}
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="relative group"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Step Number */}
                  <motion.div 
                    className="absolute -top-3 -left-3 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold z-20 shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: index * 0.1 + 0.3,
                    }}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                  >
                    {index + 1}
                  </motion.div>
                  
                  <div 
                    className={`bg-card rounded-2xl p-6 shadow-card border ${borderColors[step.color]} hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden cursor-pointer`}
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className={`w-full h-full bg-gradient-to-br ${
                        step.color === 'primary' ? 'from-primary/5 to-transparent' :
                        step.color === 'info' ? 'from-info/5 to-transparent' :
                        step.color === 'warning' ? 'from-warning/5 to-transparent' :
                        step.color === 'success' ? 'from-success/5 to-transparent' :
                        'from-destructive/5 to-transparent'
                      }`} />
                    </div>
                    
                    <motion.div 
                      className={`w-14 h-14 ${bgColors[step.color]} rounded-xl flex items-center justify-center mb-4 relative z-10`}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className={`w-7 h-7 ${textColors[step.color]}`} />
                    </motion.div>
                    <p className={`text-xs font-semibold ${textColors[step.color]} uppercase tracking-wider mb-1 relative z-10`}>
                      {step.subtitle}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow - only on desktop between items */}
                  {index < steps.length - 1 && index % 3 !== 2 && (
                    <motion.div 
                      className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-30"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.6 }}
                    >
                      <motion.div
                        animate={{ 
                          x: [0, 5, 0],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      >
                        <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div 
          className="mt-16 p-6 bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl border border-border/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center flex-shrink-0"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Database className="w-8 h-8 text-white" />
            </motion.div>
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
