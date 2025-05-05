import { db } from "@db";
import { ethers } from "ethers";
import {
  eq,
  and,
  desc,
  like,
  or,
  inArray
} from "drizzle-orm";
import {
  users,
  models,
  jobs,
  modelLicenses,
  transactions,
  documentation
} from "@shared/schema";
import * as schema from "@shared/schema";
import { nanoid } from "nanoid";
import { formatEther } from "@/lib/utils";

// Storage service for interacting with the database
class StorageService {
  // Dashboard
  async getDashboardData(walletAddress?: string) {
    try {
      // Default stats for unauthenticated users
      const stats = {
        activeJobs: 0,
        completedJobs: 0,
        ownedModels: 0,
        balance: "0.000 MATIC"
      };
      
      // If user is authenticated, get personalized stats
      if (walletAddress) {
        const user = await this.getUserByWalletAddress(walletAddress);
        
        if (user) {
          // Count active jobs
          const activeJobsCount = await db
            .select({ count: db.fn.count() })
            .from(jobs)
            .where(
              and(
                eq(jobs.userId, user.id),
                or(
                  eq(jobs.status, "queued"),
                  eq(jobs.status, "processing")
                )
              )
            );
          
          // Count completed jobs
          const completedJobsCount = await db
            .select({ count: db.fn.count() })
            .from(jobs)
            .where(
              and(
                eq(jobs.userId, user.id),
                eq(jobs.status, "completed")
              )
            );
          
          // Count owned models (models user has a license for)
          const ownedModelsCount = await db
            .select({ count: db.fn.count() })
            .from(modelLicenses)
            .where(eq(modelLicenses.userId, user.id));
          
          stats.activeJobs = Number(activeJobsCount[0]?.count || 0);
          stats.completedJobs = Number(completedJobsCount[0]?.count || 0);
          stats.ownedModels = Number(ownedModelsCount[0]?.count || 0);
          stats.balance = "1.245 MATIC"; // In a real application, we'd get this from the blockchain
        }
      }
      
      return { stats };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      throw new Error("Failed to get dashboard data");
    }
  }
  
  // Jobs
  async getActiveJobs(walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const activeJobs = await db
        .select({
          id: jobs.jobId,
          name: jobs.name,
          status: jobs.status,
          progress: jobs.progress,
          submittedAt: jobs.submittedAt,
          cost: jobs.cost,
          modelId: jobs.modelId,
          modelName: models.name
        })
        .from(jobs)
        .leftJoin(models, eq(jobs.modelId, models.id))
        .where(
          and(
            eq(jobs.userId, user.id),
            or(
              eq(jobs.status, "queued"),
              eq(jobs.status, "processing")
            )
          )
        )
        .orderBy(desc(jobs.submittedAt))
        .limit(5);
      
      return activeJobs.map(job => ({
        ...job,
        cost: `${job.cost} MATIC`
      }));
    } catch (error) {
      console.error("Error getting active jobs:", error);
      throw new Error("Failed to get active jobs");
    }
  }
  
  async getJobs(walletAddress: string, statusFilter?: string, searchTerm?: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      let query = db
        .select({
          id: jobs.jobId,
          name: jobs.name,
          status: jobs.status,
          progress: jobs.progress,
          submittedAt: jobs.submittedAt,
          completedAt: jobs.completedAt,
          cost: jobs.cost,
          modelId: jobs.modelId,
          modelName: models.name,
          resultId: jobs.resultId,
          resultImageUrl: jobs.resultImageUrl
        })
        .from(jobs)
        .leftJoin(models, eq(jobs.modelId, models.id))
        .where(eq(jobs.userId, user.id));
      
      // Apply status filter if provided and not 'all_statuses'
      if (statusFilter && statusFilter !== "all_statuses") {
        query = query.where(eq(jobs.status, statusFilter));
      }
      
      // Apply search filter if provided
      if (searchTerm) {
        query = query.where(
          or(
            like(jobs.name, `%${searchTerm}%`),
            like(jobs.jobId, `%${searchTerm}%`),
            like(models.name, `%${searchTerm}%`)
          )
        );
      }
      
      const allJobs = await query.orderBy(desc(jobs.submittedAt));
      
      return allJobs.map(job => ({
        ...job,
        cost: `${job.cost} MATIC`
      }));
    } catch (error) {
      console.error("Error getting jobs:", error);
      throw new Error("Failed to get jobs");
    }
  }
  
  async getJobById(jobId: string, walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const job = await db
        .select({
          id: jobs.jobId,
          name: jobs.name,
          status: jobs.status,
          progress: jobs.progress,
          parameters: jobs.parameters,
          submittedAt: jobs.submittedAt,
          completedAt: jobs.completedAt,
          cost: jobs.cost,
          maskFileUrl: jobs.maskFileUrl,
          modelId: jobs.modelId,
          modelName: models.name,
          resultId: jobs.resultId,
          resultFileUrl: jobs.resultFileUrl,
          resultImageUrl: jobs.resultImageUrl,
          transactionHash: jobs.transactionHash
        })
        .from(jobs)
        .leftJoin(models, eq(jobs.modelId, models.id))
        .where(
          and(
            eq(jobs.jobId, jobId),
            eq(jobs.userId, user.id)
          )
        )
        .limit(1);
      
      if (job.length === 0) {
        return null;
      }
      
      return {
        ...job[0],
        cost: `${job[0].cost} MATIC`
      };
    } catch (error) {
      console.error("Error getting job by ID:", error);
      throw new Error("Failed to get job details");
    }
  }
  
  async getJobResults(jobId: string, walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const job = await db
        .select({
          id: jobs.jobId,
          name: jobs.name,
          status: jobs.status,
          completedAt: jobs.completedAt,
          resultId: jobs.resultId,
          resultFileUrl: jobs.resultFileUrl,
          resultImageUrl: jobs.resultImageUrl,
          modelName: models.name
        })
        .from(jobs)
        .leftJoin(models, eq(jobs.modelId, models.id))
        .where(
          and(
            eq(jobs.jobId, jobId),
            eq(jobs.userId, user.id),
            eq(jobs.status, "completed")
          )
        )
        .limit(1);
      
      if (job.length === 0 || !job[0].resultId) {
        return null;
      }
      
      return job[0];
    } catch (error) {
      console.error("Error getting job results:", error);
      throw new Error("Failed to get job results");
    }
  }
  
  async getResultFileUrl(jobId: string, walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const job = await db
        .select({
          resultFileUrl: jobs.resultFileUrl,
        })
        .from(jobs)
        .where(
          and(
            eq(jobs.jobId, jobId),
            eq(jobs.userId, user.id),
            eq(jobs.status, "completed")
          )
        )
        .limit(1);
      
      if (job.length === 0 || !job[0].resultFileUrl) {
        return null;
      }
      
      return job[0].resultFileUrl;
    } catch (error) {
      console.error("Error getting result file URL:", error);
      throw new Error("Failed to get result file URL");
    }
  }
  
  async getRecentResults(walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const results = await db
        .select({
          id: jobs.resultId,
          jobId: jobs.jobId,
          modelName: models.name,
          completedAt: jobs.completedAt,
          status: jobs.status,
          imageUrl: jobs.resultImageUrl
        })
        .from(jobs)
        .leftJoin(models, eq(jobs.modelId, models.id))
        .where(
          and(
            eq(jobs.userId, user.id),
            eq(jobs.status, "completed"),
            jobs.resultId.isNotNull()
          )
        )
        .orderBy(desc(jobs.completedAt))
        .limit(4);
      
      return results;
    } catch (error) {
      console.error("Error getting recent results:", error);
      throw new Error("Failed to get recent results");
    }
  }
  
  async submitJob(jobData: schema.JobSubmission, walletAddress: string, maskFile?: Express.Multer.File) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Check if user has a license for the model or if it's a free model
      const modelId = parseInt(jobData.modelId);
      const userHasLicense = await this.userHasModelLicense(user.id, modelId);
      
      if (!userHasLicense) {
        throw new Error("You don't have a license for this model");
      }
      
      // Get the model to calculate cost
      const model = await db
        .select({
          id: models.id,
          name: models.name,
          price: models.price
        })
        .from(models)
        .where(eq(models.id, modelId))
        .limit(1);
      
      if (model.length === 0) {
        throw new Error("Model not found");
      }
      
      // Calculate job cost based on parameters
      // In a real application, we'd have a more complex pricing algorithm
      const basePrice = Number(model[0].price);
      const resolutionFactor = (5 / jobData.resolution) * 0.5;
      const iterationFactor = (jobData.iterations / 1000) * 0.5;
      
      const jobCost = basePrice * (1 + resolutionFactor + iterationFactor);
      
      // Generate custom job ID
      const jobIdNum = await this.getNextJobId();
      const customJobId = `JOB-${jobIdNum}`;
      
      // In a real application, we'd upload the file to IPFS or another storage service
      // and get back a URL. For now, we'll just use a placeholder.
      const maskFileUrl = maskFile 
        ? `https://storage.example.com/masks/${customJobId}.${maskFile.originalname.split('.').pop()}`
        : null;
      
      // Construct job parameters
      const parameters = {
        resolution: jobData.resolution,
        wavelength: jobData.wavelength,
        numericalAperture: jobData.numericalAperture,
        iterations: jobData.iterations
      };
      
      // In a real application, we'd create a blockchain transaction for payment
      // For now, we'll just generate a mock transaction hash
      const txHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Create job record
      const [newJob] = await db.insert(jobs).values({
        jobId: customJobId,
        userId: user.id,
        modelId: modelId,
        name: jobData.name,
        status: "queued",
        parameters: parameters,
        maskFileUrl: maskFileUrl,
        cost: jobCost,
        transactionHash: txHash
      }).returning();
      
      // Create transaction record for job payment
      await db.insert(transactions).values({
        userId: user.id,
        type: "job_payment",
        amount: jobCost,
        amountInWei: ethers.parseEther(jobCost.toString()).toString(),
        txHash: txHash,
        fromAddress: walletAddress,
        toAddress: "0x0000000000000000000000000000000000000001", // Contract address
        jobId: newJob.id,
        metadata: {
          jobId: customJobId
        }
      });
      
      // Return the new job with formatted cost
      return {
        ...newJob,
        jobId: customJobId,
        cost: `${jobCost.toFixed(3)} MATIC`,
        modelName: model[0].name
      };
    } catch (error) {
      console.error("Error submitting job:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to submit job");
    }
  }
  
  // Models
  async getFeaturedModels(walletAddress?: string) {
    try {
      // Get models with high ratings to feature
      const featuredModels = await db
        .select({
          id: models.id,
          name: models.name,
          description: models.description,
          price: models.price,
          rating: models.rating,
          category: models.category,
          features: models.features
        })
        .from(models)
        .where(models.rating.gte(4))
        .orderBy(desc(models.rating))
        .limit(3);
      
      // If user is authenticated, check which models they already own
      let userModelLicenses: Record<number, boolean> = {};
      
      if (walletAddress) {
        const user = await this.getUserByWalletAddress(walletAddress);
        
        if (user) {
          const licenses = await db
            .select({
              modelId: modelLicenses.modelId
            })
            .from(modelLicenses)
            .where(eq(modelLicenses.userId, user.id));
          
          userModelLicenses = licenses.reduce((acc, license) => {
            acc[license.modelId] = true;
            return acc;
          }, {} as Record<number, boolean>);
        }
      }
      
      return featuredModels.map(model => ({
        ...model,
        price: `${model.price} MATIC`,
        licensedToUser: userModelLicenses[model.id] || false
      }));
    } catch (error) {
      console.error("Error getting featured models:", error);
      throw new Error("Failed to get featured models");
    }
  }
  
  async getAvailableModels(walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Get all models
      const allModels = await db
        .select({
          id: models.id,
          name: models.name,
          price: models.price
        })
        .from(models)
        .orderBy(models.name);
      
      // Get models the user already has a license for
      const userLicenses = await db
        .select({
          modelId: modelLicenses.modelId
        })
        .from(modelLicenses)
        .where(eq(modelLicenses.userId, user.id));
      
      const licensedModelIds = userLicenses.map(license => license.modelId);
      
      // Return all models, indicating which ones the user already has
      return allModels.map(model => ({
        ...model,
        id: String(model.id), // Convert to string for form compatibility
        price: `${model.price} MATIC`,
        licensed: licensedModelIds.includes(model.id)
      }));
    } catch (error) {
      console.error("Error getting available models:", error);
      throw new Error("Failed to get available models");
    }
  }
  
  async getModels(
    walletAddress?: string, 
    showOwned?: boolean, 
    priceRange?: number[], 
    categoryFilter?: string, 
    searchTerm?: string
  ) {
    try {
      // Get all models matching filters
      let query = db
        .select({
          id: models.id,
          name: models.name,
          description: models.description,
          price: models.price,
          priceInWei: models.priceInWei,
          rating: models.rating,
          category: models.category,
          features: models.features,
          authorId: models.authorId,
          authorAddress: models.authorAddress,
          imageUrl: models.imageUrl
        })
        .from(models);
      
      // Apply category filter
      if (categoryFilter && categoryFilter !== "all_categories") {
        query = query.where(eq(models.category, categoryFilter));
      }
      
      // Apply price range filter
      if (priceRange && priceRange.length === 2) {
        const [min, max] = priceRange;
        query = query.where(
          and(
            models.price.gte(min / 100),
            models.price.lte(max / 100)
          )
        );
      }
      
      // Apply search term filter
      if (searchTerm) {
        query = query.where(
          or(
            like(models.name, `%${searchTerm}%`),
            like(models.description, `%${searchTerm}%`)
          )
        );
      }
      
      const allModels = await query.orderBy(desc(models.rating));
      
      // If user is authenticated, check which models they already own
      let userModelLicenses: Record<number, boolean> = {};
      let user;
      
      if (walletAddress) {
        user = await this.getUserByWalletAddress(walletAddress);
        
        if (user) {
          const licenses = await db
            .select({
              modelId: modelLicenses.modelId
            })
            .from(modelLicenses)
            .where(eq(modelLicenses.userId, user.id));
          
          userModelLicenses = licenses.reduce((acc, license) => {
            acc[license.modelId] = true;
            return acc;
          }, {} as Record<number, boolean>);
        }
      }
      
      // Get author usernames for all models
      const authorIds = Array.from(new Set(allModels.map(model => model.authorId).filter(Boolean)));
      const authors = await db
        .select({
          id: users.id,
          username: users.username
        })
        .from(users)
        .where(inArray(users.id, authorIds as number[]));
      
      const authorMap = authors.reduce((acc, author) => {
        acc[author.id] = author.username;
        return acc;
      }, {} as Record<number, string>);
      
      // Transform models and filter by ownership if needed
      let transformedModels = allModels.map(model => ({
        ...model,
        price: `${model.price} MATIC`,
        author: authorMap[model.authorId as number] || "Unknown",
        licensedToUser: userModelLicenses[model.id] || false
      }));
      
      // Filter by ownership if requested
      if (showOwned && user) {
        transformedModels = transformedModels.filter(model => model.licensedToUser);
      }
      
      return transformedModels;
    } catch (error) {
      console.error("Error getting models:", error);
      throw new Error("Failed to get models");
    }
  }
  
  async getModelCategories() {
    try {
      const categories = await db
        .select({
          category: models.category
        })
        .from(models)
        .groupBy(models.category)
        .orderBy(models.category);
      
      return categories.map(c => c.category);
    } catch (error) {
      console.error("Error getting model categories:", error);
      throw new Error("Failed to get model categories");
    }
  }
  
  async purchaseModel(modelId: string, walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const modelIdNum = parseInt(modelId);
      
      // Check if user already has a license for this model
      const existingLicense = await db
        .select()
        .from(modelLicenses)
        .where(
          and(
            eq(modelLicenses.userId, user.id),
            eq(modelLicenses.modelId, modelIdNum)
          )
        )
        .limit(1);
      
      if (existingLicense.length > 0) {
        throw new Error("You already own a license for this model");
      }
      
      // Get the model details
      const model = await db
        .select({
          id: models.id,
          name: models.name,
          price: models.price,
          priceInWei: models.priceInWei,
          authorId: models.authorId,
          authorAddress: models.authorAddress
        })
        .from(models)
        .where(eq(models.id, modelIdNum))
        .limit(1);
      
      if (model.length === 0) {
        throw new Error("Model not found");
      }
      
      const modelData = model[0];
      
      // In a real application, we'd create a blockchain transaction for payment
      // For now, we'll just generate a mock transaction hash
      const txHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Create license record
      const [newLicense] = await db.insert(modelLicenses).values({
        userId: user.id,
        modelId: modelIdNum,
        walletAddress: walletAddress,
        transactionHash: txHash
      }).returning();
      
      // Create transaction record for model purchase
      await db.insert(transactions).values({
        userId: user.id,
        type: "model_purchase",
        amount: Number(modelData.price),
        amountInWei: modelData.priceInWei,
        txHash: txHash,
        fromAddress: walletAddress,
        toAddress: modelData.authorAddress as string,
        modelId: modelIdNum,
        metadata: {
          modelName: modelData.name
        }
      });
      
      return {
        success: true,
        licenseId: newLicense.id,
        modelId: modelIdNum,
        modelName: modelData.name,
        price: `${modelData.price} MATIC`,
        transactionHash: txHash
      };
    } catch (error) {
      console.error("Error purchasing model:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to purchase model");
    }
  }
  
  // Transactions
  async getRecentTransactions(walletAddress: string) {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const recentTransactions = await db
        .select({
          id: transactions.id,
          type: transactions.type,
          amount: transactions.amount,
          txHash: transactions.txHash,
          createdAt: transactions.createdAt,
          metadata: transactions.metadata,
          jobId: jobs.jobId,
          modelName: models.name
        })
        .from(transactions)
        .leftJoin(jobs, eq(transactions.jobId, jobs.id))
        .leftJoin(models, eq(transactions.modelId, models.id))
        .where(eq(transactions.userId, user.id))
        .orderBy(desc(transactions.createdAt))
        .limit(10);
      
      return recentTransactions.map(tx => ({
        id: tx.id.toString(),
        type: tx.type,
        amount: `${tx.amount} MATIC`,
        timestamp: tx.createdAt.toISOString(),
        txHash: tx.txHash,
        metadata: {
          ...(tx.metadata as object || {}),
          jobId: tx.jobId,
          modelName: tx.modelName
        }
      }));
    } catch (error) {
      console.error("Error getting recent transactions:", error);
      throw new Error("Failed to get recent transactions");
    }
  }
  
  // Documentation
  async getDocumentation() {
    try {
      const docs = await db
        .select()
        .from(documentation)
        .orderBy(documentation.category, documentation.sortOrder);
      
      // Group by category
      const categories: Record<string, schema.Documentation[]> = {};
      
      docs.forEach(doc => {
        if (!categories[doc.category]) {
          categories[doc.category] = [];
        }
        categories[doc.category].push(doc);
      });
      
      // Transform into the expected format
      const result = Object.entries(categories).map(([categoryId, items]) => {
        return {
          id: categoryId,
          title: this.formatCategoryTitle(categoryId),
          items
        };
      });
      
      return { categories: result };
    } catch (error) {
      console.error("Error getting documentation:", error);
      throw new Error("Failed to get documentation");
    }
  }
  
  // Authentication
  async verifyWalletSignature(address: string, signature: string, message: string): Promise<boolean> {
    try {
      // In a real application, we'd use ethers.js to verify the signature
      // For simplicity, we'll just return true for now
      return true;
    } catch (error) {
      console.error("Error verifying wallet signature:", error);
      return false;
    }
  }
  
  async createOrUpdateUser(walletAddress: string) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);
      
      if (existingUser.length > 0) {
        // User exists, nothing to do
        return existingUser[0];
      }
      
      // Create new user with wallet address
      const username = `user_${nanoid(8)}`;
      const [newUser] = await db.insert(users).values({
        username,
        password: "wallet_auth", // Not used for wallet auth
        walletAddress
      }).returning();
      
      return newUser;
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw new Error("Failed to create/update user");
    }
  }
  
  // Helper functions
  async getUserByWalletAddress(walletAddress: string) {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);
      
      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error("Error getting user by wallet address:", error);
      return null;
    }
  }
  
  async userHasModelLicense(userId: number, modelId: number): Promise<boolean> {
    try {
      // Check for explicit license
      const license = await db
        .select()
        .from(modelLicenses)
        .where(
          and(
            eq(modelLicenses.userId, userId),
            eq(modelLicenses.modelId, modelId)
          )
        )
        .limit(1);
      
      // If user has a license, return true
      if (license.length > 0) {
        return true;
      }
      
      // If no explicit license, check if model is free
      const model = await db
        .select({
          price: models.price
        })
        .from(models)
        .where(eq(models.id, modelId))
        .limit(1);
      
      // If model not found or price > 0, return false
      if (model.length === 0 || Number(model[0].price) > 0) {
        return false;
      }
      
      // If model is free (price = 0), return true
      return Number(model[0].price) === 0;
    } catch (error) {
      console.error("Error checking model license:", error);
      return false;
    }
  }
  
  async getNextJobId(): Promise<number> {
    try {
      // Get the highest job ID number
      const lastJob = await db
        .select({
          jobId: jobs.jobId
        })
        .from(jobs)
        .orderBy(desc(jobs.id))
        .limit(1);
      
      if (lastJob.length === 0) {
        return 1000; // Start from 1000
      }
      
      // Extract the number from the job ID (format: JOB-XXXX)
      const lastJobIdMatch = lastJob[0].jobId.match(/JOB-(\d+)/);
      const lastJobIdNum = lastJobIdMatch 
        ? parseInt(lastJobIdMatch[1], 10) 
        : 999;
      
      return lastJobIdNum + 1;
    } catch (error) {
      console.error("Error getting next job ID:", error);
      return Math.floor(1000 + Math.random() * 9000); // Fallback to random ID
    }
  }
  
  formatCategoryTitle(categoryId: string): string {
    switch (categoryId) {
      case "getting-started":
        return "Getting Started";
      case "api-reference":
        return "API Reference";
      case "model-guidelines":
        return "Model Guidelines";
      case "tutorials":
        return "Tutorials";
      default:
        return categoryId
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  }
}

export const storage = new StorageService();
