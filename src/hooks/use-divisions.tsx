'use client';
import { Task } from "@/types";
import { createContext, useContext, ReactNode } from "react";

interface DivisionContextType {
    divisions: Task['division'][];
    onDivisionCreate: (name: string) => void;
    onDivisionUpdate: (oldName: string, newName: string) => void;
    onDivisionDelete: (name: string) => void;
}

const DivisionContext = createContext<DivisionContextType | undefined>(undefined);

export function DivisionProvider({ children, divisions, onDivisionCreate, onDivisionUpdate, onDivisionDelete }: { children: ReactNode } & DivisionContextType) {
    return (
        <DivisionContext.Provider value={{ divisions, onDivisionCreate, onDivisionUpdate, onDivisionDelete }}>
            {children}
        </DivisionContext.Provider>
    );
}

export function useDivisions() {
    const context = useContext(DivisionContext);
    if (context === undefined) {
        throw new Error('useDivisions must be used within a DivisionProvider');
    }
    return context;
}
