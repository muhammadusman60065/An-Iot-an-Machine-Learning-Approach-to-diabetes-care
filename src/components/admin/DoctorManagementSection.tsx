import React, { useState } from 'react';
import { 
  User, UserPlus, Mail, Edit, Trash2, Power, PowerOff, 
  Loader2, Search, Stethoscope, Building, Users, Link2, Unlink, AlertCircle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  UserData, createUserWithRole, updateUserStatus, deleteUser, updateUserProfile,
  assignPatientToDoctor, unassignPatientFromDoctor
} from '@/lib/firebase';

interface DoctorManagementSectionProps {
  doctors: UserData[];
  patients: UserData[];
  assignments: Record<string, string[]>;
  onRefresh: () => Promise<void>;
}

const DoctorManagementSection: React.FC<DoctorManagementSectionProps> = ({ 
  doctors, patients, assignments, onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<UserData | null>(null);
  const [assigningDoctor, setAssigningDoctor] = useState<UserData | null>(null);
  const [selectedPatientToAssign, setSelectedPatientToAssign] = useState('');

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialization: '',
    hospital: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    specialization: '',
    hospital: '',
  });

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDoctor = async () => {
    if (!newDoctor.email || !newDoctor.name) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithRole({
        email: newDoctor.email,
        name: newDoctor.name,
        role: 'doctor',
      });

      toast({ title: "Success", description: "Doctor added successfully" });
      setNewDoctor({ name: '', email: '', specialization: '', hospital: '' });
      setIsAddDialogOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({ title: "Error", description: "Failed to add doctor", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDoctor = async () => {
    if (!editingDoctor) return;

    setIsLoading(true);
    try {
      await updateUserProfile(editingDoctor.uid, {
        name: editForm.name,
        specialization: editForm.specialization,
        hospital: editForm.hospital,
      });

      toast({ title: "Success", description: "Doctor updated successfully" });
      setIsEditDialogOpen(false);
      setEditingDoctor(null);
      await onRefresh();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast({ title: "Error", description: "Failed to update doctor", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (doctor: UserData) => {
    const currentStatus = (doctor as any).accountEnabled !== false;
    try {
      await updateUserStatus(doctor.uid, !currentStatus);
      toast({ 
        title: "Success", 
        description: `Doctor ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
      await onRefresh();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDeleteDoctor = async (doctor: UserData) => {
    try {
      await deleteUser(doctor.uid);
      toast({ title: "Success", description: "Doctor removed successfully" });
      await onRefresh();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({ title: "Error", description: "Failed to remove doctor", variant: "destructive" });
    }
  };

  const handleAssignPatient = async () => {
    if (!assigningDoctor || !selectedPatientToAssign) return;

    setIsLoading(true);
    try {
      await assignPatientToDoctor(assigningDoctor.uid, selectedPatientToAssign);
      toast({ title: "Success", description: "Patient assigned to doctor" });
      setSelectedPatientToAssign('');
      await onRefresh();
    } catch (error) {
      console.error('Error assigning patient:', error);
      toast({ title: "Error", description: "Failed to assign patient", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignPatient = async (doctorId: string, patientId: string) => {
    try {
      await unassignPatientFromDoctor(doctorId, patientId);
      toast({ title: "Success", description: "Patient unassigned from doctor" });
      await onRefresh();
    } catch (error) {
      console.error('Error unassigning patient:', error);
      toast({ title: "Error", description: "Failed to unassign patient", variant: "destructive" });
    }
  };

  const openEditDialog = (doctor: UserData) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name,
      specialization: (doctor as any).profile?.specialization || '',
      hospital: (doctor as any).profile?.hospital || '',
    });
    setIsEditDialogOpen(true);
  };

  const openAssignDialog = (doctor: UserData) => {
    setAssigningDoctor(doctor);
    setSelectedPatientToAssign('');
    setIsAssignDialogOpen(true);
  };

  const getDoctorAssignedPatients = (doctorId: string): string[] => {
    return assignments[doctorId] || [];
  };

  const getUnassignedPatients = (doctorId: string) => {
    const assignedIds = getDoctorAssignedPatients(doctorId);
    return patients.filter(p => p.patientId && !assignedIds.includes(p.patientId));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Doctor Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage doctor accounts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Create a new doctor account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newDoctorName">Full Name *</Label>
                <Input
                  id="newDoctorName"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDoctorEmail">Email *</Label>
                <Input
                  id="newDoctorEmail"
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  placeholder="doctor@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDoctorSpecialization">Specialization</Label>
                <Input
                  id="newDoctorSpecialization"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  placeholder="e.g., Endocrinology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDoctorHospital">Hospital/Clinic</Label>
                <Input
                  id="newDoctorHospital"
                  value={newDoctor.hospital}
                  onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
                  placeholder="Hospital name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDoctor} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Add Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search doctors by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Doctor Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => {
          const isActive = (doctor as any).accountEnabled !== false;
          const assignedPatientIds = getDoctorAssignedPatients(doctor.uid);
          
          return (
            <Card key={doctor.uid} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center">
                      <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Dr. {doctor.name}</CardTitle>
                      <CardDescription className="text-xs">{doctor.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users size={14} />
                    <span>{assignedPatientIds.length} patients</span>
                  </div>
                </div>

                {/* Assigned Patients */}
                {assignedPatientIds.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Assigned Patients:</p>
                    <div className="flex flex-wrap gap-1">
                      {assignedPatientIds.slice(0, 3).map(patientId => {
                        const patient = patients.find(p => p.patientId === patientId);
                        return (
                          <Badge key={patientId} variant="outline" className="text-xs">
                            {patient?.name || patientId}
                            <button 
                              onClick={() => handleUnassignPatient(doctor.uid, patientId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <Unlink size={10} />
                            </button>
                          </Badge>
                        );
                      })}
                      {assignedPatientIds.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{assignedPatientIds.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignDialog(doctor)}
                  >
                    <Link2 size={14} className="mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(doctor)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(doctor)}
                  >
                    {isActive ? <PowerOff size={14} className="text-warning" /> : <Power size={14} className="text-success" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete Dr. {doctor.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDoctor(doctor)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredDoctors.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No doctors found
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editDoctorName">Full Name</Label>
              <Input
                id="editDoctorName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDoctorSpecialization">Specialization</Label>
              <Input
                id="editDoctorSpecialization"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDoctorHospital">Hospital/Clinic</Label>
              <Input
                id="editDoctorHospital"
                value={editForm.hospital}
                onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDoctor} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Patient Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Patient to Dr. {assigningDoctor?.name}</DialogTitle>
            <DialogDescription>
              Select a patient to assign to this doctor
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="selectPatient">Select Patient</Label>
            <Select value={selectedPatientToAssign} onValueChange={setSelectedPatientToAssign}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {assigningDoctor && getUnassignedPatients(assigningDoctor.uid).map(patient => (
                  <SelectItem key={patient.uid} value={patient.patientId || patient.uid}>
                    {patient.name} ({patient.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignPatient} disabled={isLoading || !selectedPatientToAssign}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Assign Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorManagementSection;
