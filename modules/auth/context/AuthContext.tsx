import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { UserProfile } from '../../shared/domain/types';

interface AuthContextType {
  user: UserProfile | null;
  isPro: boolean;
  isLoading: boolean;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  const [isGuest, setIsGuest] = useState(false);
  const [appUser, setAppUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        // Mapear usuario de Clerk a nuestra estructura
        const tier = (clerkUser.publicMetadata?.tier as 'basic' | 'pro') || 'basic';
        
        setAppUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          tier: tier
        });
        setIsGuest(false);
      } else if (isGuest) {
        // Mantener usuario invitado
        setAppUser({
            id: 'guest',
            email: 'invitado@debatetimer.com',
            tier: 'basic'
        });
      } else {
        // No hay usuario
        setAppUser(null);
      }
    }
  }, [isLoaded, clerkUser, isGuest]);

  const signInAsGuest = () => {
    setIsGuest(true);
  };

  const signOut = async () => {
    if (isGuest) {
      setIsGuest(false);
      setAppUser(null);
    } else {
      await clerkSignOut();
    }
  };

  const isPro = appUser?.tier === 'pro';

  return (
    <AuthContext.Provider value={{ 
        user: appUser, 
        isPro, 
        isLoading: !isLoaded, 
        signInAsGuest, 
        signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};