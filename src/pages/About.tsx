import { ArrowLeft, Cpu, Database, Cloud, Activity, Brain, Shield, Heart, Target, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const About = () => {
  const navigate = useNavigate();

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
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="container flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="md" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Title Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Heart size={16} />
              </motion.div>
              <span>Project Information</span>
            </motion.div>
            
            <motion.h1 
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              About <motion.span 
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
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              An IoT and Machine Learning-powered diabetes healthcare monitoring system 
              designed to provide real-time health tracking and intelligent insights.
            </motion.p>
          </motion.div>

          {/* Content Sections */}
          <motion.div 
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Project Overview */}
            <motion.section 
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50"
              variants={cardVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="flex items-center gap-4 mb-6"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
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
                  <Target className="w-6 h-6 text-primary" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Project Overview</h2>
              </motion.div>
              <motion.p 
                className="text-muted-foreground leading-relaxed mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                DiaCare is a comprehensive healthcare monitoring platform that combines IoT sensor technology 
                with machine learning algorithms to provide continuous diabetes monitoring and proactive health management.
              </motion.p>
              <motion.p 
                className="text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                This system enables patients, doctors, family members, and administrators to collaborate effectively 
                in managing diabetes through real-time data collection, intelligent analysis, and timely alerts.
              </motion.p>
            </motion.section>

            {/* Key Features */}
            <motion.section 
              variants={cardVariants}
            >
              <motion.h2 
                className="font-heading text-2xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Key Features
              </motion.h2>
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  { icon: Activity, title: "Real-time Monitoring", desc: "Continuous tracking of vital health parameters" },
                  { icon: Brain, title: "ML-Powered Insights", desc: "Intelligent anomaly detection and predictions" },
                  { icon: Shield, title: "Secure Platform", desc: "Role-based access control and data encryption" },
                  { icon: Users, title: "Multi-User Support", desc: "Dedicated dashboards for different user roles" },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border/50"
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.02,
                        y: -3,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.div 
                        className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"
                        whileHover={{ 
                          scale: 1.15,
                          rotate: [0, -10, 10, 0],
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.section>

            {/* Technology Stack */}
            <motion.section 
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50"
              variants={cardVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="flex items-center gap-4 mb-6"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center"
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <Zap className="w-6 h-6 text-info" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold text-foreground">Technology Stack</h2>
              </motion.div>
              <motion.div 
                className="grid md:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { icon: Cpu, category: "Frontend", tech: ["React", "TypeScript", "Tailwind CSS"] },
                  { icon: Cloud, category: "Backend", tech: ["Firebase", "Realtime DB", "Auth"] },
                  { icon: Database, category: "Hardware", tech: ["ESP8266", "Sensors", "IoT"] },
                ].map((stack, index) => {
                  const Icon = stack.icon;
                  return (
                    <motion.div
                      key={stack.category}
                      className="p-4 bg-accent/50 rounded-xl"
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "hsl(var(--accent))",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{stack.category}</h3>
                      </div>
                      <ul className="space-y-1">
                        {stack.tech.map((tech, techIndex) => (
                          <motion.li
                            key={tech}
                            className="text-sm text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: techIndex * 0.1 + index * 0.2 }}
                            whileHover={{ x: 5 }}
                          >
                            • {tech}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.section>

            {/* Project Info */}
            <motion.section 
              className="bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl p-8 border border-border/50"
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <motion.h2 
                className="font-heading text-2xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Project Information
              </motion.h2>
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { label: "Project Type", value: "Final Year Project" },
                  { label: "Domain", value: "IoT & Healthcare" },
                  { label: "Technology", value: "React + Firebase + ESP8266" },
                  { label: "Focus", value: "Diabetes Monitoring & Management" },
                ].map((info, index) => (
                  <motion.div
                    key={info.label}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl"
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{info.label}</p>
                      <p className="font-semibold text-foreground">{info.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            {/* CTA */}
            <motion.div 
              className="text-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="gradient-bg text-white px-8 py-6 text-lg font-semibold shadow-lg relative overflow-hidden group"
                  onClick={() => navigate("/")}
                >
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative flex items-center">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
