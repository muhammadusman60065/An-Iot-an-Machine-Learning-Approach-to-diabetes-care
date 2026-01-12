import { ArrowRight, Shield, Cpu, Heart, Activity, Zap, Wifi, Database, Brain, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
const HeroSection = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const rotateVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-info/10 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        {/* Grid pattern */}
        <motion.div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"
          style={{ y }}
        />
      </div>

      <motion.div 
        className="container relative z-10"
        style={{ opacity, scale }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.1,
          delayChildren: 0.2,
        }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Project Badge */}
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={itemVariants}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Cpu size={16} />
                </motion.div>
                <span>IoT + Machine Learning</span>
              </motion.div>
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-sm font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart size={16} />
                </motion.div>
                <span>Healthcare Innovation</span>
              </motion.div>
            </motion.div>

            <motion.h1 
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              variants={itemVariants}
            >
              <motion.span 
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
              className="text-xl md:text-2xl text-foreground font-semibold"
              variants={itemVariants}
            >
              Smart Diabetes Healthcare Monitoring System
            </motion.p>

            <motion.p 
              className="text-lg text-muted-foreground max-w-xl"
              variants={itemVariants}
            >
              A comprehensive IoT and Machine Learning-powered platform for real-time diabetes monitoring, 
              predictive health analytics, and seamless care coordination between patients and healthcare providers.
            </motion.p>

            {/* Key Benefits */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={itemVariants}
            >
              {[
                { icon: Activity, color: "success", title: "Real-time Vitals", desc: "24/7 health monitoring" },
                { icon: Brain, color: "primary", title: "ML Predictions", desc: "Anomaly detection AI" },
                { icon: Bell, color: "warning", title: "Instant Alerts", desc: "Critical notifications" },
                { icon: Shield, color: "info", title: "Secure Platform", desc: "Protected health data" },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-sm cursor-pointer"
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-lg bg-${benefit.color}/10 flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-6 h-6 text-${benefit.color}`} />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div 
              className="flex flex-wrap gap-4"
              variants={itemVariants}
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
                    Enter Dashboard
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} className="ml-2" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold border-2 relative overflow-hidden group"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <motion.span
                    className="absolute inset-0 bg-primary/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative">How It Works</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Project Info */}
            <motion.div 
              className="flex items-center gap-4 pt-6 border-t border-border/50"
              variants={itemVariants}
            >
              {[
                { label: "Project Type", value: "Final Year Project" },
                { label: "Domain", value: "IoT & Healthcare" },
                { label: "Technology", value: "React + Firebase" },
              ].map((info, index) => (
                <motion.div
                  key={info.label}
                  className="px-4 py-2 bg-accent rounded-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="text-sm font-semibold text-foreground">{info.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-80 h-80 border border-primary/10 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div 
                  className="absolute w-64 h-64 border border-primary/15 rounded-full"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div 
                  className="absolute w-48 h-48 border border-primary/20 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>

              {/* Central Device */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 gradient-bg rounded-3xl shadow-2xl flex items-center justify-center z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.5,
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                <div className="text-center text-white">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-12 h-12 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-3xl font-bold">DiaCare</p>
                  <p className="text-sm opacity-80">IoT Health</p>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div 
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-card rounded-2xl shadow-lg p-4 border border-border/50 z-10"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05, y: -20 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="w-5 h-5 text-success" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">Glucose Level</p>
                    <motion.p 
                      className="font-bold text-foreground"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      120 mg/dL
                    </motion.p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Normal</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-16 left-4 bg-card rounded-2xl shadow-lg p-4 border border-border/50 z-10"
                animate={{ 
                  y: [0, -20, 0],
                  x: [0, 5, 0],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-5 h-5 text-info" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="font-bold text-foreground">78 BPM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-0 right-10 bg-card rounded-2xl shadow-lg p-4 border border-border/50 z-10"
                animate={{ 
                  y: [0, -18, 0],
                  x: [0, -5, 0],
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-primary font-bold text-sm">O₂</span>
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground">SpO₂</p>
                    <p className="font-bold text-foreground">98%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute top-1/3 right-0 bg-warning/10 border border-warning/30 rounded-xl p-3 z-10"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wifi className="w-5 h-5 text-warning" />
                  </motion.div>
                  <span className="text-sm font-medium text-warning">Live Sync</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { value: "24/7", label: "Continuous Monitoring" },
            { value: "5+", label: "Vital Parameters" },
            { value: "<1s", label: "Real-time Sync" },
            { value: "4", label: "User Roles" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: index * 0.1 + 0.5,
              }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <motion.p 
                className="font-heading text-3xl font-bold gradient-text"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.2,
                }}
                style={{
                  backgroundSize: "200% auto",
                }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
