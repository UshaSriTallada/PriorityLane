
'use client';
import DashboardClient from '@/components/dashboard-client';
import { useDivisions } from '@/hooks/use-divisions';

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

    return (
        <DashboardClient 
            selectedDivision={divisionDisplayName}
        />
    );
}
