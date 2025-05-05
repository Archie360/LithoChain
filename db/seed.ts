import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { ethers } from "ethers";

// Helper function to generate a random Ethereum address
const randomEthAddress = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
};

// Helper function to generate wallet-friendly price in both decimal and wei
const createPrice = (maticValue: number) => {
  const weiValue = ethers.parseEther(maticValue.toString()).toString();
  return { price: maticValue.toString(), priceInWei: weiValue };
};

async function seed() {
  try {
    console.log("Starting to seed database...");

    // Check if we already have seed data to avoid duplicating
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length > 0) {
      console.log("Database already contains users, using existing users for new sample data");
      
      // Clear existing sample data before adding new ones (BE CAREFUL IN PRODUCTION)
      console.log("Clearing existing models, jobs, and transactions...");
      await db.delete(schema.transactions);
      await db.delete(schema.jobs);
      await db.delete(schema.modelLicenses);
      await db.delete(schema.models);
    }

    // Create sample users
    const users = [
      {
        username: "john_smith",
        password: "hashed_password", // In production, this would be properly hashed
        walletAddress: "0x71Ce042A9B246bF89f77AAcfC8A4319f5D95551A",
        email: "john@example.com"
      },
      {
        username: "alice_wong",
        password: "hashed_password",
        walletAddress: "0x93B6e9F19Bd70A128D69d63a84DcBBBdA2578B2",
        email: "alice@example.com"
      },
      {
        username: "semiconductor_expert",
        password: "hashed_password",
        walletAddress: "0x4a27c8F749D19B121D324F97ffaDB00D46489aE1",
        email: "expert@example.com"
      }
    ];

    // Use existing users if available, otherwise insert new ones
    let insertedUsers;
    if (existingUsers.length > 0) {
      console.log("Using existing users...");
      insertedUsers = existingUsers;
      
      // Make sure we have at least 3 users as our sample data expects
      if (insertedUsers.length < 3) {
        console.log("Not enough existing users, creating more...");
        // Add more users if needed
        const additionalUsers = users.slice(insertedUsers.length);
        if (additionalUsers.length > 0) {
          const newUsers = await db.insert(schema.users).values(additionalUsers).returning();
          insertedUsers = [...insertedUsers, ...newUsers];
        }
      }
    } else {
      console.log("Inserting new users...");
      insertedUsers = await db.insert(schema.users).values(users).returning();
    }
    
    // Create model categories
    const categories = [
      "EUV Lithography",
      "Gate Patterning",
      "Line Edge Roughness",
      "Multi-Patterning",
      "FinFET Process",
      "DRAM Cell"
    ];

    // Create sample models
    const priceMultiplier = 0.01; // for convenience in calculations
    const modelsData = [
      {
        name: "Advanced EUV Mask Defect Analysis",
        description: "High precision model for EUV pattern analysis",
        ...createPrice(0.15),
        authorId: insertedUsers[2].id, // expert user
        authorAddress: insertedUsers[2].walletAddress,
        category: "EUV Lithography",
        features: ["Defect detection", "Pattern fidelity", "EUV-optimized"],
        rating: "4.5",
        numReviews: 27,
        contractAddress: randomEthAddress(),
        tokenId: 1,
        metadataUri: "ipfs://Qm123456789abcdef/1",
        imageUrl: "https://images.unsplash.com/photo-1592664474574-33de548ece4c"
      },
      {
        name: "FinFET Process Simulation",
        description: "Complete 7nm process with optimized parameters",
        ...createPrice(0.22),
        authorId: insertedUsers[2].id,
        authorAddress: insertedUsers[2].walletAddress,
        category: "FinFET Process",
        features: ["7nm process", "High aspect ratio", "Production-ready"],
        rating: "5.0",
        numReviews: 32,
        contractAddress: randomEthAddress(),
        tokenId: 2,
        metadataUri: "ipfs://Qm123456789abcdef/2",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
      },
      {
        name: "Multi-Patterning Optimization",
        description: "Reduces edge placement errors by up to 35%",
        ...createPrice(0.18),
        authorId: insertedUsers[2].id,
        authorAddress: insertedUsers[2].walletAddress,
        category: "Multi-Patterning",
        features: ["SADP compatible", "Error reduction", "Yield improvement"],
        rating: "4.2",
        numReviews: 19,
        contractAddress: randomEthAddress(),
        tokenId: 3,
        metadataUri: "ipfs://Qm123456789abcdef/3"
      },
      {
        name: "Advanced Gate Pattern v2",
        description: "Optimized gate patterning for 5nm node with variability control",
        ...createPrice(0.20),
        authorId: insertedUsers[2].id,
        authorAddress: insertedUsers[2].walletAddress,
        category: "Gate Patterning",
        features: ["5nm node", "Variability control", "Metal gate compatible"],
        rating: "4.7",
        numReviews: 23,
        contractAddress: randomEthAddress(),
        tokenId: 4,
        metadataUri: "ipfs://Qm123456789abcdef/4"
      },
      {
        name: "Line Edge Roughness Analysis",
        description: "Advanced analysis of line edge roughness with statistical modeling",
        ...createPrice(0.12),
        authorId: insertedUsers[2].id,
        authorAddress: insertedUsers[2].walletAddress,
        category: "Line Edge Roughness",
        features: ["Statistical modeling", "Roughness quantification", "Pattern fidelity"],
        rating: "4.3",
        numReviews: 15,
        contractAddress: randomEthAddress(),
        tokenId: 5,
        metadataUri: "ipfs://Qm123456789abcdef/5"
      },
      {
        name: "DRAM Cell Patterning",
        description: "Optimized patterning solution for high-density DRAM cells",
        ...createPrice(0.25),
        authorId: insertedUsers[2].id,
        authorAddress: insertedUsers[2].walletAddress,
        category: "DRAM Cell",
        features: ["High density", "Minimal capacitance", "Low leakage"],
        rating: "4.8",
        numReviews: 18,
        contractAddress: randomEthAddress(),
        tokenId: 6,
        metadataUri: "ipfs://Qm123456789abcdef/6"
      }
    ];

    console.log("Inserting models...");
    const insertedModels = await db.insert(schema.models).values(modelsData).returning();

    // Create model licenses (user 1 owns some models)
    const licenses = [
      {
        userId: insertedUsers[0].id,
        modelId: insertedModels[0].id,
        walletAddress: insertedUsers[0].walletAddress || "", // Handle null values
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      },
      {
        userId: insertedUsers[0].id,
        modelId: insertedModels[3].id,
        walletAddress: insertedUsers[0].walletAddress || "", // Handle null values
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      }
    ];

    console.log("Inserting model licenses...");
    await db.insert(schema.modelLicenses).values(licenses);

    // Create sample jobs
    const jobStatusOptions = ["queued", "processing", "completed", "failed"];
    const jobsData = [
      {
        jobId: "JOB-3892",
        userId: insertedUsers[0].id,
        modelId: insertedModels[3].id, // Advanced Gate Pattern v2
        name: "Gate pattern simulation with 5nm resolution",
        status: "processing",
        progress: 75,
        parameters: {
          resolution: 5,
          wavelength: 193,
          numericalAperture: 0.93,
          iterations: 1000
        },
        maskFileUrl: "https://storage.example.com/masks/job-3892.gds",
        cost: "0.05",
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        jobId: "JOB-3891",
        userId: insertedUsers[0].id,
        modelId: insertedModels[4].id, // Line Edge Roughness Analysis
        name: "Edge roughness analysis for 7nm features",
        status: "queued",
        parameters: {
          resolution: 2,
          wavelength: 193,
          numericalAperture: 0.85,
          iterations: 2000
        },
        maskFileUrl: "https://storage.example.com/masks/job-3891.gds",
        cost: "0.08",
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        jobId: "JOB-3889",
        userId: insertedUsers[0].id,
        modelId: insertedModels[2].id, // Multi-Patterning Simulation
        name: "SADP simulation for memory array",
        status: "processing",
        progress: 24,
        parameters: {
          resolution: 3,
          wavelength: 193,
          numericalAperture: 0.90,
          iterations: 1500
        },
        maskFileUrl: "https://storage.example.com/masks/job-3889.gds",
        cost: "0.12",
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        jobId: "JOB-3880",
        userId: insertedUsers[0].id,
        modelId: insertedModels[3].id, // Advanced Gate Pattern v2
        name: "Gate pattern with optimization",
        status: "completed",
        progress: 100,
        parameters: {
          resolution: 4,
          wavelength: 193,
          numericalAperture: 0.93,
          iterations: 1200
        },
        maskFileUrl: "https://storage.example.com/masks/job-3880.gds",
        cost: "0.07",
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
        resultId: "RES-3880",
        resultFileUrl: "https://storage.example.com/results/res-3880.zip",
        resultImageUrl: "https://images.unsplash.com/photo-1592664474574-33de548ece4c"
      },
      {
        jobId: "JOB-3870",
        userId: insertedUsers[0].id,
        modelId: insertedModels[4].id, // Line Edge Roughness Analysis
        name: "Edge roughness for critical dimension",
        status: "completed",
        progress: 100,
        parameters: {
          resolution: 2.5,
          wavelength: 193,
          numericalAperture: 0.88,
          iterations: 1800
        },
        maskFileUrl: "https://storage.example.com/masks/job-3870.gds",
        cost: "0.09",
        transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), // 2.5 days ago
        resultId: "RES-3870",
        resultFileUrl: "https://storage.example.com/results/res-3870.zip",
        resultImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
      }
    ];

    console.log("Inserting jobs...");
    const insertedJobs = await db.insert(schema.jobs).values(jobsData).returning();

    // Create sample transactions
    const transactionsData = [
      {
        userId: insertedUsers[0].id,
        type: "job_payment",
        amount: "0.12",
        amountInWei: ethers.parseEther("0.12").toString(),
        txHash: "0x71C9e33d798C9D13B92d323E65d76859bFdF7Bdace6453Dbde4e31A96c42f9",
        fromAddress: insertedUsers[0].walletAddress,
        toAddress: "0x0000000000000000000000000000000000000001", // Contract address
        jobId: insertedJobs[2].id,
        metadata: {
          jobId: "JOB-3889"
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        userId: insertedUsers[0].id,
        type: "model_purchase",
        amount: "0.18",
        amountInWei: ethers.parseEther("0.18").toString(),
        txHash: "0x93B60F19Bd723A128D69d63a84DcBBBdA2578B2ace6453Dbde4e31A96c42f9",
        fromAddress: insertedUsers[0].walletAddress,
        toAddress: insertedUsers[2].walletAddress, // Author's address
        modelId: insertedModels[2].id,
        metadata: {
          modelName: "Multi-Patterning Optimization"
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: insertedUsers[0].id,
        type: "deposit",
        amount: "1.00",
        amountInWei: ethers.parseEther("1.0").toString(),
        txHash: "0x93B60F19Bd70A128D69d63a84DcBBBdA2578B2ace6453Dbde4e31A96c78b2",
        fromAddress: "0x93B6e9F19Bd70A128D69d63a84DcBBBdA2578B2", // External wallet
        toAddress: insertedUsers[0].walletAddress,
        metadata: {
          from: "External Wallet"
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    console.log("Inserting transactions...");
    await db.insert(schema.transactions).values(transactionsData);

    // Create documentation
    const documentationData = [
      // Getting Started category
      {
        title: "Introduction to LithoChain",
        content: `
          <div class="prose">
            <p>LithoChain is a decentralized marketplace for lithography simulation models and compute resources built on blockchain technology. This platform enables semiconductor designers to access cutting-edge lithography models and run simulations in a secure and transparent environment.</p>
            <h3>Key Features</h3>
            <ul>
              <li>Browse and purchase verified lithography models from experts</li>
              <li>Submit simulation jobs with custom parameters</li>
              <li>Track job status and view results in real-time</li>
              <li>Transparent pricing and provenance tracking</li>
              <li>Layer-2 blockchain integration for low gas fees</li>
            </ul>
            <p>This documentation will guide you through the platform's features and help you get started with lithography simulations.</p>
          </div>
        `,
        category: "getting-started",
        slug: "introduction",
        sortOrder: 1
      },
      {
        title: "Connecting Your Wallet",
        content: `
          <div class="prose">
            <p>LithoChain requires a cryptocurrency wallet for transactions and authentication. We currently support MetaMask and other Ethereum-compatible wallets.</p>
            <h3>Setting Up MetaMask</h3>
            <ol>
              <li>Install the MetaMask browser extension from <a href="https://metamask.io/" target="_blank">metamask.io</a></li>
              <li>Create a new wallet or import an existing one</li>
              <li>Connect to the Polygon network (or other supported Layer-2 networks)</li>
            </ol>
            <h3>Adding Polygon Network to MetaMask</h3>
            <p>If Polygon is not already in your networks list, add it with these parameters:</p>
            <ul>
              <li>Network Name: Polygon Mainnet</li>
              <li>RPC URL: https://polygon-rpc.com/</li>
              <li>Chain ID: 137</li>
              <li>Symbol: MATIC</li>
              <li>Block Explorer: https://polygonscan.com/</li>
            </ul>
            <h3>Connecting to LithoChain</h3>
            <p>Click the "Connect Wallet" button in the top-right corner of the LithoChain interface and approve the connection request in your wallet.</p>
          </div>
        `,
        category: "getting-started",
        slug: "connecting-wallet",
        sortOrder: 2
      },
      {
        title: "Browsing the Marketplace",
        content: `
          <div class="prose">
            <p>The LithoChain marketplace features a variety of lithography models for different semiconductor design needs.</p>
            <h3>Finding Models</h3>
            <p>Use the search and filter options to find models based on:</p>
            <ul>
              <li>Category (e.g., EUV, Multi-Patterning, FinFET)</li>
              <li>Price range</li>
              <li>Rating</li>
              <li>Specific features</li>
            </ul>
            <h3>Model Details</h3>
            <p>Each model listing includes:</p>
            <ul>
              <li>Description and specifications</li>
              <li>Author information and reputation</li>
              <li>User ratings and reviews</li>
              <li>Pricing information</li>
              <li>Sample results (when available)</li>
            </ul>
            <h3>Purchasing Models</h3>
            <p>To purchase a model license:</p>
            <ol>
              <li>Click the "Purchase" button on the model card</li>
              <li>Confirm the transaction in your wallet</li>
              <li>Once confirmed, the model will appear in your "Owned Models" section</li>
            </ol>
            <p>All model licenses are stored on-chain as NFTs, ensuring permanent proof of ownership.</p>
          </div>
        `,
        category: "getting-started",
        slug: "browsing-marketplace",
        sortOrder: 3
      },
      // API Reference category
      {
        title: "REST API Overview",
        content: `
          <div class="prose">
            <p>LithoChain provides a RESTful API for integrating with your existing design workflows and tools.</p>
            <h3>Base URL</h3>
            <p><code>https://api.lithochain.io/v1</code></p>
            <h3>Authentication</h3>
            <p>All API requests require authentication using JWT tokens or wallet signatures.</p>
            <p>To authenticate:</p>
            <ol>
              <li>Generate a signature in your wallet for a specific message</li>
              <li>Send the signature along with your wallet address to get an authentication token</li>
              <li>Include the token in the Authorization header of subsequent requests</li>
            </ol>
            <pre><code>Authorization: Bearer {token}</code></pre>
            <h3>Rate Limiting</h3>
            <p>API requests are limited to 100 requests per minute per authenticated user.</p>
            <h3>Response Format</h3>
            <p>All responses are returned in JSON format with standard HTTP status codes.</p>
          </div>
        `,
        category: "api-reference",
        slug: "api-overview",
        sortOrder: 1
      },
      {
        title: "Job Submission API",
        content: `
          <div class="prose">
            <h3>Submit a Simulation Job</h3>
            <p><code>POST /jobs</code></p>
            <p>Creates a new simulation job with the specified parameters.</p>
            <h4>Request Body</h4>
            <pre><code>{
  "name": "My Simulation Job",
  "modelId": "model-123",
  "parameters": {
    "resolution": 5,
    "wavelength": 193,
    "numericalAperture": 0.93,
    "iterations": 1000
  }
}</code></pre>
            <h4>Response</h4>
            <pre><code>{
  "success": true,
  "jobId": "job-456",
  "status": "queued",
  "estimatedCost": "0.05 MATIC"
}</code></pre>
            <h3>Get Job Status</h3>
            <p><code>GET /jobs/{jobId}</code></p>
            <p>Retrieves the current status of a simulation job.</p>
            <h4>Response</h4>
            <pre><code>{
  "jobId": "job-456",
  "status": "processing",
  "progress": 45,
  "startedAt": "2023-04-15T10:30:00Z",
  "estimatedCompletionTime": "2023-04-15T11:30:00Z"
}</code></pre>
          </div>
        `,
        category: "api-reference",
        slug: "job-submission-api",
        sortOrder: 2
      },
      // Model Guidelines category
      {
        title: "Model Submission Requirements",
        content: `
          <div class="prose">
            <p>Contributing lithography models to LithoChain requires following specific technical and legal guidelines.</p>
            <h3>Technical Requirements</h3>
            <ul>
              <li>Models must be packaged in the standardized LithoML format</li>
              <li>Include comprehensive documentation of input parameters and expected outputs</li>
              <li>Provide validation data and benchmarks for model accuracy</li>
              <li>Support standard input formats (GDSII, OASIS, MEBES)</li>
              <li>Document computational requirements (memory, CPU, GPU)</li>
            </ul>
            <h3>Validation Process</h3>
            <p>All submitted models undergo rigorous validation:</p>
            <ol>
              <li>Initial technical review by platform administrators</li>
              <li>Verification of model accuracy against benchmark datasets</li>
              <li>Security audit of model code and dependencies</li>
              <li>Performance testing across supported hardware configurations</li>
            </ol>
            <h3>Intellectual Property</h3>
            <p>Model contributors must:</p>
            <ul>
              <li>Own or have appropriate rights to all submitted model code</li>
              <li>Specify a clear licensing model for users</li>
              <li>Disclose any third-party components or dependencies</li>
            </ul>
            <p>Contact our model review team at models@lithochain.io for more information.</p>
          </div>
        `,
        category: "model-guidelines",
        slug: "model-submission-requirements",
        sortOrder: 1
      },
      // Tutorials category
      {
        title: "Running Your First Simulation",
        content: `
          <div class="prose">
            <p>This tutorial guides you through running your first lithography simulation on LithoChain.</p>
            <h3>Prerequisites</h3>
            <ul>
              <li>Connected wallet with sufficient MATIC balance</li>
              <li>Access to at least one lithography model (purchased or free)</li>
              <li>Mask design file in GDSII, OASIS, or MEBES format (max 500MB)</li>
            </ul>
            <h3>Step 1: Navigate to Job Submission</h3>
            <p>Click the "New Job" button on the dashboard or navigate to the Jobs section and click "Create New Job".</p>
            <h3>Step 2: Configure Your Simulation</h3>
            <ol>
              <li>Enter a descriptive job name</li>
              <li>Select the appropriate lithography model</li>
              <li>Set simulation parameters:
                <ul>
                  <li>Resolution (nm)</li>
                  <li>Wavelength (nm)</li>
                  <li>Numerical aperture</li>
                  <li>Number of iterations</li>
                </ul>
              </li>
              <li>Upload your mask design file</li>
            </ol>
            <h3>Step 3: Review and Submit</h3>
            <p>Review the estimated cost and simulation parameters, then click "Submit Job" to proceed.</p>
            <h3>Step 4: Confirm Transaction</h3>
            <p>Approve the transaction in your wallet to pay for the simulation resources.</p>
            <h3>Step 5: Monitor Progress</h3>
            <p>Track your job's progress on the dashboard or in the "My Jobs" section.</p>
            <h3>Step 6: View and Download Results</h3>
            <p>Once completed, view the simulation results online or download them for use in your design tools.</p>
          </div>
        `,
        category: "tutorials",
        slug: "first-simulation",
        sortOrder: 1
      }
    ];

    console.log("Inserting documentation...");
    await db.insert(schema.documentation).values(documentationData);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed();
