import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  UserData,
  UserRole,
  getUserData,
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthUserChanged,
  signupWithEmail,
} from "@/lib/firebase";

interface AuthContextType {
  user: AuthUser | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      getUserData(firebaseUser.uid)
        .then((data) => setUserData(data))
        .finally(() => setIsLoading(false));
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await loginWithEmail(email, password);
    setUser(u);
    const data = await getUserData(u.uid);
    setUserData(data);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { user: u, userData: data } = await signupWithEmail(email, password, name);
    setUser(u);
    setUserData(data);
  };

  const googleLogin = async () => {
    const { user: u, userData: data } = await loginWithGoogle();
    setUser(u);
    setUserData(data);
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setUserData(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, userData, isLoading, login, signup, googleLogin, signOut }),
    [user, userData, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { UserRole, UserData, AuthUser };
