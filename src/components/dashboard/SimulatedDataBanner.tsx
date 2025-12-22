import { AlertTriangle, Wifi } from "lucide-react";

interface SimulatedDataBannerProps {
  isSimulated: boolean;
}

const SimulatedDataBanner = ({ isSimulated }: SimulatedDataBannerProps) => {
  if (!isSimulated) return null;

  return (
    <div className="bg-warning-light border border-warning/30 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
        <Wifi className="w-5 h-5 text-warning" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">Demo Mode - Simulated Data</p>
        <p className="text-sm text-muted-foreground">
          No live IoT data detected. Displaying simulated sensor readings for demonstration.
        </p>
      </div>
      <div className="px-3 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-full">
        Simulated
      </div>
    </div>
  );
};

export default SimulatedDataBanner;
