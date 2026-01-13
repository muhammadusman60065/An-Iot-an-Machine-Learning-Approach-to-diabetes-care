import React, { useState } from 'react';
import { UserPlus, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
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
import { findPatientByEmail, addPatientToDoctorByEmail } from '@/lib/firebase';

interface AddPatientDialogProps {
  doctorId: string;
  onPatientAdded?: () => void;
}

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({ doctorId, onPatientAdded }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    patientName?: string;
    patientId?: string;
    message?: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const patient = await findPatientByEmail(email.trim());
      
      if (patient) {
        setSearchResult({
          found: true,
          patientName: patient.name,
          patientId: patient.patientId,
        });
      } else {
        setSearchResult({
          found: false,
          message: "No patient found with this email address. Make sure the user is registered as a patient.",
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
    if (!searchResult?.patientId) return;

    setIsAdding(true);
    try {
      await addPatientToDoctorByEmail(doctorId, email.trim());
      toast({
        title: "Patient Added",
        description: `${searchResult.patientName} has been added to your patients.`,
      });
      setOpen(false);
      setEmail('');
      setSearchResult(null);
      onPatientAdded?.();
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setSearchResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient by Email</DialogTitle>
          <DialogDescription>
            Enter the email address of the patient you want to add to your care list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient-email">Patient Email</Label>
            <div className="flex gap-2">
              <Input
                id="patient-email"
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className={`p-4 rounded-lg border ${
              searchResult.found 
                ? 'bg-success/10 border-success/30' 
                : 'bg-destructive/10 border-destructive/30'
            }`}>
              {searchResult.found ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{searchResult.patientName}</p>
                    <p className="text-sm text-muted-foreground">Patient ID: {searchResult.patientId}</p>
                  </div>
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

export default AddPatientDialog;
