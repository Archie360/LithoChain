import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
}

const MarketplaceHighlights = () => {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['/api/models/featured'],
  });

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-neutral-lighter" />
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-neutral-lighter" />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-fluent mb-8">
        <CardHeader className="px-6 py-5 border-b border-neutral-lighter flex justify-between items-center">
          <h2 className="text-lg font-medium text-neutral-dark">Featured Models</h2>
          <Link href="/marketplace" className="text-sm text-primary hover:text-primary-dark font-medium">
            View Marketplace
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <p>Loading featured models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-fluent mb-8">
      <CardHeader className="px-6 py-5 border-b border-neutral-lighter flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-dark">Featured Models</h2>
        <Link href="/marketplace" className="text-sm text-primary hover:text-primary-dark font-medium">
          View Marketplace
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {models.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral">No featured models available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {models.map((model: Model) => (
              <div key={model.id} className="flex">
                <div className="flex-shrink-0 h-16 w-16 bg-neutral-lightest rounded flex items-center justify-center">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-neutral-dark">{model.name}</h3>
                  <p className="text-xs text-neutral mt-1">{model.description}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium text-neutral-dark">{model.price}</span>
                    <span className="mx-2 text-neutral">•</span>
                    {renderRatingStars(model.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceHighlights;
