'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export interface PagePermission {
  path: string;
  name_ko: string;
  name_en: string;
  isPublic: boolean;
  requireAuth: boolean;
  requireAdmin: boolean;
  description_ko: string;
  description_en: string;
}

// LocalStorage key - must match the one in admin/pages/page.tsx
const STORAGE_KEY = 'pagePermissions_v2';

// Cache for permissions
let cachedPermissions: Record<string, { public: boolean; requireAuth: boolean; requireAdmin: boolean }> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds - shorter to catch updates faster

// Load from localStorage
function loadFromStorage(): PagePermission[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error('Failed to load permissions from localStorage');
  }
  return null;
}

// Convert localStorage format to API format
function convertToApiFormat(permissions: PagePermission[]): Record<string, { public: boolean; requireAuth: boolean; requireAdmin: boolean }> {
  const result: Record<string, { public: boolean; requireAuth: boolean; requireAdmin: boolean }> = {};
  for (const p of permissions) {
    result[p.path] = {
      public: p.isPublic,
      requireAuth: p.requireAuth,
      requireAdmin: p.requireAdmin,
    };
  }
  return result;
}

// Fetch permissions - prioritize localStorage, then API
async function fetchPermissions(forceRefresh = false): Promise<Record<string, { public: boolean; requireAuth: boolean; requireAdmin: boolean }> | null> {
  const now = Date.now();

  // Return cached if valid and not forcing refresh
  if (!forceRefresh && cachedPermissions && now - lastFetchTime < CACHE_TTL) {
    return cachedPermissions;
  }

  // First check localStorage
  const localData = loadFromStorage();
  if (localData && localData.length > 0) {
    cachedPermissions = convertToApiFormat(localData);
    lastFetchTime = now;
    return cachedPermissions;
  }

  // Then try API
  try {
    const response = await fetch('/api/page-permissions');
    const data = await response.json();
    if (data.pages && Object.keys(data.pages).length > 0) {
      cachedPermissions = data.pages;
      lastFetchTime = now;
      return data.pages;
    }
  } catch (error) {
    console.error('Error fetching page permissions:', error);
  }

  return null;
}

export function usePagePermission() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [permissionVersion, setPermissionVersion] = useState(0);

  // Listen for permission updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        // Clear cache to force refresh
        cachedPermissions = null;
        setPermissionVersion(v => v + 1);
      }
    };

    const handlePermissionUpdate = () => {
      // Clear cache to force refresh
      cachedPermissions = null;
      setPermissionVersion(v => v + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('permissionsUpdated', handlePermissionUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
    };
  }, []);

  const checkPermission = useCallback(async () => {
    if (isLoading) return;

    // Admin pages always require admin access
    if (pathname.startsWith('/admin')) {
      if (!user || !isAdmin) {
        setIsAllowed(false);
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      } else {
        setIsAllowed(true);
      }
      setIsChecking(false);
      return;
    }

    // Fetch permissions
    const permissions = await fetchPermissions();

    // Find permission for current path
    let pathPermission = permissions?.[pathname];

    // For nested paths like /docs/guide/wallet, check parent paths
    if (!pathPermission && permissions) {
      const parts = pathname.split('/').filter(Boolean);
      for (let i = parts.length; i > 0; i--) {
        const checkPath = '/' + parts.slice(0, i).join('/');
        pathPermission = permissions[checkPath];
        if (pathPermission) break;
      }
    }

    // If no permission found, default to public
    if (!pathPermission) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    // Check access based on permission
    if (pathPermission.public) {
      setIsAllowed(true);
    } else if (pathPermission.requireAdmin) {
      if (!user || !isAdmin) {
        setIsAllowed(false);
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      } else {
        setIsAllowed(true);
      }
    } else if (pathPermission.requireAuth) {
      if (!user) {
        setIsAllowed(false);
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      } else {
        setIsAllowed(true);
      }
    } else {
      setIsAllowed(true);
    }

    setIsChecking(false);
  }, [pathname, user, isAdmin, isLoading, router]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission, permissionVersion]);

  return { isAllowed, isChecking: isLoading || isChecking, user, isAdmin };
}

export function ProtectedPage({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAllowed, isChecking, user, isAdmin } = usePagePermission();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (requireAdmin && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Login required</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper function to get current permissions (for other components)
export function getPagePermissions(): PagePermission[] {
  const localData = loadFromStorage();
  return localData || [];
}
