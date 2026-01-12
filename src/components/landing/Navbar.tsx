import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Features");
  const navigate = useNavigate();

  // Modern scroll listener for the glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler for anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsOpen(false);
      const targetElement = document.querySelector(href);
      if (targetElement) {
        const offset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setActiveTab(href.substring(1) === 'features' ? 'Features' : href.substring(1) === 'technology' ? 'Technology' : 'Features');
      }
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Technology", href: "#technology" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 py-4 ${
        scrolled ? "md:py-4" : "md:py-6"
      }`}
    >
      <div 
        className={`container mx-auto max-w-7xl transition-all duration-500 rounded-2xl border border-transparent ${
          scrolled 
            ? "bg-background/70 dark:bg-background/70 backdrop-blur-xl shadow-2xl shadow-primary/10 border-border/50 py-2 px-6" 
            : "bg-transparent py-2 px-6"
        }`}
      >
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <Logo size="md" />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Center Pill */}
          <motion.div 
            className="hidden md:flex items-center bg-muted/50 dark:bg-muted/50 p-1 rounded-full border border-border/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {link.href.startsWith('#') ? (
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className={`relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full block ${
                      activeTab === link.label 
                        ? "text-primary dark:text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    <AnimatePresence>
                      {activeTab === link.label && (
                        <motion.div
                          className="absolute inset-0 bg-card dark:bg-card shadow-sm rounded-full -z-10"
                          layoutId="activeTab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className={`relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full block ${
                      activeTab === link.label 
                        ? "text-primary dark:text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab(link.label)}
                  >
                    {link.label}
                    <AnimatePresence>
                      {activeTab === link.label && (
                        <motion.div
                          className="absolute inset-0 bg-card dark:bg-card shadow-sm rounded-full -z-10"
                          layoutId="activeTab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Desktop Actions */}
          <motion.div 
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="hover:bg-primary/10 transition-all duration-300"
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate("/login")}
                className="gradient-bg text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative">Get Started</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 bg-muted/80 dark:bg-muted/80 rounded-xl transition-all active:scale-90"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 top-0 bg-background/95 dark:bg-background/95 backdrop-blur-2xl z-[-1] md:hidden"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="pt-32 px-8 flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {navLinks.map((link, idx) => (
                link.href.startsWith('#') ? (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      handleSmoothScroll(e, link.href);
                      setIsOpen(false);
                    }}
                    className="text-3xl font-bold flex items-center justify-between group border-b border-border pb-4 hover:text-primary transition-colors duration-300"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    whileHover={{ x: 5 }}
                  >
                    <span>{link.label}</span>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <ChevronRight className="text-primary" />
                    </motion.div>
                  </motion.a>
                ) : (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-bold flex items-center justify-between group border-b border-border pb-4 hover:text-primary transition-colors duration-300"
                    >
                      <span>{link.label}</span>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                      >
                        <ChevronRight className="text-primary" />
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              ))}
              <motion.div 
                className="mt-4 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      navigate("/login");
                      setIsOpen(false);
                    }} 
                    className="w-full py-5 text-xl"
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => {
                      navigate("/login");
                      setIsOpen(false);
                    }} 
                    className="w-full py-5 text-xl gradient-bg text-white shadow-2xl shadow-primary/40 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative">Get Started</span>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
