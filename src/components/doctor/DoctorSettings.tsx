import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Save, Loader2, Building, Phone, Stethoscope, GraduationCap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UserData, getUserProfile, updateUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface DoctorSettingsProps {
  userData: UserData | null;
}

interface DoctorProfile {
  name: string;
  contactNumber: string;
  hospital: string;
  specialization: string;
  qualification: string;
  experience: string;
  consultationHours: string;
  licenseNumber: string;
  maxPatients: string;
  bio: string;
}

const DoctorSettings: React.FC<DoctorSettingsProps> = ({ userData }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<DoctorProfile>({
    name: userData?.name || '',
    contactNumber: '',
    hospital: '',
    specialization: 'Endocrinology',
    qualification: '',
    experience: '',
    consultationHours: '',
    licenseNumber: '',
    maxPatients: '50',
    bio: '',
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    emailNotifications: false,
    smsNotifications: true,
  });

  // Load profile from Firebase on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!userData?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const firebaseProfile = await getUserProfile(userData.uid);
        if (firebaseProfile) {
          setProfile(prev => ({
            ...prev,
            name: firebaseProfile.name || userData.name || '',
            contactNumber: firebaseProfile.contactNumber || '',
            hospital: firebaseProfile.hospital || '',
            specialization: firebaseProfile.specialization || 'Endocrinology',
            qualification: firebaseProfile.qualification || '',
            experience: firebaseProfile.experience || '',
            consultationHours: firebaseProfile.consultationHours || '',
            licenseNumber: firebaseProfile.licenseNumber || '',
            maxPatients: firebaseProfile.maxPatients || '50',
            bio: firebaseProfile.bio || '',
          }));
          if (firebaseProfile.notifications) {
            setNotifications(firebaseProfile.notifications);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userData]);

  const handleSaveProfile = async () => {
    if (!userData?.uid) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(userData.uid, {
        ...profile,
        notifications,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal and professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={profile.contactNumber}
                onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                License Number
              </Label>
              <Input
                id="licenseNumber"
                value={profile.licenseNumber}
                onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                placeholder="Medical License #"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Professional Details
          </CardTitle>
          <CardDescription>Your medical specialization and experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                placeholder="e.g., Endocrinology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Qualification
              </Label>
              <Input
                id="qualification"
                value={profile.qualification}
                onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                placeholder="e.g., MD, MBBS, PhD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                placeholder="Years"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPatients">Max Patients Capacity</Label>
              <Input
                id="maxPatients"
                type="number"
                value={profile.maxPatients}
                onChange={(e) => setProfile({ ...profile, maxPatients: e.target.value })}
                placeholder="Maximum patients"
                min="1"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hospital" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Hospital/Clinic
              </Label>
              <Input
                id="hospital"
                value={profile.hospital}
                onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                placeholder="Hospital or Clinic name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="consultationHours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Consultation Hours
              </Label>
              <Input
                id="consultationHours"
                value={profile.consultationHours}
                onChange={(e) => setProfile({ ...profile, consultationHours: e.target.value })}
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio / About</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Write a short bio about yourself..."
                rows={3}
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Critical Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified immediately for critical patient conditions</p>
            </div>
            <Switch
              checked={notifications.criticalAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, criticalAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Warning Alerts</p>
              <p className="text-sm text-muted-foreground">Receive notifications for warning-level events</p>
            </div>
            <Switch
              checked={notifications.warningAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, warningAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alert summaries via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Get critical alerts via text message</p>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Active Sessions</p>
              <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
            </div>
            <Button variant="outline">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSettings;
