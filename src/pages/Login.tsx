import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Stethoscope, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { toast } from "@/hooks/use-toast";

type UserRole = "patient" | "doctor" | "admin";

const roleConfig = {
  patient: {
    icon: User,
    title: "Patient",
    description: "Monitor your health metrics",
    color: "primary",
    dashboardPath: "/patient/dashboard",
  },
  doctor: {
    icon: Stethoscope,
    title: "Doctor",
    description: "Manage patient care",
    color: "info",
    dashboardPath: "/doctor/dashboard",
  },
  admin: {
    icon: Shield,
    title: "Administrator",
    description: "System administration",
    color: "warning",
    dashboardPath: "/admin/dashboard",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    
    // Simulate login - will be replaced with Firebase auth
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("userRole", selectedRole);
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Welcome back!",
        description: `Logged in as ${roleConfig[selectedRole].title}`,
      });
      navigate(roleConfig[selectedRole].dashboardPath);
    }, 1000);
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <Logo size="lg" />
            <h1 className="font-heading text-3xl font-bold text-foreground mt-6 mb-2">
              Welcome to DiabetesCare
            </h1>
            <p className="text-muted-foreground">
              Select your role to continue
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.patient][]).map(([role, config]) => {
              const Icon = config.icon;
              const bgColors: Record<string, string> = {
                primary: "bg-primary-light hover:bg-primary/20",
                info: "bg-info-light hover:bg-info/20",
                warning: "bg-warning-light hover:bg-warning/20",
              };
              const iconColors: Record<string, string> = {
                primary: "text-primary",
                info: "text-info",
                warning: "text-warning",
              };

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`group p-8 rounded-2xl border-2 border-transparent bg-card shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-${config.color}/30`}
                >
                  <div className={`w-16 h-16 ${bgColors[config.color]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${iconColors[config.color]}`} />
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {config.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const config = roleConfig[selectedRole];
  const Icon = config.icon;
  const bgColors: Record<string, string> = {
    primary: "bg-primary-light",
    info: "bg-info-light",
    warning: "bg-warning-light",
  };
  const iconColors: Record<string, string> = {
    primary: "text-primary",
    info: "text-info",
    warning: "text-warning",
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Logo size="lg" />
          <h2 className="font-heading text-4xl font-bold mt-8 mb-4">
            Smart Diabetes Management
          </h2>
          <p className="text-lg opacity-90 max-w-md">
            Real-time health monitoring powered by IoT sensors and machine learning algorithms.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span>Change role</span>
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 ${bgColors[config.color]} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${iconColors[config.color]}`} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {config.title} Login
              </h1>
              <p className="text-muted-foreground text-sm">
                {config.description}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Contact administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
