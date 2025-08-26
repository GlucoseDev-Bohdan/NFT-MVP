import express from 'express';
// import path from "path";
// import { fileURLToPath } from "url";
import cors from 'cors';
import { ENV, validateEnv } from './config.js';
import { initializeSolana } from './services/solana.js';
import routes from './routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",      // your local frontend
    "https://nft-mvp-project.netlify.app/"
  ]
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve frontend build (React)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const clientBuildPath = path.join(__dirname, "../../dist");

// // Serve static files
// app.use(express.static(clientBuildPath));

// // Fallback for React Router
// app.get("*", (_req, res) => {
//   res.sendFile(path.join(clientBuildPath, "index.html"));
// });

// Start server
async function startServer() {
  const envCheck = validateEnv();
  
  if (!envCheck.valid) {
    console.error('❌ Environment validation failed:');
    envCheck.errors.forEach(error => console.error('  -', error));
    
    if (!ENV.MOCK_MODE) {
      console.error('Set MOCK_MODE=true to run without wallet configuration');
      process.exit(1);
    }
  }

  try {
    initializeSolana();
    
    app.listen(ENV.PORT, () => {
      console.log('🚀 Server running on port', ENV.PORT);
      console.log('🌐 Network:', ENV.NETWORK);
      console.log('🔗 RPC URL:', ENV.RPC_URL);
      
      if (ENV.MOCK_MODE) {
        console.log('🎭 Mock mode enabled - API will return fake responses');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();