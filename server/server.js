require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed/seedData');

// Models
const Pod = require('./models/Pod');
const Employee = require('./models/Employee');
const Brand = require('./models/Brand');
const Roster = require('./models/Roster');

// Routes
const rosterRoutes = require('./routes/rosterRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/roster', rosterRoutes);

// Health Check & Diagnostic Route
app.get('/api/health', async (req, res) => {
  try {
    const [podCount, empCount, brandCount, rosterCount] = await Promise.all([
      Pod.countDocuments(),
      Employee.countDocuments(),
      Brand.countDocuments(),
      Roster.countDocuments(),
    ]);

    res.json({
      status: 'healthy',
      service: 'DataStraw Smart Roster Management API',
      timestamp: new Date().toISOString(),
      stats: {
        pods: podCount,
        employees: empCount,
        brands: brandCount,
        savedRosters: rosterCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Connect to DB and Start Server
const startServer = async () => {
  await connectDB();

  // Auto-seed if database is fresh
  const empCount = await Employee.countDocuments();
  if (empCount === 0) {
    console.log('[Server] Fresh database detected. Auto-seeding base dataset...');
    await seedDatabase(true);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] DataStraw Roster Engine running on http://localhost:${PORT}`);
  });
  return server;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
