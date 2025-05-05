import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatTimestamp, getProgressFromStatus, jobStatusColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import NewJobModal from "./NewJobModal";

interface Job {
  id: string;
  name: string;
  status: string;
  progress?: number;
  submittedAt: string;
  cost: string;
  modelId: string;
  modelName: string;
}

const ActiveJobs = () => {
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs/active'],
  });
  
  const renderStatus = (job: Job) => {
    const { bgColor, textColor } = jobStatusColor(job.status);
    let statusText = job.status;
    let progress = job.progress || getProgressFromStatus(job.status);
    
    if (statusText.toLowerCase().includes("processing") && progress > 0) {
      statusText = `Processing (${progress}%)`;
    }
    
    return (
      <div className="space-y-1">
        <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${bgColor} ${textColor}`}>
          {statusText}
        </span>
        {progress > 0 && progress < 100 && (
          <Progress value={progress} className="h-1 w-24" />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-fluent mb-8">
        <CardHeader className="px-6 py-5 border-b border-neutral-lighter flex justify-between items-center">
          <h2 className="text-lg font-medium text-neutral-dark">Active Jobs</h2>
          <Button variant="ghost" className="text-primary" onClick={() => setIsNewJobModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">New Job</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-8 flex justify-center">
            <p>Loading active jobs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-fluent mb-8">
        <CardHeader className="px-6 py-5 border-b border-neutral-lighter flex justify-between items-center">
          <h2 className="text-lg font-medium text-neutral-dark">Active Jobs</h2>
          <Button variant="ghost" className="text-primary" onClick={() => setIsNewJobModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">New Job</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-lighter">
              <thead className="bg-neutral-lightest">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">Job ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">Model</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">Submitted</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider">Cost</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-lighter">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral">
                      No active jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job: Job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-dark">{job.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{job.modelName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(job)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral">{formatTimestamp(job.submittedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{job.cost}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/jobs/${job.id}`} className="text-primary hover:text-primary-dark">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-lightest px-6 py-4 border-t border-neutral-lighter">
          <Link href="/jobs" className="text-sm text-primary hover:text-primary-dark font-medium">
            View all jobs →
          </Link>
        </CardFooter>
      </Card>
      
      <NewJobModal 
        isOpen={isNewJobModalOpen} 
        onClose={() => setIsNewJobModalOpen(false)} 
      />
    </>
  );
};

export default ActiveJobs;
