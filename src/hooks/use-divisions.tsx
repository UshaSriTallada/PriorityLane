'use client';
import { ReactNode } from "react";
import { useStateManager } from "./use-state-manager";

// Note: The DivisionProvider and its context are no longer needed as state is centralized
// in StateProvider. This hook now acts as a convenient wrapper around useStateManager
// to provide just the division-related state and functions.

/**
 * @deprecated The DivisionProvider is no longer used. State is managed by StateProvider.
 */
export function DivisionProvider({ children }: { children: ReactNode }) {
    // This provider is deprecated and now just passes through its children.
    // The actual state is managed by StateProvider in the root layout.
    return <>{children}</>;
}

/**
 * A hook to access division-related state and actions.
 * It must be used within a component tree wrapped by `StateProvider`.
 */
export function useDivisions() {
    // The useDivisions hook now gets its state from the centralized useStateManager.
    const { divisions, onDivisionCreate, onDivisionUpdate, onDivisionDelete } = useStateManager();
    return { divisions, onDivisionCreate, onDivisionUpdate, onDivisionDelete };
}
