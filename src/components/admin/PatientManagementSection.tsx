import React, { useState } from 'react';
import { 
  User, UserPlus, Mail, Phone, Edit, Trash2, Power, PowerOff, 
  Loader2, Search, KeyRound, AlertCircle, Stethoscope, UserCheck,
  Scale, Ruler, Activity, Droplets
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
  getAllUsers, database
} from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PatientManagementSectionProps {
  patients: UserData[];
  onRefresh: () => Promise<void>;
}

// Calculate BMI from weight (kg) and height (cm)
const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height || height === 0) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-warning' };
  if (bmi < 25) return { label: 'Normal', color: 'text-success' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-warning' };
  return { label: 'Obese', color: 'text-destructive' };
};

const PatientManagementSection: React.FC<PatientManagementSectionProps> = ({ patients, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDoctorDialogOpen, setIsAssignDoctorDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState<UserData | null>(null);
  const [assigningPatient, setAssigningPatient] = useState<UserData | null>(null);
  const [doctors, setDoctors] = useState<UserData[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    patientId: '',
    phone: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    diabetesType: 'type2',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    patientId: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    diabetesType: 'type2',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
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
      // Calculate BMI
      const weight = parseFloat(newPatient.weight) || 0;
      const height = parseFloat(newPatient.height) || 0;
      const bmi = calculateBMI(weight, height);

      await createUserWithRole({
        email: newPatient.email,
        name: newPatient.name,
        role: 'patient',
        patientId: newPatient.patientId || undefined,
      });

      // Find the created user and update with full profile
      const allUsers = await getAllUsers();
      const createdUser = allUsers.find(u => u.email === newPatient.email);
      
      if (createdUser) {
        await updateUserProfile(createdUser.uid, {
          name: newPatient.name,
          contactNumber: newPatient.phone,
          age: parseInt(newPatient.age) || 0,
          gender: newPatient.gender,
          weight: weight,
          height: height,
          bmi: bmi,
          diabetesType: newPatient.diabetesType,
          bloodGroup: newPatient.bloodGroup,
          emergencyContact: newPatient.emergencyContact,
          address: newPatient.address,
        });
      }

      toast({ title: "Success", description: "Patient added successfully" });
      setNewPatient({ 
        name: '', email: '', patientId: '', phone: '', age: '', gender: 'male',
        weight: '', height: '', diabetesType: 'type2', bloodGroup: '', 
        emergencyContact: '', address: '' 
      });
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
      // Calculate BMI
      const weight = parseFloat(editForm.weight) || 0;
      const height = parseFloat(editForm.height) || 0;
      const bmi = calculateBMI(weight, height);

      await updateUserProfile(editingPatient.uid, {
        name: editForm.name,
        contactNumber: editForm.phone,
        age: parseInt(editForm.age) || 0,
        gender: editForm.gender,
        weight: weight,
        height: height,
        bmi: bmi,
        diabetesType: editForm.diabetesType,
        bloodGroup: editForm.bloodGroup,
        emergencyContact: editForm.emergencyContact,
        address: editForm.address,
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
    toast({ 
      title: "Password Reset", 
      description: `Password reset email would be sent to ${patient.email}. This requires Firebase Admin SDK.` 
    });
  };

  const openEditDialog = (patient: UserData) => {
    setEditingPatient(patient);
    const profile = (patient as any).profile || {};
    setEditForm({
      name: patient.name,
      phone: profile.contactNumber || '',
      patientId: patient.patientId || '',
      age: profile.age?.toString() || '',
      gender: profile.gender || 'male',
      weight: profile.weight?.toString() || '',
      height: profile.height?.toString() || '',
      diabetesType: profile.diabetesType || 'type2',
      bloodGroup: profile.bloodGroup || '',
      emergencyContact: profile.emergencyContact || '',
      address: profile.address || '',
    });
    setIsEditDialogOpen(true);
  };

  const openAssignDoctorDialog = async (patient: UserData) => {
    setAssigningPatient(patient);
    setSelectedDoctor('');
    
    // Fetch doctors
    try {
      const allUsers = await getAllUsers();
      const doctorList = allUsers.filter(u => u.role === 'doctor');
      setDoctors(doctorList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
    
    setIsAssignDoctorDialogOpen(true);
  };

  const handleAssignDoctor = async () => {
    if (!assigningPatient || !selectedDoctor) return;

    setIsLoading(true);
    try {
      // Update patient's assignedDoctor
      await update(ref(database, `users/${assigningPatient.uid}`), {
        assignedDoctor: selectedDoctor
      });

      // Add to doctor's assignedPatients if patient has patientId
      if (assigningPatient.patientId) {
        const doctorRef = ref(database, `users/${selectedDoctor}`);
        const doctorSnap = await get(doctorRef);
        
        if (doctorSnap.exists()) {
          const doctorData = doctorSnap.val();
          const currentPatients = doctorData.assignedPatients || [];
          if (!currentPatients.includes(assigningPatient.patientId)) {
            await update(doctorRef, {
              assignedPatients: [...currentPatients, assigningPatient.patientId]
            });
          }
        }
      }

      const assignedDoctor = doctors.find(d => d.uid === selectedDoctor);
      toast({ 
        title: "Success", 
        description: `Patient assigned to Dr. ${assignedDoctor?.name || 'Doctor'}` 
      });
      setIsAssignDoctorDialogOpen(false);
      setAssigningPatient(null);
      await onRefresh();
    } catch (error) {
      console.error('Error assigning doctor:', error);
      toast({ title: "Error", description: "Failed to assign doctor", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-calculate BMI in forms
  const handleNewPatientChange = (field: string, value: string) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const newPatientBMI = calculateBMI(parseFloat(newPatient.weight) || 0, parseFloat(newPatient.height) || 0);
  const editFormBMI = calculateBMI(parseFloat(editForm.weight) || 0, parseFloat(editForm.height) || 0);

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Create a new patient account with complete profile information
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="health">Health Details</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newName">Full Name *</Label>
                    <Input
                      id="newName"
                      value={newPatient.name}
                      onChange={(e) => handleNewPatientChange('name', e.target.value)}
                      placeholder="Patient name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email *</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => handleNewPatientChange('email', e.target.value)}
                      placeholder="patient@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPatientId">Patient ID (Device ID)</Label>
                    <Input
                      id="newPatientId"
                      value={newPatient.patientId}
                      onChange={(e) => handleNewPatientChange('patientId', e.target.value)}
                      placeholder="patient_001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAge">Age</Label>
                    <Input
                      id="newAge"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => handleNewPatientChange('age', e.target.value)}
                      placeholder="35"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newGender">Gender</Label>
                  <Select value={newPatient.gender} onValueChange={(v) => handleNewPatientChange('gender', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="health" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newWeight">Weight (kg)</Label>
                    <Input
                      id="newWeight"
                      type="number"
                      step="0.1"
                      value={newPatient.weight}
                      onChange={(e) => handleNewPatientChange('weight', e.target.value)}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newHeight">Height (cm)</Label>
                    <Input
                      id="newHeight"
                      type="number"
                      value={newPatient.height}
                      onChange={(e) => handleNewPatientChange('height', e.target.value)}
                      placeholder="175"
                    />
                  </div>
                </div>
                
                {/* BMI Display */}
                {newPatientBMI > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Calculated BMI</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{newPatientBMI}</span>
                        <Badge className={getBMICategory(newPatientBMI).color}>
                          {getBMICategory(newPatientBMI).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newDiabetesType">Diabetes Type</Label>
                    <Select value={newPatient.diabetesType} onValueChange={(v) => handleNewPatientChange('diabetesType', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type1">Type 1</SelectItem>
                        <SelectItem value="type2">Type 2</SelectItem>
                        <SelectItem value="gestational">Gestational</SelectItem>
                        <SelectItem value="prediabetes">Pre-diabetes</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newBloodGroup">Blood Group</Label>
                    <Select value={newPatient.bloodGroup} onValueChange={(v) => handleNewPatientChange('bloodGroup', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="newPhone">Phone Number</Label>
                  <Input
                    id="newPhone"
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => handleNewPatientChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmergencyContact">Emergency Contact</Label>
                  <Input
                    id="newEmergencyContact"
                    type="tel"
                    value={newPatient.emergencyContact}
                    onChange={(e) => handleNewPatientChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAddress">Address</Label>
                  <Input
                    id="newAddress"
                    value={newPatient.address}
                    onChange={(e) => handleNewPatientChange('address', e.target.value)}
                    placeholder="Full address"
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-6">
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Health Info</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assigned Doctor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const isActive = (patient as any).accountEnabled !== false;
                  const profile = (patient as any).profile || {};
                  const assignedDoctor = (patient as any).assignedDoctor;
                  
                  return (
                    <tr key={patient.uid} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User size={14} className="text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{patient.name}</span>
                            <span className="text-xs text-muted-foreground">{patient.email}</span>
                          </div>
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
                        <div className="flex flex-col gap-1 text-sm">
                          {profile.age && (
                            <span className="text-muted-foreground">Age: {profile.age}</span>
                          )}
                          {profile.diabetesType && (
                            <Badge variant="secondary" className="w-fit capitalize">
                              <Droplets className="w-3 h-3 mr-1" />
                              {profile.diabetesType.replace('type', 'Type ')}
                            </Badge>
                          )}
                          {profile.bmi && (
                            <span className={`text-xs ${getBMICategory(profile.bmi).color}`}>
                              BMI: {profile.bmi}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {assignedDoctor ? (
                          <div className="flex items-center gap-2">
                            <Stethoscope size={14} className="text-info" />
                            <span className="text-sm">Assigned</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDoctorDialog(patient)}
                          >
                            <UserCheck size={14} className="mr-1" />
                            Assign
                          </Button>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
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
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient profile information
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="health">Health Details</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name</Label>
                  <Input
                    id="editName"
                    value={editForm.name}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAge">Age</Label>
                  <Input
                    id="editAge"
                    type="number"
                    value={editForm.age}
                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPatientId">Patient ID (Device)</Label>
                  <Input
                    id="editPatientId"
                    value={editForm.patientId}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editGender">Gender</Label>
                  <Select value={editForm.gender} onValueChange={(v) => handleEditFormChange('gender', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="health" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editWeight">Weight (kg)</Label>
                  <Input
                    id="editWeight"
                    type="number"
                    step="0.1"
                    value={editForm.weight}
                    onChange={(e) => handleEditFormChange('weight', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHeight">Height (cm)</Label>
                  <Input
                    id="editHeight"
                    type="number"
                    value={editForm.height}
                    onChange={(e) => handleEditFormChange('height', e.target.value)}
                  />
                </div>
              </div>
              
              {/* BMI Display */}
              {editFormBMI > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Calculated BMI</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{editFormBMI}</span>
                      <Badge className={getBMICategory(editFormBMI).color}>
                        {getBMICategory(editFormBMI).label}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDiabetesType">Diabetes Type</Label>
                  <Select value={editForm.diabetesType} onValueChange={(v) => handleEditFormChange('diabetesType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type1">Type 1</SelectItem>
                      <SelectItem value="type2">Type 2</SelectItem>
                      <SelectItem value="gestational">Gestational</SelectItem>
                      <SelectItem value="prediabetes">Pre-diabetes</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBloodGroup">Blood Group</Label>
                  <Select value={editForm.bloodGroup} onValueChange={(v) => handleEditFormChange('bloodGroup', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmergencyContact">Emergency Contact</Label>
                <Input
                  id="editEmergencyContact"
                  type="tel"
                  value={editForm.emergencyContact}
                  onChange={(e) => handleEditFormChange('emergencyContact', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={editForm.address}
                  onChange={(e) => handleEditFormChange('address', e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPatient} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Doctor Dialog */}
      <Dialog open={isAssignDoctorDialogOpen} onOpenChange={setIsAssignDoctorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Doctor to {assigningPatient?.name}</DialogTitle>
            <DialogDescription>
              Select a doctor to assign to this patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.uid} value={doctor.uid}>
                      <div className="flex items-center gap-2">
                        <Stethoscope size={14} />
                        Dr. {doctor.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDoctorDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignDoctor} disabled={isLoading || !selectedDoctor}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Assign Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagementSection;
