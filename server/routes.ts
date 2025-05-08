import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { jobSubmissionSchema } from "@shared/schema";
import { formatEther, parseEther } from "ethers";
import passport from "passport";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";
  
  // Middleware to check if user is authenticated via wallet
  const requireWalletAuth = (req: any, res: any, next: any) => {
    if (!req.session || !req.session.walletAddress) {
      return res.status(401).json({ message: "Wallet authentication required" });
    }
    next();
  };

  // Dashboard data route
  app.get(`${apiPrefix}/dashboard`, async (req, res) => {
    try {
      // Retrieve wallet address from session if available
      const walletAddress = req.session?.walletAddress;
      
      // Fetch dashboard data with or without user context
      const dashboardData = await storage.getDashboardData(walletAddress);
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Active jobs route
  app.get(`${apiPrefix}/jobs/active`, requireWalletAuth, async (req, res) => {
    try {
      const walletAddress = req.session.walletAddress;
      const activeJobs = await storage.getActiveJobs(walletAddress);
      
      res.json(activeJobs);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      res.status(500).json({ message: "Failed to fetch active jobs" });
    }
  });

  // All jobs route with filtering
  app.get(`${apiPrefix}/jobs`, requireWalletAuth, async (req, res) => {
    try {
      const walletAddress = req.session.walletAddress;
      const statusFilter = req.query.statusFilter as string;
      const searchTerm = req.query.searchTerm as string;
      
      const jobs = await storage.getJobs(walletAddress, statusFilter, searchTerm);
      
      res.json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Job details route
  app.get(`${apiPrefix}/jobs/:jobId`, requireWalletAuth, async (req, res) => {
    try {
      const { jobId } = req.params;
      const walletAddress = req.session.walletAddress;
      
      const job = await storage.getJobById(jobId, walletAddress);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job details:", error);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  // Job results route
  app.get(`${apiPrefix}/jobs/:jobId/results`, requireWalletAuth, async (req, res) => {
    try {
      const { jobId } = req.params;
      const walletAddress = req.session.walletAddress;
      
      const results = await storage.getJobResults(jobId, walletAddress);
      
      if (!results) {
        return res.status(404).json({ message: "Job results not found" });
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching job results:", error);
      res.status(500).json({ message: "Failed to fetch job results" });
    }
  });

  // Download job results route
  app.get(`${apiPrefix}/jobs/:jobId/results/download`, requireWalletAuth, async (req, res) => {
    try {
      const { jobId } = req.params;
      const walletAddress = req.session.walletAddress;
      
      const resultFileUrl = await storage.getResultFileUrl(jobId, walletAddress);
      
      if (!resultFileUrl) {
        return res.status(404).json({ message: "Result file not found" });
      }
      
      // Redirect to the file URL for download
      res.redirect(resultFileUrl);
    } catch (error) {
      console.error("Error downloading job results:", error);
      res.status(500).json({ message: "Failed to download job results" });
    }
  });

  // Recent results route
  app.get(`${apiPrefix}/jobs/results/recent`, requireWalletAuth, async (req, res) => {
    try {
      const walletAddress = req.session.walletAddress;
      const recentResults = await storage.getRecentResults(walletAddress);
      
      res.json(recentResults);
    } catch (error) {
      console.error("Error fetching recent results:", error);
      res.status(500).json({ message: "Failed to fetch recent results" });
    }
  });

  // Submit job route
  app.post(
    `${apiPrefix}/jobs`,
    requireWalletAuth,
    upload.single("maskFile"),
    async (req, res) => {
      try {
        const walletAddress = req.session.walletAddress;
        
        // Validate job data
        const validationResult = jobSubmissionSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: "Invalid job data", 
            errors: validationResult.error.errors 
          });
        }
        
        // Process uploaded mask file if present
        const maskFile = req.file;
        
        // Submit job to storage service
        const newJob = await storage.submitJob(
          validationResult.data,
          walletAddress,
          maskFile
        );
        
        res.status(201).json(newJob);
      } catch (error) {
        console.error("Error submitting job:", error);
        res.status(500).json({ message: "Failed to submit job" });
      }
    }
  );

  // Models routes
  // Get featured models
  app.get(`${apiPrefix}/models/featured`, async (req, res) => {
    try {
      const walletAddress = req.session?.walletAddress;
      const featuredModels = await storage.getFeaturedModels(walletAddress);
      
      res.json(featuredModels);
    } catch (error) {
      console.error("Error fetching featured models:", error);
      res.status(500).json({ message: "Failed to fetch featured models" });
    }
  });

  // Get available models for job submission
  app.get(`${apiPrefix}/models/available`, requireWalletAuth, async (req, res) => {
    try {
      const walletAddress = req.session.walletAddress;
      const availableModels = await storage.getAvailableModels(walletAddress);
      
      res.json(availableModels);
    } catch (error) {
      console.error("Error fetching available models:", error);
      res.status(500).json({ message: "Failed to fetch available models" });
    }
  });

  // Get all models with filtering
  app.get(`${apiPrefix}/models`, async (req, res) => {
    try {
      const walletAddress = req.session?.walletAddress;
      const showOwned = req.query.showOwned === "true";
      const priceRange = req.query.priceRange 
        ? (req.query.priceRange as string).split(",").map(p => parseFloat(p))
        : undefined;
      const categoryFilter = req.query.categoryFilter as string;
      const searchTerm = req.query.searchTerm as string;
      
      const models = await storage.getModels(
        walletAddress,
        showOwned,
        priceRange,
        categoryFilter,
        searchTerm
      );
      
      const categories = await storage.getModelCategories();
      
      res.json({ models, categories });
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  // Purchase a model
  app.post(`${apiPrefix}/models/:modelId/purchase`, requireWalletAuth, async (req, res) => {
    try {
      const { modelId } = req.params;
      const walletAddress = req.session.walletAddress;
      
      const purchaseResult = await storage.purchaseModel(modelId, walletAddress);
      
      res.json(purchaseResult);
    } catch (error) {
      console.error("Error purchasing model:", error);
      res.status(500).json({ message: "Failed to purchase model" });
    }
  });

  // Transactions route
  app.get(`${apiPrefix}/transactions/recent`, requireWalletAuth, async (req, res) => {
    try {
      const walletAddress = req.session.walletAddress;
      const recentTransactions = await storage.getRecentTransactions(walletAddress);
      
      res.json(recentTransactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  // Documentation routes
  app.get(`${apiPrefix}/documentation`, async (req, res) => {
    try {
      const documentationData = await storage.getDocumentation();
      
      res.json(documentationData);
    } catch (error) {
      console.error("Error fetching documentation:", error);
      res.status(500).json({ message: "Failed to fetch documentation" });
    }
  });

  // Wallet auth routes
  app.post(`${apiPrefix}/auth/wallet/connect`, async (req, res) => {
    try {
      const { address, signature, message } = req.body;
      
      if (!address || !signature || !message) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const isValid = await storage.verifyWalletSignature(address, signature, message);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid signature" });
      }
      
      // Store the wallet address in session
      req.session.walletAddress = address;
      
      // Create or update user record
      await storage.createOrUpdateUser(address);
      
      res.json({ success: true, address });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(500).json({ message: "Failed to connect wallet" });
    }
  });

  app.post(`${apiPrefix}/auth/wallet/disconnect`, (req, res) => {
    if (req.session) {
      delete req.session.walletAddress;
    }
    
    res.json({ success: true });
  });

  // Google auth routes
  app.get(`${apiPrefix}/auth/google`, (req, res, next) => {
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })(req, res, next);
  });
  
  app.get(`${apiPrefix}/auth/google/callback`, 
    passport.authenticate('google', { 
      failureRedirect: '/login?error=google-auth'
    }),
    (req, res) => {
      res.redirect('/');
    }
  );
  
  app.get(`${apiPrefix}/auth/current-user`, (req, res) => {
    if (!req.session || !req.session.walletAddress && !req.isAuthenticated()) {
      return res.status(401).json({ isAuthenticated: false });
    }
    
    const user = req.user as any;
    const response = {
      isAuthenticated: true,
      walletAddress: req.session.walletAddress,
      ...(user && { 
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar
      })
    };
    
    res.json(response);
  });
  
  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    if (req.session) {
      delete req.session.walletAddress;
    }
    
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
