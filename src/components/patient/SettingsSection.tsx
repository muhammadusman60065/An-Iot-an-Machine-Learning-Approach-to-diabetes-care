import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Save, Phone, MapPin, Heart, Ruler, Weight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SettingsSectionProps {
  patientName: string;
  patientEmail: string;
}

interface PatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  bloodType: string;
  height: string;
  weight: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

interface NotificationSettings {
  criticalAlerts: boolean;
  dailySummary: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface DisplayPreferences {
  glucoseUnit: string;
  temperatureUnit: string;
}

const STORAGE_KEY_PROFILE = 'patient_profile_settings';
const STORAGE_KEY_NOTIFICATIONS = 'patient_notification_settings';
const STORAGE_KEY_PREFERENCES = 'patient_display_preferences';

export const SettingsSection: React.FC<SettingsSectionProps> = ({ patientName, patientEmail }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Parse name into first and last name
  const nameParts = patientName.split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  const [profile, setProfile] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to defaults
      }
    }
    return {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: patientEmail || '',
      phone: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      bloodType: '',
      height: '',
      weight: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      medicalConditions: '',
      allergies: '',
      currentMedications: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
    };
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to defaults
      }
    }
    return {
      criticalAlerts: true,
      dailySummary: true,
      appointmentReminders: true,
      medicationReminders: true,
      emailNotifications: false,
      pushNotifications: true,
    };
  });

  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFERENCES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to defaults
      }
    }
    return {
      glucoseUnit: 'mg/dL',
      temperatureUnit: 'celsius',
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientProfile, string>>>({});

  const validateProfile = (): boolean => {
    const newErrors: Partial<Record<keyof PatientProfile, string>> = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (profile.phone && !/^[\d\s\-+()]*$/.test(profile.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (profile.age && (isNaN(Number(profile.age)) || Number(profile.age) < 0 || Number(profile.age) > 150)) {
      newErrors.age = 'Please enter a valid age';
    }

    if (profile.height && (isNaN(Number(profile.height)) || Number(profile.height) < 0)) {
      newErrors.height = 'Please enter a valid height';
    }

    if (profile.weight && (isNaN(Number(profile.weight)) || Number(profile.weight) < 0)) {
      newErrors.weight = 'Please enter a valid weight';
    }

    if (profile.emergencyContactPhone && !/^[\d\s\-+()]*$/.test(profile.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(preferences));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const updateProfile = (field: keyof PatientProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
                placeholder="First name"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
                placeholder="Last name"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => updateProfile('age', e.target.value)}
                placeholder="Age"
                min="0"
                max="150"
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={profile.bloodType} onValueChange={(value) => updateProfile('bloodType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
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
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="w-5 h-5 text-primary" />
            Physical Measurements
          </CardTitle>
          <CardDescription>Your height and weight information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={profile.height}
                onChange={(e) => updateProfile('height', e.target.value)}
                placeholder="175"
                min="0"
                className={errors.height ? 'border-destructive' : ''}
              />
              {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={profile.weight}
                onChange={(e) => updateProfile('weight', e.target.value)}
                placeholder="70"
                min="0"
                className={errors.weight ? 'border-destructive' : ''}
              />
              {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-primary" />
            Address
          </CardTitle>
          <CardDescription>Your home address (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => updateProfile('address', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => updateProfile('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) => updateProfile('state', e.target.value)}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={profile.zipCode}
                onChange={(e) => updateProfile('zipCode', e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={profile.emergencyContactName}
                onChange={(e) => updateProfile('emergencyContactName', e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={profile.emergencyContactPhone}
                onChange={(e) => updateProfile('emergencyContactPhone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={errors.emergencyContactPhone ? 'border-destructive' : ''}
              />
              {errors.emergencyContactPhone && <p className="text-sm text-destructive">{errors.emergencyContactPhone}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
              <Select 
                value={profile.emergencyContactRelationship} 
                onValueChange={(value) => updateProfile('emergencyContactRelationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-5 h-5 text-primary" />
            Medical Information
          </CardTitle>
          <CardDescription>Your health conditions and medications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Medical Conditions</Label>
            <Textarea
              id="medicalConditions"
              value={profile.medicalConditions}
              onChange={(e) => updateProfile('medicalConditions', e.target.value)}
              placeholder="List any medical conditions (e.g., Type 2 Diabetes, Hypertension)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={profile.allergies}
              onChange={(e) => updateProfile('allergies', e.target.value)}
              placeholder="List any allergies (e.g., Penicillin, Peanuts)"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              value={profile.currentMedications}
              onChange={(e) => updateProfile('currentMedications', e.target.value)}
              placeholder="List current medications and dosages"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            Insurance Information
          </CardTitle>
          <CardDescription>Your health insurance details (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={profile.insuranceProvider}
                onChange={(e) => updateProfile('insuranceProvider', e.target.value)}
                placeholder="Insurance company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={profile.insurancePolicyNumber}
                onChange={(e) => updateProfile('insurancePolicyNumber', e.target.value)}
                placeholder="Policy number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure how you receive health alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Critical Health Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified immediately for critical conditions</p>
            </div>
            <Switch
              checked={notifications.criticalAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, criticalAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Daily Summary</p>
              <p className="text-sm text-muted-foreground">Receive daily health report summary</p>
            </div>
            <Switch
              checked={notifications.dailySummary}
              onCheckedChange={(checked) => setNotifications({ ...notifications, dailySummary: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded before scheduled appointments</p>
            </div>
            <Switch
              checked={notifications.appointmentReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Medication Reminders</p>
              <p className="text-sm text-muted-foreground">Reminders for medication schedules</p>
            </div>
            <Switch
              checked={notifications.medicationReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, medicationReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Browser push notifications for alerts</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5 text-primary" />
            Display Preferences
          </CardTitle>
          <CardDescription>Customize units for vitals display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Glucose Unit</Label>
              <div className="flex gap-2">
                {['mg/dL', 'mmol/L'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setPreferences({ ...preferences, glucoseUnit: unit })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferences.glucoseUnit === unit
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temperature Unit</Label>
              <div className="flex gap-2">
                {[
                  { value: 'celsius', label: '°C' },
                  { value: 'fahrenheit', label: '°F' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, temperatureUnit: option.value })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferences.temperatureUnit === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Connected Devices</p>
              <p className="text-sm text-muted-foreground">Manage IoT devices linked to your account</p>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </section>
  );
};

export default SettingsSection;
