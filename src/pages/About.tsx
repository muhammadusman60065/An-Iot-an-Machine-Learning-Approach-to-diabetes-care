import { ArrowLeft, Cpu, Database, Cloud, Activity, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Logo size="md" />
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              About <span className="gradient-text">DiabetesCare</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              An IoT and Machine Learning Approach to Diabetes Care
            </p>
            <div className="mt-4 inline-block px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-medium">
              Final Year Project
            </div>
          </div>

          {/* Project Overview */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              Project Overview
            </h2>
            <div className="prose prose-lg text-muted-foreground">
              <p>
                DiabetesCare is an innovative healthcare monitoring platform designed to 
                provide real-time health tracking for diabetes patients. The system 
                integrates Internet of Things (IoT) devices with Machine Learning 
                algorithms to offer continuous monitoring, anomaly detection, and 
                personalized alerts.
              </p>
              <p>
                This project demonstrates how emerging technologies can be leveraged to 
                create scalable, cost-effective healthcare solutions that improve patient 
                outcomes and reduce the burden on healthcare providers.
              </p>
            </div>
          </section>

          {/* System Architecture */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              System Architecture
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  IoT Hardware Layer
                </h3>
                <p className="text-muted-foreground text-sm">
                  ESP8266 NodeMCU microcontroller connected to glucose sensors, 
                  heart rate monitors, and temperature probes for continuous data collection.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 bg-info-light rounded-xl flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-info" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Cloud Backend
                </h3>
                <p className="text-muted-foreground text-sm">
                  Firebase Realtime Database for instant data synchronization, 
                  authentication, and serverless functions for data processing.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 bg-warning-light rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  ML Anomaly Detection
                </h3>
                <p className="text-muted-foreground text-sm">
                  TensorFlow-based machine learning models trained to detect 
                  health anomalies and predict potential risks before they become critical.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Web Dashboard
                </h3>
                <p className="text-muted-foreground text-sm">
                  React-based responsive interface with role-based access for 
                  patients, doctors, and administrators to view and manage health data.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Key Features
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Real-time Monitoring",
                  description: "Continuous tracking of glucose levels, heart rate, and body temperature with instant updates.",
                },
                {
                  title: "Role-based Dashboards",
                  description: "Tailored views for patients, doctors, and administrators with appropriate access controls.",
                },
                {
                  title: "Intelligent Alerts",
                  description: "ML-powered anomaly detection sends immediate notifications when readings fall outside safe ranges.",
                },
                {
                  title: "Data Visualization",
                  description: "Interactive charts and graphs to track health trends over time.",
                },
                {
                  title: "Secure & Private",
                  description: "End-to-end encryption and Firebase Authentication ensure patient data remains confidential.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-foreground text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "ESP8266 NodeMCU",
                "Firebase",
                "React.js",
                "TypeScript",
                "TensorFlow",
                "Tailwind CSS",
                "Recharts",
                "IoT Sensors",
              ].map((tech) => (
                <div
                  key={tech}
                  className="bg-card rounded-xl p-4 text-center shadow-card hover:shadow-lg transition-shadow"
                >
                  <span className="font-medium text-foreground">{tech}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-card rounded-2xl p-8 shadow-card">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Ready to Experience DiabetesCare?
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to explore the role-based dashboards and see the system in action.
            </p>
            <Button variant="hero" onClick={() => navigate("/login")}>
              Access Dashboard
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
