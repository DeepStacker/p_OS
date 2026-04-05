import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isMockAuth = !import.meta.env.VITE_FIREBASE_API_KEY;
    
    if (isMockAuth) {
      console.log("Auth System: Development mode active (No Firebase detected).");
      const savedUser = localStorage.getItem("demo_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const isMockAuth = !import.meta.env.VITE_FIREBASE_API_KEY;

    if (isMockAuth) {
        const mockUser = {
            uid: "demo-user-123",
            displayName: "Demo User",
            email: "admin@system.node",
            photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        } as User;
        setUser(mockUser);
        localStorage.setItem("demo_user", JSON.stringify(mockUser));
        toast.success("Signed in with demo account.");
        return;
    }

    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const cancelCodes = [
        'auth/cancelled-popup-request',
        'auth/popup-closed-by-user',
        'auth/popup-blocked',
      ];
      if (cancelCodes.includes(error.code)) {
        if (error.code === 'auth/popup-blocked') {
          toast.error("Authentication popup blocked. Please allow popups for this site.");
        }
        console.log("Sign-in cancelled or blocked by user/browser");
        return;
      }
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const isMockAuth = !import.meta.env.VITE_FIREBASE_API_KEY;

    if (isMockAuth) {
        setUser(null);
        localStorage.removeItem("demo_user");
        toast.info("Logged out of demo account.");
        return;
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
