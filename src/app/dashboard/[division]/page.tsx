
'use client';
import { use } from 'react';
import DashboardClient from '@/components/dashboard-client';
import { useDivisions } from '@/hooks/use-divisions';

interface DivisionDashboardPageProps {
  params: { division: string };
}


export default function DivisionDashboardPage({ params }: DivisionDashboardPageProps) {
    const { divisions } = useDivisions();
    
    // Using React.use() as recommended by the Next.js warning.
    const resolvedParams = use(Promise.resolve(params));
  
    const decodedDivision = decodeURIComponent(resolvedParams.division);

    const getDivisionDisplayName = (slug: string) => {
        return divisions.find(d => d.toLowerCase() === slug) || slug;
    }
    
    const divisionDisplayName = getDivisionDisplayName(decodedDivision);

    return (
        <DashboardClient 
            selectedDivision={divisionDisplayName}
        />
    );
}
