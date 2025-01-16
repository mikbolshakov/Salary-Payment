import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3500;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/', router);

const startApp = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', (error as Error).message);
  }
};

startApp();
