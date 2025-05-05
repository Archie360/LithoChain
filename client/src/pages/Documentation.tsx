import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Book, Code, Search, FileCog, Users, Hash } from "lucide-react";

interface DocCategory {
  id: string;
  title: string;
  items: DocItem[];
}

interface DocItem {
  id: string;
  title: string;
  content: string;
  category: string;
}

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("getting-started");
  
  const { data: docsData, isLoading } = useQuery({
    queryKey: ['/api/documentation'],
  });
  
  const docCategories = docsData?.categories || [];
  const allDocs = docCategories.flatMap((category: DocCategory) => category.items);
  
  // Filter docs based on search term
  const filteredDocs = allDocs.filter((doc: DocItem) => {
    if (!searchTerm) return false;
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "getting-started":
        return <Book className="h-5 w-5" />;
      case "api-reference":
        return <Code className="h-5 w-5" />;
      case "model-guidelines":
        return <FileCog className="h-5 w-5" />;
      case "tutorials":
        return <Users className="h-5 w-5" />;
      default:
        return <Hash className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-dark">Documentation</h1>
        <p className="text-neutral mt-1">
          Learn how to use the LithoChain platform and contribute lithography models
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <Card className="sticky top-6">
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral" />
                <Input
                  placeholder="Search documentation..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {searchTerm ? (
                <div className="py-4">
                  <p className="px-4 py-2 text-sm font-medium text-neutral">
                    Search Results ({filteredDocs.length})
                  </p>
                  <ScrollArea className="h-[60vh]">
                    <div className="px-4 py-2">
                      {filteredDocs.length === 0 ? (
                        <p className="text-sm text-neutral">No results found</p>
                      ) : (
                        filteredDocs.map((doc: DocItem) => (
                          <div 
                            key={doc.id} 
                            className="py-2 px-3 mb-1 text-sm hover:bg-neutral-lightest rounded-md cursor-pointer"
                            onClick={() => {
                              setActiveTab(doc.category);
                              setSearchTerm("");
                              // Add logic to scroll to this specific doc item
                            }}
                          >
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-neutral mt-1">
                              {doc.content.substring(0, 60)}...
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <ScrollArea className="h-[60vh]">
                  <div className="py-4">
                    {docCategories.map((category: DocCategory) => (
                      <div key={category.id} className="mb-4">
                        <div 
                          className={`px-4 py-2 flex items-center text-sm font-medium cursor-pointer ${
                            activeTab === category.id ? "text-primary bg-primary-light bg-opacity-10" : "text-neutral-dark hover:bg-neutral-lightest"
                          }`}
                          onClick={() => setActiveTab(category.id)}
                        >
                          <span className="mr-2">{getCategoryIcon(category.id)}</span>
                          {category.title}
                        </div>
                        
                        {activeTab === category.id && (
                          <div className="mt-1">
                            {category.items.map((item: DocItem) => (
                              <div 
                                key={item.id}
                                className="pl-10 pr-4 py-2 text-sm hover:bg-neutral-lightest cursor-pointer"
                                onClick={() => {
                                  // Add logic to scroll to this specific doc item
                                }}
                              >
                                {item.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {docCategories.map((category: DocCategory) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Loading documentation...</p>
                </CardContent>
              </Card>
            ) : (
              docCategories.map((category: DocCategory) => (
                <TabsContent key={category.id} value={category.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getCategoryIcon(category.id)}
                        <span className="ml-2">{category.title}</span>
                      </CardTitle>
                      <CardDescription>
                        {category.id === "getting-started" && "Getting started with the LithoChain platform"}
                        {category.id === "api-reference" && "API reference for developers"}
                        {category.id === "model-guidelines" && "Guidelines for model contributors"}
                        {category.id === "tutorials" && "Step-by-step tutorials for common workflows"}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.items.map((item: DocItem) => (
                          <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger>{item.title}</AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
