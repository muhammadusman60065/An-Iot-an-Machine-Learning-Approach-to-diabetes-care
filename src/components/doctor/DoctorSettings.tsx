import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface DoctorSettingsProps {
  userData: UserData | null;
}

const DoctorSettings: React.FC<DoctorSettingsProps> = ({ userData }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: '',
    specialty: 'Endocrinology',
    hospital: 'City Medical Center',
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    appointmentReminders: true,
    emailNotifications: false,
    smsNotifications: true,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
  };

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
          <CardDescription>Update your personal details</CardDescription>
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
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hospital">Hospital/Clinic</Label>
              <Input
                id="hospital"
                value={profile.hospital}
                onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
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
              <p className="font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded before scheduled appointments</p>
            </div>
            <Switch
              checked={notifications.appointmentReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
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
