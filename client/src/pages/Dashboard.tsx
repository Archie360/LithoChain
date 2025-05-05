import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import StatsSummary from "@/components/StatsSummary";
import ActiveJobs from "@/components/ActiveJobs";
import RecentResults from "@/components/RecentResults";
import MarketplaceHighlights from "@/components/MarketplaceHighlights";
import TransactionHistory from "@/components/TransactionHistory";
import NewJobModal from "@/components/NewJobModal";

const Dashboard = () => {
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  // Default stats in case data is loading or missing
  const stats = {
    activeJobs: dashboardData?.stats?.activeJobs || 0,
    completedJobs: dashboardData?.stats?.completedJobs || 0,
    ownedModels: dashboardData?.stats?.ownedModels || 0,
    balance: dashboardData?.stats?.balance || "0.000 MATIC"
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-dark">Dashboard</h1>
        <p className="text-neutral mt-1">Manage your lithography simulation jobs and models</p>
      </div>
      
      <StatsSummary stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActiveJobs />
          <RecentResults />
        </div>
        
        <div>
          <MarketplaceHighlights />
          <TransactionHistory />
        </div>
      </div>
      
      <NewJobModal 
        isOpen={isNewJobModalOpen} 
        onClose={() => setIsNewJobModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
