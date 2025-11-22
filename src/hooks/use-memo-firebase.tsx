
'use client';
import { useMemo, DependencyList } from 'react';
import {
  DocumentReference,
  Query,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

// This is a helper function to create a stable string representation of a query or doc ref
// so that it can be used as a dependency in hooks like useMemo or useEffect.
const getRefPath = (ref: Query | DocumentReference): string => {
  if (ref instanceof DocumentReference) {
    return ref.path;
  }
  // For queries, we need a more detailed representation.
  // This is a simplified version and might need to be expanded for more complex queries.
  // @ts-ignore: _query is a private property but we need it to create a stable key
  const q = ref._query;
  const path = q.path.segments.join('/');
  const constraints = q.constraints
    .map((c: any) => `${c.type}-${c.field?.segments.join('.')}-${c._op}-${c._value}`)
    .join('_');
  return `${path}|${constraints}`;
};

/**
 * A custom hook that memoizes a Firestore query or document reference.
 * This is crucial for preventing infinite loops in `useEffect` when using
 * Firestore listeners (`useCollection`, `useDoc`).
 *
 * @param factory A function that returns a Firestore Query or DocumentReference, or null.
 * @param deps The dependency array for the useMemo hook.
 * @returns The memoized query or document reference.
 */
export function useMemoFirebase<T extends Query | DocumentReference | null>(
  factory: () => T,
  deps: DependencyList
): T {
  const dependencies = deps.map(dep => {
    if (dep && (dep instanceof Query || dep instanceof DocumentReference)) {
      return getRefPath(dep);
    }
    return dep;
  });

  return useMemo(factory, dependencies);
}
