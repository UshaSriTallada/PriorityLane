
'use client';
import DashboardClient from '@/components/dashboard-client';
import { useDivisions } from '@/hooks/use-divisions';
import { notFound } from 'next/navigation';

interface DivisionDashboardPageProps {
  params: { division: string };
}


export default function DivisionDashboardPage({ params }: DivisionDashboardPageProps) {
    const { divisions } = useDivisions();
  
    const decodedDivision = decodeURIComponent(params.division);

    const getDivisionDisplayName = (slug: string) => {
        return divisions.find(d => d.toLowerCase() === slug) || slug;
    }
    
    const divisionDisplayName = getDivisionDisplayName(decodedDivision);

    // If the division doesn't exist in our state, show a 404 page.
    if (!divisions.map(d => d.toLowerCase()).includes(decodedDivision)) {
        notFound();
    }

    return (
        <DashboardClient 
            selectedDivision={divisionDisplayName}
        />
    );
}
