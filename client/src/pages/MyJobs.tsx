import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Eye, Download, Clock, CheckCircle, XCircle, Search, Plus } from "lucide-react";
import { formatTimestamp, jobStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import NewJobModal from "@/components/NewJobModal";

interface Job {
  id: string;
  name: string;
  status: string;
  progress?: number;
  submittedAt: string;
  completedAt?: string;
  cost: string;
  modelId: string;
  modelName: string;
  resultId?: string;
  resultImageUrl?: string;
}

const MyJobs = () => {
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['/api/jobs', { statusFilter, searchTerm }],
  });
  
  const jobs = jobsData?.jobs || [];
  
  // Status icon mapping
  const statusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("processing") || lowerStatus.includes("queued")) {
      return <Clock className="h-4 w-4" />;
    } else if (lowerStatus.includes("completed") || lowerStatus.includes("success")) {
      return <CheckCircle className="h-4 w-4" />;
    } else if (lowerStatus.includes("failed") || lowerStatus.includes("error")) {
      return <XCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };
  
  const renderStatus = (job: Job) => {
    const { bgColor, textColor } = jobStatusColor(job.status);
    let progress = job.progress || 0;
    let statusText = job.status;
    
    // Extract progress from status text if available (e.g., "Processing (75%)")
    if (statusText.includes("%")) {
      const match = statusText.match(/\((\d+)%\)/);
      if (match) {
        progress = parseInt(match[1], 10);
      }
    }
    
    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <span className={`mr-1 ${textColor}`}>
            {statusIcon(statusText)}
          </span>
          <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${bgColor} ${textColor}`}>
            {statusText}
          </span>
        </div>
        {progress > 0 && progress < 100 && (
          <Progress value={progress} className="h-1 w-24" />
        )}
      </div>
    );
  };
  
  // Filter jobs based on tab and filters
  const filteredJobs = jobs.filter((job: Job) => {
    // Filter by tab
    if (activeTab === "active" && job.status.toLowerCase().includes("completed")) {
      return false;
    }
    if (activeTab === "completed" && !job.status.toLowerCase().includes("completed")) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all_statuses" && job.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && 
        !job.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.modelName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Extract unique statuses for filter dropdown
  const statuses = Array.from(new Set(jobs.map((job: Job) => job.status)));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-dark">My Simulation Jobs</h1>
          <p className="text-neutral mt-1">
            View and manage your lithography simulation jobs
          </p>
        </div>
        
        <Button onClick={() => setIsNewJobModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>
      
      <div className="bg-white shadow-fluent-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral" />
              <Input
                placeholder="Search jobs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="active" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Clock className="h-12 w-12 text-neutral mx-auto mb-4" />
            <CardTitle className="mb-2">No jobs found</CardTitle>
            <CardDescription>
              {activeTab === "active" 
                ? "You don't have any active jobs. Start a new simulation job to get started." 
                : "You don't have any completed jobs yet."}
            </CardDescription>
            {activeTab === "active" && (
              <Button className="mt-4" onClick={() => setIsNewJobModalOpen(true)}>
                Create New Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job: Job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="font-mono">{job.id}</CardTitle>
                    <CardDescription className="mt-1">{job.name}</CardDescription>
                  </div>
                  {renderStatus(job)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-neutral">Model</p>
                          <p className="text-sm font-medium">{job.modelName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral">Cost</p>
                          <p className="text-sm font-medium">{job.cost}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-neutral">Submitted</p>
                          <p className="text-sm">{formatTimestamp(job.submittedAt)}</p>
                        </div>
                        {job.completedAt && (
                          <div>
                            <p className="text-xs text-neutral">Completed</p>
                            <p className="text-sm">{formatTimestamp(job.completedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Link>
                      </Button>
                      
                      {job.resultId && (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${job.id}/results`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Results
                            </Link>
                          </Button>
                          
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/api/jobs/${job.id}/results/download`}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {job.resultImageUrl && (
                    <div className="mt-4 md:mt-0 md:ml-4 md:w-1/3 lg:w-1/4">
                      <div className="border border-neutral-lighter rounded-md overflow-hidden h-32">
                        <img 
                          src={job.resultImageUrl} 
                          alt={`Preview for job ${job.id}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <NewJobModal 
        isOpen={isNewJobModalOpen} 
        onClose={() => setIsNewJobModalOpen(false)} 
      />
    </div>
  );
};

export default MyJobs;
