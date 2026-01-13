import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Save, Loader2, Settings, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserData, getUserProfile, updateUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AdminSettingsProps {
  userData: UserData | null;
}

interface AdminProfile {
  name: string;
  contactNumber: string;
  department: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ userData }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<AdminProfile>({
    name: userData?.name || '',
    contactNumber: '',
    department: 'System Administration',
  });

  const [notifications, setNotifications] = useState({
    systemAlerts: true,
    userRegistrations: true,
    criticalPatientAlerts: true,
    emailNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoApproveUsers: false,
    maintenanceMode: false,
    debugMode: false,
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
            department: firebaseProfile.department || 'System Administration',
          }));
          if (firebaseProfile.notifications) {
            setNotifications(firebaseProfile.notifications);
          }
          if (firebaseProfile.systemSettings) {
            setSystemSettings(firebaseProfile.systemSettings);
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
        systemSettings,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Settings saved",
        description: "Your admin settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Admin Settings
        </h2>
        <p className="text-muted-foreground">Manage your admin account and system preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your admin account details</CardDescription>
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
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={profile.contactNumber}
                onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
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
          <CardDescription>Configure admin notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified about system events and errors</p>
            </div>
            <Switch
              checked={notifications.systemAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">User Registrations</p>
              <p className="text-sm text-muted-foreground">Get notified when new users register</p>
            </div>
            <Switch
              checked={notifications.userRegistrations}
              onCheckedChange={(checked) => setNotifications({ ...notifications, userRegistrations: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Critical Patient Alerts</p>
              <p className="text-sm text-muted-foreground">Receive all critical patient health alerts</p>
            </div>
            <Switch
              checked={notifications.criticalPatientAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, criticalPatientAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system-wide settings (requires admin privileges)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Approve New Users</p>
              <p className="text-sm text-muted-foreground">Automatically approve new user registrations</p>
            </div>
            <Switch
              checked={systemSettings.autoApproveUsers}
              onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoApproveUsers: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground text-warning">This will prevent users from accessing the system</p>
            </div>
            <Switch
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Debug Mode</p>
              <p className="text-sm text-muted-foreground">Enable verbose logging for debugging</p>
            </div>
            <Switch
              checked={systemSettings.debugMode}
              onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, debugMode: checked })}
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
          <CardDescription>Manage admin account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your admin password</p>
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
              <p className="font-medium">Activity Log</p>
              <p className="text-sm text-muted-foreground">View your recent admin activity</p>
            </div>
            <Button variant="outline">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
