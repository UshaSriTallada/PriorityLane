
'use client';

import DashboardClient from '@/components/dashboard-client';
import { useDivisions } from '@/hooks/use-divisions';
import { notFound } from 'next/navigation';

interface DivisionDashboardClientProps {
  divisionSlug: string;
}

// This new component contains all the client-side logic that was previously in the page.
export default function DivisionDashboardClient({ divisionSlug }: DivisionDashboardClientProps) {
  const { divisions } = useDivisions();

  const getDivisionDisplayName = (slug: string) => {
    // Find a division whose lowercase version matches the slug.
    return divisions.find(d => d.toLowerCase() === slug.toLowerCase()) || slug;
  };
  
  const divisionDisplayName = getDivisionDisplayName(divisionSlug);

  // If the divisions have loaded and the current slug doesn't match any of them,
  // show a 404 page.
  if (divisions.length > 0 && !divisions.map(d => d.toLowerCase()).includes(divisionSlug.toLowerCase())) {
    notFound();
  }

  return (
    <DashboardClient 
      selectedDivision={divisionDisplayName}
    />
  );
}
