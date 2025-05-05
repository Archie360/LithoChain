import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Eye, Wallet } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: string | number;
}

const StatItem = ({ icon, iconBgClass, label, value }: StatItemProps) => (
  <Card>
    <CardContent className="px-4 py-5 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${iconBgClass} rounded-md p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-neutral truncate">{label}</dt>
            <dd>
              <div className="text-lg font-semibold text-neutral-dark">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface StatsSummaryProps {
  stats: {
    activeJobs: number;
    completedJobs: number;
    ownedModels: number;
    balance: string;
  };
}

const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatItem
        icon={<Clock className="h-5 w-5 text-primary" />}
        iconBgClass="bg-primary-light-10"
        label="Active Jobs"
        value={stats.activeJobs}
      />
      
      <StatItem
        icon={<CheckCircle className="h-5 w-5 text-secondary" />}
        iconBgClass="bg-secondary-light-10"
        label="Completed Jobs"
        value={stats.completedJobs}
      />
      
      <StatItem
        icon={<Eye className="h-5 w-5 text-accent" />}
        iconBgClass="bg-accent-light-10"
        label="Owned Models"
        value={stats.ownedModels}
      />
      
      <StatItem
        icon={<Wallet className="h-5 w-5 text-status-info" />}
        iconBgClass="bg-status-info-10"
        label="Balance"
        value={stats.balance}
      />
    </div>
  );
};

export default StatsSummary;
