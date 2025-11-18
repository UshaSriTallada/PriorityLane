'use client';
import DashboardClient from '@/components/dashboard-client';
import { use } from 'react';
import { useDivisions } from '@/hooks/use-divisions';

interface DivisionDashboardPageProps {
  params: { division: string };
}


export default function DivisionDashboardPage({ params }: DivisionDashboardPageProps) {
    const { divisions } = useDivisions();
    const resolvedParams = use(Promise.resolve(params));
  
    const decodedDivision = decodeURIComponent(resolvedParams.division);
    const divisionExists = divisions.map(d => d.toLowerCase()).includes(decodedDivision);

    const getDivisionDisplayName = (slug: string) => {
        return divisions.find(d => d.toLowerCase() === slug) || slug;
    }
    
    if (!divisionExists) {
        // We could show notFound(), but for a better UX with newly added divisions,
        // we'll just show an empty task list.
    }
    
    const divisionDisplayName = getDivisionDisplayName(decodedDivision);

    return (
        <DashboardClient 
            selectedDivision={divisionDisplayName}
        />
    );
}
