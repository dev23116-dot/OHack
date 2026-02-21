import { useFleetStore } from '@/stores/fleetStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { AlertTriangle } from 'lucide-react';

export default function DriversPage() {
  const { drivers } = useFleetStore();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Driver Management" description="Monitor drivers, licenses, and safety scores" />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License Category</th>
                <th>License Expiry</th>
                <th>Status</th>
                <th>Trip Completion</th>
                <th>Safety Score</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const expired = d.licenseExpiry < today;
                return (
                  <tr key={d.id}>
                    <td className="font-medium">{d.name}</td>
                    <td className="font-mono text-xs">{d.licenseCategory}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{d.licenseExpiry}</span>
                        {expired && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${d.tripCompletionRate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.tripCompletionRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-sm font-semibold ${d.safetyScore >= 90 ? 'text-status-available' : d.safetyScore >= 80 ? 'text-status-draft' : 'text-destructive'}`}>
                        {d.safetyScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
