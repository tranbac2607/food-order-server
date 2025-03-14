import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.DB_PORT) || 8080;

app.use(bodyParser.json());
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
