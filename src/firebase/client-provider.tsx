'use client';

import React, { ReactNode, useMemo } from 'react';
import { initializeFirebase, FirebaseProvider } from './index';

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const firebaseContextValue = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider value={firebaseContextValue}>{children}</FirebaseProvider>;
};
