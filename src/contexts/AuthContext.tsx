import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { 
  auth, 
  onAuthStateChanged, 
  getUserData, 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  logout,
  UserData,
  UserRole 
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from database
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginWithEmail(email, password);
    const data = await getUserData(user.uid);
    setUserData(data);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { userData: data } = await signupWithEmail(email, password, name);
    setUserData(data);
  };

  const googleLogin = async () => {
    const { userData: data } = await loginWithGoogle();
    setUserData(data);
  };

  const signOut = async () => {
    await logout();
    setUserData(null);
  };

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    login,
    signup,
    googleLogin,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { UserRole, UserData };
