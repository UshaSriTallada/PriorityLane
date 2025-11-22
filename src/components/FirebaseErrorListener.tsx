'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This component is a client-side component that listens for Firestore permission errors
// and throws them as uncaught exceptions. This is useful for development because
// Next.js will display these errors in a full-screen overlay, making them easy to see and debug.
// In a production environment, you might want to replace this with a more user-friendly
// error reporting system (e.g., logging to a service, showing a toast notification).
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Throw the error so that Next.js can catch it and display the overlay.
      // The information in the error message is crucial for debugging security rules.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything
}
