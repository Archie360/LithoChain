// Serverless API entrypoint for Vercel deployment

// Simple redirect to the proxy handler
export default function handler(req, res) {
  // Set allowed origins for CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Redirect to the proxy handler
  return res.status(307).setHeader('Location', '/api/proxy').end();
}
