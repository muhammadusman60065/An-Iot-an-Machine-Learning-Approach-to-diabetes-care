import React, { useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { UserPlus, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddPatientByIdDialogProps {
  doctorUid: string;
  doctorPatients: string[];
  onPatientAdded?: () => void;
}

interface PatientSearchResult {
  found: boolean;
  patientUid?: string;
  patientName?: string;
  patientId?: string;
  hasVitals?: boolean;
  message?: string;
}

const AddPatientByIdDialog: React.FC<AddPatientByIdDialogProps> = ({ 
  doctorUid, 
  doctorPatients,
  onPatientAdded 
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResult, setSearchResult] = useState<PatientSearchResult | null>(null);

  const validatePatientIdFormat = (id: string): boolean => {
    // Accept formats like: patient_001, patient_002, patient001, etc.
    return /^patient_?\d{1,4}$/i.test(id.trim());
  };

  const handleSearch = async () => {
    const trimmedId = patientId.trim();
    
    if (!trimmedId) {
      toast({
        title: "Error",
        description: "Please enter a Patient ID",
        variant: "destructive",
      });
      return;
    }

    if (!validatePatientIdFormat(trimmedId)) {
      setSearchResult({
        found: false,
        message: "Invalid format. Use: patient_001, patient_002, etc.",
      });
      return;
    }

    // Check if already assigned
    if (doctorPatients.includes(trimmedId)) {
      setSearchResult({
        found: false,
        message: "This patient is already assigned to you.",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      // Step 1: Check if patient data exists in patients node
      const patientDataRef = ref(database, `patients/${trimmedId}`);
      const patientDataSnap = await get(patientDataRef);
      const hasVitals = patientDataSnap.exists();

      // Step 2: Find patient user by patientId
      const usersRef = ref(database, 'users');
      const usersSnap = await get(usersRef);

      let foundPatientUid: string | null = null;
      let foundPatientName = '';

      if (usersSnap.exists()) {
        const users = usersSnap.val();
        for (const [uid, userData] of Object.entries(users)) {
          const user = userData as any;
          if (user.patientId === trimmedId) {
            foundPatientUid = uid;
            foundPatientName = user.profile?.name || user.name || 'Unknown Patient';
            break;
          }
        }
      }

      if (foundPatientUid) {
        setSearchResult({
          found: true,
          patientUid: foundPatientUid,
          patientName: foundPatientName,
          patientId: trimmedId,
          hasVitals,
        });
      } else if (hasVitals) {
        // Vitals exist but no user account
        setSearchResult({
          found: false,
          message: `Patient device ${trimmedId} is sending data, but no user account is linked to it yet.`,
        });
      } else {
        setSearchResult({
          found: false,
          message: `Patient ${trimmedId} not found in the system. Please check the ID.`,
        });
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      setSearchResult({
        found: false,
        message: "Error searching for patient. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPatient = async () => {
    if (!searchResult?.found || !searchResult.patientUid) return;

    setIsAdding(true);
    try {
      // Update doctor's assignedPatients
      const updatedPatients = [...doctorPatients, searchResult.patientId!];
      await update(ref(database, `users/${doctorUid}`), {
        assignedPatients: updatedPatients
      });

      // Update patient's assignedDoctor
      await update(ref(database, `users/${searchResult.patientUid}`), {
        assignedDoctor: doctorUid
      });

      toast({
        title: "Patient Added Successfully",
        description: `${searchResult.patientName} (${searchResult.patientId}) has been added to your care list.`,
      });

      setOpen(false);
      setPatientId('');
      setSearchResult(null);
      onPatientAdded?.();
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPatientId('');
    setSearchResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient by ID</DialogTitle>
          <DialogDescription>
            Enter the Patient ID to add them to your care list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient-id">Patient ID</Label>
            <div className="flex gap-2">
              <Input
                id="patient-id"
                type="text"
                placeholder="patient_001"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setSearchResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: patient_001, patient_002, etc.
            </p>
          </div>

          {/* Current Patients Count */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Currently managing: <span className="font-semibold text-foreground">{doctorPatients.length}</span> patients
            </p>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className={`p-4 rounded-lg border ${
              searchResult.found 
                ? 'bg-success/10 border-success/30' 
                : 'bg-destructive/10 border-destructive/30'
            }`}>
              {searchResult.found ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{searchResult.patientName}</p>
                      <p className="text-sm text-muted-foreground">Patient ID: {searchResult.patientId}</p>
                    </div>
                  </div>
                  {searchResult.hasVitals && (
                    <Alert className="bg-success/5 border-success/20">
                      <AlertCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success">
                        Device is active and sending vitals data
                      </AlertDescription>
                    </Alert>
                  )}
                  {!searchResult.hasVitals && (
                    <Alert className="bg-warning/5 border-warning/20">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <AlertDescription className="text-warning">
                        No vitals data yet - device may not be connected
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{searchResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPatient}
            disabled={!searchResult?.found || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientByIdDialog;
