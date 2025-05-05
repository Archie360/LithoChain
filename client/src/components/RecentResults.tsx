import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatTimestamp, jobStatusColor } from "@/lib/utils";

interface SimulationResult {
  id: string;
  jobId: string;
  modelName: string;
  completedAt: string;
  status: string;
  imageUrl: string;
}

const RecentResults = () => {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['/api/jobs/results/recent'],
  });

  if (isLoading) {
    return (
      <Card className="shadow-fluent">
        <CardHeader className="px-6 py-5 border-b border-neutral-lighter">
          <h2 className="text-lg font-medium text-neutral-dark">Recent Results</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-48">
            <p>Loading recent results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-fluent">
      <CardHeader className="px-6 py-5 border-b border-neutral-lighter">
        <h2 className="text-lg font-medium text-neutral-dark">Recent Results</h2>
      </CardHeader>
      <CardContent className="px-6 py-6">
        {results.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral">No recent results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result: SimulationResult) => {
              const { bgColor, textColor } = jobStatusColor(result.status);
              
              return (
                <div key={result.id} className="bg-neutral-lightest rounded-lg overflow-hidden border border-neutral-lighter">
                  <div className="h-48 flex items-center justify-center bg-white">
                    {result.imageUrl ? (
                      <img 
                        src={result.imageUrl} 
                        alt={`Simulation result for ${result.modelName}`} 
                        className="max-h-full"
                      />
                    ) : (
                      <div className="text-neutral text-center p-4">
                        <p>No visualization available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-neutral-dark">{result.modelName}</h3>
                    <p className="text-neutral text-sm mt-1">
                      Completed {formatTimestamp(result.completedAt)}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`text-xs ${bgColor} ${textColor} px-2 py-1 rounded-full`}>
                        {result.status}
                      </span>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary-dark"
                          asChild
                        >
                          <Link href={`/jobs/${result.jobId}/results`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary-dark ml-3"
                          asChild
                        >
                          <Link href={`/api/jobs/${result.jobId}/results/download`}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-neutral-lightest px-6 py-4 border-t border-neutral-lighter">
        <Link href="/jobs/results" className="text-sm text-primary hover:text-primary-dark font-medium">
          View all results →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentResults;
