const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const affiliateRoutes = require('./routes/affiliate.routes');
const billingRoutes = require('./routes/billing.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');
const { startWorker } = require('./workers/videoWorker');
const path = require('path');

dotenv.config();
connectDB();
startWorker();

const app = express();

app.use(cors({
 origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const passport = require('./config/passport');  // ← ADD
app.use(passport.initialize());                  // ← ADD

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: '✦ ClipForge API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/affiliate', affiliateRoutes);
app.use('/api/v1/billing', billingRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});