import Logo from "@/components/Logo";
import { Github, Heart, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-muted-foreground max-w-md">
              DiaCare is an IoT and Machine Learning-powered diabetes healthcare monitoring system. 
              This project demonstrates real-time health data collection, intelligent analysis, 
              and seamless care coordination for better diabetes management.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-destructive" />
              <span>Built with care for better healthcare</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#features" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#how-it-works" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#technology" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Technology Stack
                </a>
              </li>
              <li>
                <a 
                  href="#security" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Security & Privacy
                </a>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  About Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Access Portal</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Patient Login
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Doctor Login
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Admin Login
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/iot-dashboard" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  IoT Demo Dashboard
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack Badge */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
          {["React", "TypeScript", "Tailwind CSS", "Firebase", "ESP8266", "IoT", "Machine Learning"].map((tech) => (
            <span 
              key={tech}
              className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} DiaCare. Final Year Project.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              IoT + Machine Learning Healthcare Monitoring System
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
            >
              <Github size={20} />
            </a>
            <a 
              href="mailto:contact@diacare.com" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Contact Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
