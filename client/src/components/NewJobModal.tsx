import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Job name must be at least 3 characters"),
  modelId: z.string().min(1, "Please select a model"),
  resolution: z.coerce.number().positive("Resolution must be positive"),
  wavelength: z.coerce.number().positive("Wavelength must be positive"),
  numericalAperture: z.coerce.number().min(0, "Numerical aperture must be at least 0").max(1, "Numerical aperture must be at most 1"),
  iterations: z.coerce.number().int().positive("Iterations must be a positive integer"),
});

type FormValues = z.infer<typeof formSchema>;

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewJobModal = ({ isOpen, onClose }: NewJobModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedCost, setEstimatedCost] = useState("0.08 MATIC");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: availableModels = [] } = useQuery({
    queryKey: ['/api/models/available'],
    enabled: isOpen,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      modelId: "",
      resolution: 5,
      wavelength: 193,
      numericalAperture: 0.93,
      iterations: 1000,
    },
  });

  const { mutate: submitJob, isPending } = useMutation({
    mutationFn: async (data: FormValues & { file?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'file') {
          formData.append(key, String(value));
        }
      });
      
      if (data.file) {
        formData.append('maskFile', data.file);
      }
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job submitted successfully",
        description: "Your simulation job has been queued for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      onClose();
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit job",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormValues) => {
    submitJob({
      ...data,
      file: selectedFile || undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB
        toast({
          title: "File too large",
          description: "Maximum file size is 500MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // Update estimated cost whenever form values change
  const updateEstimatedCost = () => {
    const modelId = form.watch("modelId");
    const resolution = form.watch("resolution");
    const iterations = form.watch("iterations");
    
    if (!modelId || !resolution || !iterations) return;
    
    // Simple cost calculation based on parameters
    const model = availableModels.find((m: any) => m.id === modelId);
    const basePrice = model?.price ? parseFloat(model.price) : 0.05;
    const resolutionFactor = (5 / resolution) * 0.5;
    const iterationFactor = (iterations / 1000) * 0.5;
    
    const calculatedCost = basePrice * (1 + resolutionFactor + iterationFactor);
    setEstimatedCost(`${calculatedCost.toFixed(3)} MATIC`);
  };

  // Call updateEstimatedCost whenever relevant form fields change
  form.watch((data) => {
    if (data.modelId || data.resolution || data.iterations) {
      updateEstimatedCost();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Simulation Job</DialogTitle>
          <DialogDescription>
            Configure your lithography simulation job parameters
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Simulation Job" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="modelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lithography model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableModels.map((model: any) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Simulation Parameters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution (nm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wavelength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wavelength (nm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numericalAperture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numerical Aperture</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="iterations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iterations</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div>
              <FormLabel htmlFor="maskFile">Upload Mask Data</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-lighter border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-light" />
                  <div className="flex text-sm text-neutral">
                    <label
                      htmlFor="maskFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark"
                    >
                      <span>Upload a file</span>
                      <input
                        id="maskFile"
                        name="maskFile"
                        type="file"
                        className="sr-only"
                        accept=".gds,.oasis,.mebes"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral">
                    {selectedFile ? selectedFile.name : "GDSII, OASIS, or MEBES up to 500MB"}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-dark">Estimated Cost</span>
                <span className="text-sm font-medium text-neutral-dark">{estimatedCost}</span>
              </div>
              <div className="mt-1">
                <div className="text-xs text-neutral">
                  Price is determined by model complexity and compute requirements
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Submit Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobModal;
