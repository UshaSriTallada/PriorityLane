import { Factory } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
            <Factory className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold">PriorityLane</h1>
            <p className="text-muted-foreground">Manage your factory floor with ease.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
