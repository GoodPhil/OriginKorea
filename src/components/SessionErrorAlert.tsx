'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, X } from 'lucide-react';

export function SessionErrorAlert() {
  const { sessionError, clearSessionError } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (sessionError) {
      setIsVisible(true);
    }
  }, [sessionError]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      clearSessionError();
    }, 300);
  };

  if (!sessionError) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-destructive text-destructive-foreground px-6 py-4 rounded-lg shadow-lg max-w-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">세션 종료</p>
          <p className="text-sm opacity-90 mt-1 whitespace-pre-line">
            {sessionError}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
