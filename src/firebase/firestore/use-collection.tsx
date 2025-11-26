
'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import type { Task } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseCollectionOptions<T> {
  orderBy?: keyof T;
  listen?: boolean;
}

export function useCollection<T extends DocumentData>(
  collectionQuery: Query<T> | null,
  options: UseCollectionOptions<T> = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionQuery) {
        setData([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(newData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Safely get the path from the public query API
        const path = collectionQuery.path;
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list'
        }, err);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  const add = async (newData: Omit<T, 'id'>) => {
    if (!collectionQuery) return;
    const path = collectionQuery.path;
    addDoc(collection(firestore, path), newData).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path,
        operation: 'create',
        requestResourceData: newData,
      }, serverError);
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
    });
  };

  const update = async (docId: string, updatedData: Partial<T>) => {
     if (!collectionQuery) return;
     const path = collectionQuery.path;
     const docRef = doc(firestore, path, docId);
     updateDoc(docRef, updatedData).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
     });
  };

  const remove = async (docId: string) => {
     if (!collectionQuery) return;
    const path = collectionQuery.path;
    const docRef = doc(firestore, path, docId);
    deleteDoc(docRef).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
    });
  };
  
  const reorder = async (reorderedTasks: Task[]) => {
    if (!collectionQuery) return;
    const batch = writeBatch(firestore);
    reorderedTasks.forEach((task, index) => {
      const docRef = doc(firestore, "tasks", task.id);
      batch.update(docRef, { order: index });
    });
    
    batch.commit().catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'tasks', // This is a batch, path is more general
            operation: 'update',
            requestResourceData: { info: "Batch reorder operation" }
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
    });
  };

  return { data, loading, error, add, update, remove, reorder };
}
