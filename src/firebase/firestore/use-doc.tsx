'use client';
import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseDocOptions {
  listen?: boolean;
}

export function useDoc<T extends DocumentData>(
  docRef: DocumentReference<T> | null,
  options: UseDocOptions = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching document: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  const set = async (newData: T, options?: { merge: boolean }) => {
    if (!docRef) return;
    try {
      await setDoc(docRef, newData, { merge: options?.merge });
    } catch (e) {
       console.error(e);
       setError(e as Error);
    }
  };

  const update = async (updatedData: Partial<T>) => {
    if (!docRef) return;
    try {
      await updateDoc(docRef, updatedData);
    } catch (e) {
       console.error(e);
       setError(e as Error);
    }
  };

  const remove = async () => {
    if (!docRef) return;
    try {
      await deleteDoc(docRef);
    } catch (e) {
       console.error(e);
       setError(e as Error);
    }
  };

  return { data, loading, error, set, update, remove };
}
