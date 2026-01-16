import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { UserCheck, Phone, Award, Building2, Mail, BadgeCheck, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface DoctorInfo {
  name: string;
  specialization: string;
  hospital: string;
  contactNumber: string;
  licenseNumber?: string;
  qualification?: string;
  experience?: string;
  consultationHours?: string;
  email?: string;
}

interface AssignedDoctorProps {
  patientUid: string;
}

export const AssignedDoctor: React.FC<AssignedDoctorProps> = ({ patientUid }) => {
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignedDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get patient's assigned doctor UID
        const patientRef = ref(database, `users/${patientUid}`);
        const patientSnap = await get(patientRef);

        if (!patientSnap.exists()) {
          setError('Patient data not found');
          setLoading(false);
          return;
        }

        const patientData = patientSnap.val();
        const assignedDoctorUid = patientData.assignedDoctor;

        if (!assignedDoctorUid) {
          setDoctor(null);
          setLoading(false);
          return;
        }

        // Fetch doctor's profile
        const doctorRef = ref(database, `users/${assignedDoctorUid}`);
        const doctorSnap = await get(doctorRef);

        if (doctorSnap.exists()) {
          const doctorData = doctorSnap.val();
          setDoctor({
            name: doctorData.profile?.name || doctorData.name || 'Unknown',
            specialization: doctorData.profile?.specialization || 'N/A',
            hospital: doctorData.profile?.hospital || 'N/A',
            contactNumber: doctorData.profile?.contactNumber || doctorData.contactNumber || 'N/A',
            licenseNumber: doctorData.profile?.licenseNumber,
            qualification: doctorData.profile?.qualification || doctorData.profile?.qualifications,
            experience: doctorData.profile?.experience,
            consultationHours: doctorData.profile?.consultationHours,
            email: doctorData.email
          });
        } else {
          setError('Doctor profile not found');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to load doctor information');
        setLoading(false);
      }
    };

    if (patientUid) {
      fetchAssignedDoctor();
    }
  }, [patientUid]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!doctor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Doctor Assigned</h3>
            <p className="text-muted-foreground text-sm">
              Please contact your healthcare provider to get a doctor assigned.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            Your Assigned Doctor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Doctor Name */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {doctor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Specialization */}
            <motion.div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 5 }}
            >
              <Award className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="text-foreground font-medium">{doctor.specialization}</p>
              </div>
            </motion.div>

            {/* Hospital */}
            <motion.div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 5 }}
            >
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Hospital</p>
                <p className="text-foreground font-medium">{doctor.hospital}</p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 5 }}
            >
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="text-foreground font-medium">{doctor.contactNumber}</p>
              </div>
            </motion.div>

            {/* Email */}
            {doctor.email && (
              <motion.div 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{doctor.email}</p>
                </div>
              </motion.div>
            )}

            {/* License Number */}
            {doctor.licenseNumber && (
              <motion.div 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="text-foreground font-medium">{doctor.licenseNumber}</p>
                </div>
              </motion.div>
            )}

            {/* Qualification */}
            {doctor.qualification && (
              <motion.div 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="text-foreground font-medium">{doctor.qualification}</p>
                </div>
              </motion.div>
            )}

            {/* Experience */}
            {doctor.experience && (
              <motion.div 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Award className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-foreground font-medium">{doctor.experience}</p>
                </div>
              </motion.div>
            )}

            {/* Consultation Hours */}
            {doctor.consultationHours && (
              <motion.div 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Hours</p>
                  <p className="text-foreground font-medium">{doctor.consultationHours}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Contact Button */}
          <Button asChild className="w-full" size="lg">
            <a href={`tel:${doctor.contactNumber}`}>
              <Phone className="w-4 h-4 mr-2" />
              Contact Doctor
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssignedDoctor;
