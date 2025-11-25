
import DivisionDashboardClient from './division-dashboard-client';

interface DivisionDashboardPageProps {
  params: {
    division: string;
  };
}

// This is now a Server Component. It fetches data or params on the server
// and passes them down to a Client Component.
export default function DivisionDashboardPage({ params }: DivisionDashboardPageProps) {
  const decodedDivision = decodeURIComponent(params.division);

  return (
    <DivisionDashboardClient divisionSlug={decodedDivision} />
  );
}
