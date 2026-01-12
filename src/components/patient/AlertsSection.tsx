import React from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/types';
import { AlertHistoryItem } from '@/hooks/usePatientDashboard';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertsSectionProps {
  currentAlert: Alert | null;
  alertHistory: AlertHistoryItem[];
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return { 
        icon: AlertTriangle, 
        bg: 'bg-destructive/10', 
        border: 'border-destructive', 
        text: 'text-destructive',
        badge: 'bg-destructive text-destructive-foreground'
      };
    case 'HIGH':
      return { 
        icon: AlertTriangle, 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500', 
        text: 'text-orange-600',
        badge: 'bg-orange-500 text-white'
      };
    case 'MEDIUM':
      return { 
        icon: Info, 
        bg: 'bg-warning/10', 
        border: 'border-warning', 
        text: 'text-warning',
        badge: 'bg-warning text-warning-foreground'
      };
    default:
      return { 
        icon: Info, 
        bg: 'bg-info/10', 
        border: 'border-info', 
        text: 'text-info',
        badge: 'bg-info text-info-foreground'
      };
  }
};

export const AlertsSection: React.FC<AlertsSectionProps> = ({ currentAlert, alertHistory }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.section 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Bell className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Alerts</h2>
          <p className="text-sm text-muted-foreground">Health notifications and warnings</p>
        </div>
      </motion.div>

      {/* Current Active Alert */}
      <AnimatePresence>
        {currentAlert?.active && (
          <motion.div 
            className={`${getSeverityConfig(currentAlert.severity).bg} border-l-4 ${getSeverityConfig(currentAlert.severity).border} p-4 rounded-lg`}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
            }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="flex items-start gap-3"
              animate={{ 
                x: [0, -3, 3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${getSeverityConfig(currentAlert.severity).text}`} />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${getSeverityConfig(currentAlert.severity).text}`}>
                    🚨 ACTIVE ALERT
                  </span>
                  <motion.span 
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityConfig(currentAlert.severity).badge}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {currentAlert.severity}
                  </motion.span>
                </div>
                <p className={`text-sm font-medium ${getSeverityConfig(currentAlert.severity).text}`}>
                  {currentAlert.message}
                </p>
                {currentAlert.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(currentAlert.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Alert History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertHistory.length === 0 ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
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
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No alerts in your history</p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {alertHistory.map((alert, index) => {
                  const config = getSeverityConfig(alert.severity);
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={alert.id || index}
                      variants={itemVariants}
                      whileHover={{ x: 5, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className={`${config.bg} border-l-4 ${config.border} p-3 rounded-lg`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${config.text} mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-semibold ${config.text}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.timestamp * 1000), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm ${config.text}`}>{alert.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
};

export default AlertsSection;
