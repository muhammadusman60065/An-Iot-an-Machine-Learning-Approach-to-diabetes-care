import React, { useState } from 'react';
import { 
  User, UserPlus, Mail, Phone, Edit, Trash2, Power, PowerOff, 
  Loader2, Search, KeyRound, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { UserData, createUserWithRole, updateUserStatus, deleteUser, updateUserProfile, sendPasswordReset } from '@/lib/firebase';

interface PatientManagementSectionProps {
  patients: UserData[];
  onRefresh: () => Promise<void>;
}

const PatientManagementSection: React.FC<PatientManagementSectionProps> = ({ patients, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState<UserData | null>(null);

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    patientId: '',
    phone: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    patientId: '',
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async () => {
    if (!newPatient.email || !newPatient.name) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithRole({
        email: newPatient.email,
        name: newPatient.name,
        role: 'patient',
        patientId: newPatient.patientId || undefined,
      });

      toast({ title: "Success", description: "Patient added successfully" });
      setNewPatient({ name: '', email: '', patientId: '', phone: '' });
      setIsAddDialogOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({ title: "Error", description: "Failed to add patient", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPatient = async () => {
    if (!editingPatient) return;

    setIsLoading(true);
    try {
      await updateUserProfile(editingPatient.uid, {
        name: editForm.name,
        contactNumber: editForm.phone,
      });

      toast({ title: "Success", description: "Patient updated successfully" });
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      await onRefresh();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({ title: "Error", description: "Failed to update patient", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (patient: UserData) => {
    const currentStatus = (patient as any).accountEnabled !== false;
    try {
      await updateUserStatus(patient.uid, !currentStatus);
      toast({ 
        title: "Success", 
        description: `Patient ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
      await onRefresh();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDeletePatient = async (patient: UserData) => {
    try {
      await deleteUser(patient.uid);
      toast({ title: "Success", description: "Patient removed successfully" });
      await onRefresh();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({ title: "Error", description: "Failed to remove patient", variant: "destructive" });
    }
  };

  const handleResetPassword = async (patient: UserData) => {
    try {
      await sendPasswordReset(patient.email);
      toast({ 
        title: "Password Reset Sent", 
        description: `Password reset email has been sent to ${patient.email}` 
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({ 
        title: "Error", 
        description: "Failed to send password reset email", 
        variant: "destructive" 
      });
    }
  };

  const openEditDialog = (patient: UserData) => {
    setEditingPatient(patient);
    setEditForm({
      name: patient.name,
      phone: (patient as any).profile?.contactNumber || '',
      patientId: patient.patientId || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage patient accounts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Create a new patient account. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newName">Full Name *</Label>
                <Input
                  id="newName"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Email *</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  placeholder="patient@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPatientId">Patient ID (Device ID)</Label>
                <Input
                  id="newPatientId"
                  value={newPatient.patientId}
                  onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
                  placeholder="ESP32 Device ID (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPhone">Phone Number</Label>
                <Input
                  id="newPhone"
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPatient} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Add Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, email, or patient ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
          <CardDescription>Manage patient accounts and device connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const isActive = (patient as any).accountEnabled !== false;
                  return (
                    <tr key={patient.uid} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User size={14} className="text-white" />
                          </div>
                          <span className="font-medium text-foreground">{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={14} />
                          {patient.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {patient.patientId ? (
                          <Badge variant="outline" className="font-mono">
                            {patient.patientId}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not linked</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(patient)}
                            title="Edit patient"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(patient)}
                            title="Reset password"
                          >
                            <KeyRound size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(patient)}
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            {isActive ? <PowerOff size={14} className="text-warning" /> : <Power size={14} className="text-success" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Delete patient">
                                <Trash2 size={14} className="text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {patient.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePatient(patient)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPatientId">Patient ID (Device)</Label>
              <Input
                id="editPatientId"
                value={editForm.patientId}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Patient ID cannot be changed here</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPatient} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagementSection;
