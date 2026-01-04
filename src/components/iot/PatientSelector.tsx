import { cn } from "@/lib/utils";
import { User, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PatientInfo } from "@/hooks/useRealtimePatient";

interface PatientSelectorProps {
  patients: PatientInfo[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  isLoading?: boolean;
}

export const PatientSelector = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  isLoading,
}: PatientSelectorProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {patients.map((patient) => (
          <Button
            key={patient.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto p-3 transition-all duration-200",
              selectedPatientId === patient.id
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted/50"
            )}
            onClick={() => onSelectPatient(patient.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                selectedPatientId === patient.id
                  ? "bg-primary/20"
                  : "bg-muted"
              )}>
                <User className={cn(
                  "w-5 h-5",
                  selectedPatientId === patient.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )} />
              </div>
              
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{patient.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {patient.id}</span>
                  <span>•</span>
                  <span>{patient.roomNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className={cn(
                  "w-4 h-4",
                  selectedPatientId === patient.id
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                )} />
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  selectedPatientId === patient.id && "translate-x-1"
                )} />
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
