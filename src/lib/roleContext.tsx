import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Role, Permission } from '@/types/permissions';
import { useKV } from '@github/spark/hooks';

interface RoleContextType {
  previewRole: Role | null;
  setPreviewRole: (role: Role | null) => void;
  isPreviewMode: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [previewRole, setPreviewRole] = useState<Role | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const isPreviewMode = previewRole !== null;

  const hasPermission = (permission: Permission): boolean => {
    if (!isPreviewMode) {
      return true;
    }
    
    return previewRole?.permissions.includes(permission) || false;
  };

  if (!isReady) {
    return null;
  }

  return (
    <RoleContext.Provider
      value={{
        previewRole,
        setPreviewRole,
        isPreviewMode,
        hasPermission,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === null) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
