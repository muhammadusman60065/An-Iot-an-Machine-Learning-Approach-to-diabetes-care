import Logo from "@/components/Logo";
import { Github, Heart, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <footer className="bg-card border-t border-border py-16 overflow-hidden">
      <div className="container">
        <motion.div 
          className="grid md:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand */}
          <motion.div 
            className="md:col-span-2 space-y-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size="md" />
            </motion.div>
            <p className="text-muted-foreground max-w-md">
              DiaCare is an IoT and Machine Learning-powered diabetes healthcare monitoring system. 
              This project demonstrates real-time health data collection, intelligent analysis, 
              and seamless care coordination for better diabetes management.
            </p>
            <motion.div 
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-destructive" />
              </motion.div>
              <span>Built with care for better healthcare</span>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-heading font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              {[
                { href: "#features", label: "Features" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#technology", label: "Technology Stack" },
                { href: "#security", label: "Security & Privacy" },
                { to: "/about", label: "About Project", isLink: true },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {link.isLink ? (
                    <Link 
                      to={link.to!}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </Link>
                  ) : (
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Access */}
          <motion.div variants={itemVariants}>
            <h4 className="font-heading font-semibold text-foreground mb-4">Access Portal</h4>
            <ul className="space-y-3">
              {[
                { to: "/login", label: "Patient Login" },
                { to: "/login", label: "Doctor Login" },
                { to: "/login", label: "Admin Login" },
                { to: "/iot-dashboard", label: "IoT Demo Dashboard" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  <Link 
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </motion.div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Tech Stack Badge */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {["React", "TypeScript", "Tailwind CSS", "Firebase", "ESP8266", "IoT", "Machine Learning"].map((tech, index) => (
            <motion.span 
              key={tech}
              className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full cursor-pointer"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: index * 0.05 + 0.5,
              }}
              whileHover={{ 
                scale: 1.1,
                y: -2,
                backgroundColor: "hsl(var(--primary) / 0.1)",
              }}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} DiaCare. Final Year Project.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              IoT + Machine Learning Healthcare Monitoring System
            </p>
          </div>
          
          <motion.div 
            className="flex items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.a 
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.2,
                rotate: [0, -10, 10, 0],
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Github size={20} />
            </motion.a>
            <motion.a 
              href="mailto:contact@diacare.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Contact Email"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.2,
                y: -2,
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Mail size={20} />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
