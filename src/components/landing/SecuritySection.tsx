import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const badgeItemVariants = {
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
    <section id="security" className="py-24 bg-gradient-to-b from-background to-card/50 overflow-hidden">
      <div className="container">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Left Content */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-sm font-medium"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Shield size={16} />
              </motion.div>
              <span>Security & Privacy</span>
            </motion.div>
            
            <motion.h2 
              className="font-heading text-3xl md:text-4xl font-bold text-foreground"
              variants={itemVariants}
            >
              Your Health Data is <motion.span 
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
                Protected
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground text-lg"
              variants={itemVariants}
            >
              DiaCare is built with security as a core principle. Your sensitive health information 
              is protected through multiple layers of security, ensuring confidentiality and integrity.
            </motion.p>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div 
                    key={feature.title}
                    className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border/50 cursor-pointer group relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -3,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    {/* Hover gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    
                    <motion.div 
                      className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -10, 10, 0],
                      }}
                    >
                      <Icon className="w-5 h-5 text-success" />
                    </motion.div>
                    <div className="relative z-10">
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right - Security Badge */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <motion.div 
              className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Background gradient on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />

              <div className="text-center mb-8 relative z-10">
                <motion.div 
                  className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4"
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
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Security Highlights
                </h3>
                <p className="text-muted-foreground">
                  Built with healthcare data protection in mind
                </p>
              </div>

              <motion.div 
                className="space-y-4 relative z-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  "Role-based access control (RBAC)",
                  "Firebase security rules enabled",
                  "Encrypted data transmission (HTTPS)",
                  "Patient data isolation",
                  "Secure authentication flows",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3 p-3 bg-success/10 rounded-lg cursor-pointer"
                    variants={badgeItemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      x: 5,
                      backgroundColor: "hsl(var(--success) / 0.15)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      <CheckCircle className="w-5 h-5 text-success" />
                    </motion.div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-5 h-5 text-info mt-0.5" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Educational Project Note</p>
                    <p className="text-xs text-muted-foreground">
                      This is a final year project demonstrating IoT healthcare concepts. 
                      For production use, additional compliance measures (HIPAA, GDPR) would be required.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-24 h-24 bg-success/10 rounded-full blur-2xl z-0"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div 
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl z-0"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
