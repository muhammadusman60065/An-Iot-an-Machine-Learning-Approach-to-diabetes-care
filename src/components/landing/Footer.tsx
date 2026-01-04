import Logo from "@/components/Logo";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground">
              An IoT and Machine Learning approach to diabetes care. 
              Final year project demonstrating scalable healthcare solutions.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Technology
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Project
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Roles</h4>
            <ul className="space-y-2">
              <li>
                <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Patient Portal
                </a>
              </li>
              <li>
                <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Doctor Dashboard
                </a>
              </li>
              <li>
                <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DiabetesCare. Final Year Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
