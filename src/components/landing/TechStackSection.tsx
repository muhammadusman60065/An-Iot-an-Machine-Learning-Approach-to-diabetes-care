import { Cpu, Database, Cloud, Wifi } from "lucide-react";

const techItems = [
  {
    icon: Wifi,
    title: "ESP8266 NodeMCU",
    description: "WiFi-enabled microcontroller for sensor data collection",
  },
  {
    icon: Cpu,
    title: "IoT Sensors",
    description: "Glucose monitor, heart rate sensor, temperature probe",
  },
  {
    icon: Cloud,
    title: "Firebase Backend",
    description: "Real-time database and cloud functions for data processing",
  },
  {
    icon: Database,
    title: "ML Pipeline",
    description: "TensorFlow-based anomaly detection models",
  },
];

const TechStackSection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Tech Cards */}
          <div className="grid grid-cols-2 gap-4">
            {techItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Built with Modern{" "}
              <span className="gradient-text">Technology</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our platform leverages the latest in IoT hardware and cloud computing 
              to deliver a seamless, reliable health monitoring experience.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success-foreground text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Low-Power IoT Devices</p>
                  <p className="text-sm text-muted-foreground">Efficient sensors for continuous monitoring</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success-foreground text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Real-time Data Sync</p>
                  <p className="text-sm text-muted-foreground">Firebase Realtime Database for instant updates</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success-foreground text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Scalable Architecture</p>
                  <p className="text-sm text-muted-foreground">Designed to handle thousands of devices</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
