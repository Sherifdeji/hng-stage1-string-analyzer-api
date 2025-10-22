import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import stringRoutes from './routes/stringRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'My HNG Stage 1 API is running!',
  });
});

app.use(stringRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'SyntaxError' && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request: Invalid JSON format',
    });
  }
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
