import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, User, Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { database, ref, onValue } from '@/lib/firebase';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

interface AppointmentsSectionProps {
  patientId: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'phone': return <Phone className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'video': return 'Video Call';
    case 'phone': return 'Phone Call';
    default: return 'In-Person';
  }
};

const getDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
};

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ patientId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }

    // Listen to patient's appointments from Firebase
    const appointmentsRef = ref(database, `patients/${patientId}/appointments`);
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const appointmentsList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        // Sort by date and time
        setAppointments(appointmentsList.sort((a, b) => 
          new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
        ));
      } else {
        // No appointments - set sample data for demo
        setAppointments([
          {
            id: '1',
            doctorName: 'Dr. Sarah Johnson',
            doctorSpecialty: 'Endocrinologist',
            date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
            time: '10:00',
            type: 'video',
            status: 'scheduled',
            notes: 'Quarterly diabetes checkup'
          },
          {
            id: '2',
            doctorName: 'Dr. Michael Chen',
            doctorSpecialty: 'Cardiologist',
            date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            time: '14:30',
            type: 'in-person',
            status: 'scheduled',
            location: 'City Medical Center, Room 305'
          }
        ]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [patientId]);

  const upcomingAppointments = appointments.filter(a => 
    a.status === 'scheduled' && new Date(`${a.date} ${a.time}`) >= new Date()
  );

  const pastAppointments = appointments.filter(a => 
    a.status === 'completed' || new Date(`${a.date} ${a.time}`) < new Date()
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Appointments</h2>
            <p className="text-sm text-muted-foreground">Your scheduled consultations</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Appointments</h2>
            <p className="text-sm text-muted-foreground">Your scheduled consultations</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Book New
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-foreground font-medium">No Upcoming Appointments</p>
              <p className="text-sm text-muted-foreground">Schedule a consultation with your doctor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg px-3 py-2 min-w-[70px]">
                    <span className="text-xs font-medium text-primary uppercase">
                      {getDateLabel(apt.date)}
                    </span>
                    <span className="text-lg font-bold text-foreground">{apt.time}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{apt.doctorName}</h4>
                      <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {getTypeIcon(apt.type)}
                        {getTypeLabel(apt.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{apt.doctorSpecialty}</p>
                    {apt.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {apt.location}
                      </p>
                    )}
                    {apt.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{apt.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {apt.type === 'video' && (
                      <Button size="sm" className="gap-1.5">
                        <Video className="w-4 h-4" />
                        Join
                      </Button>
                    )}
                    <Button size="sm" variant="outline">Reschedule</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              Past Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.slice(0, 3).map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.date), 'MMM d, yyyy')} at {apt.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default AppointmentsSection;
