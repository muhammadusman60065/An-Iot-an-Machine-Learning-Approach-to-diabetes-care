import { useState, useEffect, useCallback } from 'react';
import { 
  onAuthUserChanged, 
  loginWithEmail, 
  logout as firebaseLogout,
  getUserData,
  type AuthUser,
  type UserData
} from '@/lib/firebase';
import { UserProfile } from '@/types';

interface UseAuthReturn {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Firebase Realtime Database
  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const userData = await getUserData(uid);
      if (userData) {
        // Map UserData to UserProfile format
        const profile: UserProfile = {
          uid: userData.uid,
          email: userData.email,
          role: userData.role,
          patientId: userData.patientId,
          assignedPatients: userData.assignedPatients,
          profile: {
            name: userData.name,
          },
          createdAt: userData.createdAt,
        };
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        await fetchUserProfile(authUser.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const authUser = await loginWithEmail(email, password);
      setUser(authUser);
      await fetchUserProfile(authUser.uid);
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await firebaseLogout();
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    userProfile,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;
