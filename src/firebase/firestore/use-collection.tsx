'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
  Query,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import type { Task } from '@/types';

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
      },
      (err) => {
        console.error("Error fetching collection: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  const add = async (newData: Omit<T, 'id'>) => {
    if (!collectionQuery) return;
    try {
      // The query has the collection path. A bit of a hack to get the ref.
      const collectionRef = collectionQuery.withConverter(null)._query.path;
      await addDoc(collection(firestore, collectionRef.segments.join('/')), newData);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  const update = async (docId: string, updatedData: Partial<T>) => {
     if (!collectionQuery) return;
    try {
      const collectionRef = collectionQuery.withConverter(null)._query.path;
      await updateDoc(doc(firestore, collectionRef.segments.join('/'), docId), updatedData);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  const remove = async (docId: string) => {
     if (!collectionQuery) return;
    try {
       const collectionRef = collectionQuery.withConverter(null)._query.path;
      await deleteDoc(doc(firestore, collectionRef.segments.join('/'), docId));
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };
  
  const reorder = async (reorderedTasks: Task[]) => {
    if (!collectionQuery) return;
    const batch = writeBatch(firestore);
    reorderedTasks.forEach((task, index) => {
      const docRef = doc(firestore, "tasks", task.id);
      batch.update(docRef, { order: index });
    });
    await batch.commit();
  };

  return { data, loading, error, add, update, remove, reorder };
}
