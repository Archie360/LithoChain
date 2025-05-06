// Simple API proxy for Vercel serverless functions
import express from 'express';

// Create Express app for serverless handling
const app = express();
app.use(express.json());

// Helper function to handle API requests
const handleApiRequest = (req, res) => {
  // Extract the API endpoint from the path
  const path = req.url.replace('/api/', '');
  
  // Handle each API endpoint
  switch (path) {
    case 'dashboard':
      return res.json({
        stats: {
          activeJobs: 2,
          completedJobs: 5,
          ownedModels: 3,
          balance: "1.245 MATIC"
        }
      });
      
    case 'models/featured':
      return res.json([
        {
          id: 1,
          name: "Advanced EUV Model v3.2",
          description: "State-of-the-art extreme ultraviolet lithography simulation model for 3nm processes",
          price: "0.25 MATIC",
          priceInWei: "250000000000000000",
          rating: 4.8,
          category: "euv",
          features: ["3nm process", "Multi-patterning support", "Etch simulation"],
          author: "ASML Research",
          authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
          licensedToUser: false,
          imageUrl: "https://via.placeholder.com/400x225/4338ca/ffffff?text=EUV+Model"
        },
        {
          id: 2,
          name: "FinFET Process Simulator",
          description: "Accurate modeling of advanced FinFET structures including multi-gate configurations",
          price: "0.15 MATIC",
          priceInWei: "150000000000000000",
          rating: 4.5,
          category: "finfet",
          features: ["Multi-gate support", "Sidewall angle analysis", "Pattern density optimization"],
          author: "Semiconductor Physics Lab",
          authorAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
          licensedToUser: true,
          imageUrl: "https://via.placeholder.com/400x225/6366f1/ffffff?text=FinFET+Simulator"
        },
        {
          id: 3,
          name: "BEOL Layer Optimizer",
          description: "Back-end-of-line interconnect modeling with resistance and capacitance analysis",
          price: "0.10 MATIC",
          priceInWei: "100000000000000000",
          rating: 4.2,
          category: "interconnect",
          features: ["RC extraction", "Via optimization", "Metal density analysis"],
          author: "Interconnect Technologies",
          authorAddress: "0x7890abcdef1234567890abcdef1234567890abcd",
          licensedToUser: false,
          imageUrl: "https://via.placeholder.com/400x225/8b5cf6/ffffff?text=BEOL+Optimizer"
        }
      ]);
      
    case 'jobs/results/recent':
      return res.json([
        {
          id: "result-1",
          jobId: "JOB-1001",
          modelName: "Advanced Edge Detection v2",
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          status: "completed",
          imageUrl: "https://via.placeholder.com/300x300/4f46e5/ffffff?text=Result+1"
        },
        {
          id: "result-2",
          jobId: "JOB-1002",
          modelName: "High-NA EUV Model",
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: "completed",
          imageUrl: "https://via.placeholder.com/300x300/6366f1/ffffff?text=Result+2"
        }
      ]);
      
    case 'jobs/active':
      return res.json([]);
      
    case 'transactions/recent':
      return res.json([]);
      
    case 'auth/wallet/connect':
      if (req.method === 'POST') {
        return res.json({ success: true, address: req.body?.address || "0x1234..." });
      }
      return res.status(405).json({ message: "Method not allowed" });
      
    case 'documentation':
      return res.json({
        categories: [
          {
            id: "getting-started",
            title: "Getting Started",
            items: [
              {
                id: "intro",
                title: "Introduction to Lithochain",
                content: "Lithochain is a decentralized marketplace for lithography simulation models...",
                category: "getting-started"
              }
            ]
          }
        ]
      });
      
    default:
      return res.status(404).json({ message: "API endpoint not found" });
  }
};

// Handler function for Vercel serverless function
export default function handler(req, res) {
  // Set CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Process API requests
  return handleApiRequest(req, res);
}
