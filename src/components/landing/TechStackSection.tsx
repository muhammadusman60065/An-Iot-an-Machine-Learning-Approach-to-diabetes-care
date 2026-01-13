import { Cpu, Database, Cloud, Wifi, Code, Layers, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

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
  const techCategories = [
    { title: "Frontend", subtitle: "Web Application", icon: Code, color: "primary", tech: frontendTech },
    { title: "Backend", subtitle: "Cloud Infrastructure", icon: Cloud, color: "info", tech: backendTech },
    { title: "IoT Hardware", subtitle: "Sensors & Microcontroller", icon: Cpu, color: "success", tech: hardwareTech },
    { title: "Machine Learning", subtitle: "Intelligent Analysis", icon: Zap, color: "warning", tech: mlTech },
  ];

  const bgColors: Record<string, string> = {
    primary: "bg-primary/10",
    info: "bg-info/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
  };

  const textColors: Record<string, string> = {
    primary: "text-primary",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
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
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const techItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section id="technology" className="py-24 bg-gradient-to-b from-card/50 to-background overflow-hidden">
      <div className="container">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-full text-warning text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              <Layers size={16} />
            </motion.div>
            <span>Technology Stack</span>
          </motion.div>
          <motion.h2 
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Built with <motion.span 
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
              Modern Technology
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            DiaCare leverages cutting-edge technologies across frontend, backend, hardware, and machine learning 
            to deliver a robust, scalable healthcare monitoring solution.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {techCategories.map((category, index) => {
            const Icon = category.icon;
            const isML = category.title === "Machine Learning";
            return (
              <motion.div
                key={category.title}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 relative overflow-hidden group cursor-pointer"
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Hover gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br from-${category.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={false}
                />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <motion.div 
                    className={`w-12 h-12 ${bgColors[category.color]} rounded-xl flex items-center justify-center`}
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -10, 10, 0],
                    }}
                  >
                    <Icon className={`w-6 h-6 ${textColors[category.color]}`} />
                  </motion.div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                  </div>
                </div>
                <motion.div 
                  className={`grid ${isML ? 'grid-cols-1' : 'grid-cols-2'} gap-3 relative z-10`}
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {category.tech.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      className="p-3 bg-accent/50 rounded-lg cursor-pointer"
                      variants={techItemVariants}
                      whileHover={{ 
                        scale: 1.05,
                        y: -2,
                        backgroundColor: "hsl(var(--accent))",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-medium text-foreground text-sm">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Architecture Summary */}
        <motion.div 
          className="mt-12 p-6 bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl border border-border/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="grid md:grid-cols-3 gap-6 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Wifi, title: "IoT Layer", desc: "ESP8266 collects sensor data and transmits via Wi-Fi" },
              { icon: Database, title: "Cloud Layer", desc: "Firebase provides real-time sync and secure storage" },
              { icon: Code, title: "Application Layer", desc: "React dashboard with ML-powered insights" },
            ].map((layer, index) => {
              const LayerIcon = layer.icon;
              return (
                <motion.div
                  key={layer.title}
                  variants={techItemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-3"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  >
                    <LayerIcon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-1">{layer.title}</h4>
                  <p className="text-sm text-muted-foreground">{layer.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
