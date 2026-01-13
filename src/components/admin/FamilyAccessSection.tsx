import React, { useState, useEffect } from 'react';
import { 
  Heart, UserPlus, Mail, Trash2, Loader2, Search, 
  Users, Link2, AlertCircle, User
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
import { UserData, addFamilyMemberToPatient, deleteUser, getAllUsers } from '@/lib/firebase';

interface FamilyAccessSectionProps {
  patients: UserData[];
  onRefresh: () => Promise<void>;
}

interface FamilyMember extends UserData {
  linkedPatient?: string;
  linkedPatientUid?: string;
  relationship?: string;
}

const FamilyAccessSection: React.FC<FamilyAccessSectionProps> = ({ patients, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);

  const [newFamilyMember, setNewFamilyMember] = useState({
    email: '',
    patientUid: '',
    relationship: '',
  });

  // Load family members
  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        const allUsers = await getAllUsers();
        const family = allUsers.filter(u => u.role === 'family') as FamilyMember[];
        setFamilyMembers(family);
      } catch (error) {
        console.error('Error loading family members:', error);
      } finally {
        setIsLoadingFamily(false);
      }
    };

    loadFamilyMembers();
  }, []);

  const filteredFamilyMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFamilyMember = async () => {
    if (!newFamilyMember.email || !newFamilyMember.patientUid || !newFamilyMember.relationship) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addFamilyMemberToPatient(
        newFamilyMember.patientUid,
        newFamilyMember.email,
        newFamilyMember.relationship
      );

      toast({ title: "Success", description: "Family member added successfully" });
      setNewFamilyMember({ email: '', patientUid: '', relationship: '' });
      setIsAddDialogOpen(false);
      
      // Reload family members
      const allUsers = await getAllUsers();
      const family = allUsers.filter(u => u.role === 'family') as FamilyMember[];
      setFamilyMembers(family);
      
      await onRefresh();
    } catch (error: any) {
      console.error('Error adding family member:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add family member", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFamilyMember = async (member: FamilyMember) => {
    try {
      await deleteUser(member.uid);
      toast({ title: "Success", description: "Family member removed successfully" });
      setFamilyMembers(prev => prev.filter(m => m.uid !== member.uid));
      await onRefresh();
    } catch (error) {
      console.error('Error removing family member:', error);
      toast({ title: "Error", description: "Failed to remove family member", variant: "destructive" });
    }
  };

  const getPatientName = (patientId: string | undefined): string => {
    if (!patientId) return 'Unknown';
    const patient = patients.find(p => p.patientId === patientId || p.uid === patientId);
    return patient?.name || patientId;
  };

  const relationshipOptions = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Caregiver',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Family Access Management
          </h2>
          <p className="text-muted-foreground">Manage family member access to patient data</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Add a family member who can view patient data and receive alerts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="familyEmail">Family Member Email *</Label>
                <Input
                  id="familyEmail"
                  type="email"
                  value={newFamilyMember.email}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, email: e.target.value })}
                  placeholder="family@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selectPatient">Select Patient *</Label>
                <Select 
                  value={newFamilyMember.patientUid} 
                  onValueChange={(value) => setNewFamilyMember({ ...newFamilyMember, patientUid: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.uid} value={patient.uid}>
                        {patient.name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select 
                  value={newFamilyMember.relationship} 
                  onValueChange={(value) => setNewFamilyMember({ ...newFamilyMember, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map(rel => (
                      <SelectItem key={rel} value={rel.toLowerCase()}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddFamilyMember} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Add Family Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Family Member Access</h3>
              <p className="text-sm text-muted-foreground">
                Family members can view their linked patient's real-time vitals, receive health alerts, 
                and access historical data. They have read-only access and cannot modify patient settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search family members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Family Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Members ({filteredFamilyMembers.length})
          </CardTitle>
          <CardDescription>All registered family members and their linked patients</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFamily ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading family members...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Family Member</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Linked Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Relationship</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilyMembers.map((member) => (
                    <tr key={member.uid} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Heart size={14} className="text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={14} />
                          {member.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link2 size={14} className="text-primary" />
                          <span>{getPatientName(member.linkedPatient)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {member.relationship || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Remove family member">
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name}? They will no longer have access to patient data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveFamilyMember(member)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                  {filteredFamilyMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No family members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Family Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Patients with Family Access</CardTitle>
          <CardDescription>Overview of which patients have family members linked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map(patient => {
              const patientFamily = familyMembers.filter(
                m => m.linkedPatient === patient.patientId || m.linkedPatientUid === patient.uid
              );
              
              return (
                <div key={patient.uid} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                    </div>
                  </div>
                  {patientFamily.length > 0 ? (
                    <div className="space-y-2">
                      {patientFamily.map(fm => (
                        <div key={fm.uid} className="flex items-center gap-2 text-sm">
                          <Heart size={12} className="text-primary" />
                          <span>{fm.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {fm.relationship}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No family members linked</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyAccessSection;
