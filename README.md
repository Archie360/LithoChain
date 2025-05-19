# ChainLithograph

ChainLithograph is a platform for advanced lithography simulation services, targeting semiconductor manufacturers and designers. It provides access to high-quality simulation models and job processing services through a blockchain-based marketplace.

## Key Features

- **Lithography Simulation Models**: Access to a variety of advanced lithography simulation models
- **Job Processing**: Submit simulation jobs and receive detailed results
- **Blockchain Integration**: Purchase models and pay for jobs using cryptocurrency
- **User Authentication**: Login with Google OAuth or crypto wallet

## Sample Data

The application includes sample data to demonstrate functionality:

### Models

- Advanced EUV Mask Defect Analysis
- FinFET Process Simulation
- Multi-Patterning Optimization
- Advanced Gate Pattern v2
- Line Edge Roughness Analysis
- DRAM Cell Patterning
- Quantum Dot Patterning Simulation
- 3D FinFET Optimization
- High-k Metal Gate Simulation

### Sample Jobs

The database contains sample jobs in various states (queued, processing, completed, failed) to demonstrate the job lifecycle.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database connection:
   ```
   # .env file
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```
4. Run database push to create schema:
   ```
   npm run db:push
   ```
5. Seed the database with sample data:
   ```
   npm run db:seed
   ```
6. Start the development server:
   ```
   npm run dev
   ```

## Authentication Setup

### Google OAuth

See `GOOGLE_AUTH_SETUP.md` for detailed instructions on setting up Google OAuth.

### Environment Variables

For local development, create a `.env` file with:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your_secure_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Deployment

1. Configure your Vercel project with proper environment variables
2. Ensure DATABASE_URL is set correctly in Vercel
3. The `vercel.json` file is already configured with the correct build and routing settings
4. Deploy to Vercel

## User Accounts

The seed data creates the following test accounts:

- john_smith: Blockchain services customer
- alice_wong: Semiconductor design engineer
- semiconductor_expert: Model author and industry expert
