import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, Search, Star, Eye, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWeb3 } from "@/hooks/use-web3";

interface Model {
  id: string;
  name: string;
  description: string;
  price: string;
  priceInWei: string;
  rating: number;
  category: string;
  features: string[];
  author: string;
  authorAddress: string;
  licensedToUser: boolean;
  imageUrl?: string;
}

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showOwned, setShowOwned] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useWeb3();
  
  const { data: modelsData = { models: [], categories: [] }, isLoading } = useQuery({
    queryKey: ['/api/models', { showOwned, priceRange, categoryFilter, searchTerm }],
  });
  
  const models = modelsData.models || [];
  const categories = modelsData.categories || [];
  
  const { mutate: purchaseModel, isPending: isPurchasing } = useMutation({
    mutationFn: async (modelId: string) => {
      return apiRequest('POST', `/api/models/${modelId}/purchase`, {});
    },
    onSuccess: () => {
      toast({
        title: "Model purchased successfully",
        description: "You can now use this model in your simulation jobs.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to purchase model",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
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
  
  const handlePurchase = (model: Model) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase models",
        variant: "destructive",
      });
      return;
    }
    
    purchaseModel(model.id);
  };
  
  const filteredModels = models.filter((model: Model) => {
    // Filter by tab
    if (currentTab === "featured" && model.rating < 4) return false;
    if (currentTab === "owned" && !model.licensedToUser) return false;
    
    // Filter by search term
    if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !model.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter !== "all_categories" && model.category !== categoryFilter) {
      return false;
    }
    
    // Filter by price range
    const modelPrice = parseFloat(model.price.split(" ")[0]);
    if (modelPrice < priceRange[0] / 100 || modelPrice > priceRange[1] / 100) {
      return false;
    }
    
    // Filter by ownership
    if (showOwned && !model.licensedToUser) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-dark">Lithography Model Marketplace</h1>
        <p className="text-neutral mt-1">
          Browse and purchase lithography simulation models from experts worldwide
        </p>
      </div>
      
      <div className="bg-white shadow-fluent-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral" />
              <Input
                placeholder="Search models..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="owned-filter"
                checked={showOwned}
                onCheckedChange={setShowOwned}
              />
              <Label htmlFor="owned-filter">Show Owned Only</Label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Price Range (MATIC):</label>
            <span className="text-sm">
              {(priceRange[0] / 100).toFixed(2)} - {(priceRange[1] / 100).toFixed(2)} MATIC
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-2"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="owned">Owned</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Loading models...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="bg-white shadow-fluent-sm rounded-lg p-8 text-center">
          <Eye className="h-12 w-12 text-neutral mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-dark mb-2">No models found</h3>
          <p className="text-neutral">
            Try adjusting your search criteria or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model: Model) => (
            <Card key={model.id} className="overflow-hidden">
              <div className="h-48 bg-neutral-lightest flex items-center justify-center">
                {model.imageUrl ? (
                  <img
                    src={model.imageUrl}
                    alt={model.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Eye className="h-16 w-16 text-accent-light" />
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{model.name}</CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  {model.licensedToUser && (
                    <Badge variant="outline" className="bg-green-100 text-secondary border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Owned
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-neutral" />
                    <span className="text-sm text-neutral">{model.category}</span>
                  </div>
                  <div className="flex items-center">
                    {renderRatingStars(model.rating)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {model.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-neutral-lightest text-neutral">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center border-t border-neutral-lighter pt-4">
                <div>
                  <p className="text-primary font-bold">{model.price}</p>
                  <p className="text-xs text-neutral">By {model.author}</p>
                </div>
                
                {model.licensedToUser ? (
                  <Button variant="outline" className="text-secondary border-secondary">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Licensed
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(model)}
                    disabled={isPurchasing}
                  >
                    Purchase
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
