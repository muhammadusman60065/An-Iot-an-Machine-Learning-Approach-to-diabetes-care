import { Activity } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-xl" },
    lg: { icon: 40, text: "text-3xl" },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md animate-pulse-slow" />
        <div className="relative bg-primary rounded-lg p-2 shadow-lg">
          <Activity size={sizes[size].icon} className="text-primary-foreground" />
        </div>
      </div>
      {showText && (
        <span className={`font-heading font-bold ${sizes[size].text} text-foreground`}>
          Diabetes<span className="text-primary">Care</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
