import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import foodRoutes from './routes/food.routes';
import { responseFormatter } from './middleware/response-formatter';

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 8080;

app.use(
  cors({
    origin: '*', // Hoặc thay bằng ['http://localhost:3000', 'https://yourdomain.com']
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Cho phép gửi cookie và thông tin đăng nhập
    preflightContinue: false, // Xử lý preflight request tự động
    optionsSuccessStatus: 204, // Tránh lỗi với trình duyệt cũ
  })
);

app.use(bodyParser.json());
app.use(responseFormatter);

app.use('/users', userRoutes);
app.use('/api/foods', foodRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Khi tiến trình bị kill, đóng server trước khi restart
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Server is stopping...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

// Nếu lỗi cổng 8080 bị chiếm dụng, tự động restart
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 8080 is already in use. Restarting...');
    process.exit(1);
  }
});
