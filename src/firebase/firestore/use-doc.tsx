
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
  UpdateData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get'
        }, err);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  const set = async (newData: T, options?: { merge?: boolean }) => {
    if (!docRef) return;
    // Cast the docRef to the specific generic type T to satisfy setDoc's signature.
    return setDoc(docRef as DocumentReference<T>, newData, { merge: options?.merge }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: options?.merge ? 'update' : 'create',
        requestResourceData: newData,
      }, serverError);
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      throw permissionError;
    });
  };

  const update = async (updatedData: UpdateData<T>) => {
    if (!docRef) return;
    return updateDoc(docRef, updatedData).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }, serverError);
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      throw permissionError;
    });
  };

  const remove = async () => {
    if (!docRef) return;
    return deleteDoc(docRef).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }, serverError);
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      throw permissionError;
    });
  };

  return { data, loading, error, set, update, remove };
}
