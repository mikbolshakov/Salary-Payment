import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3500;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/', router);

async function startApp() {
  try {
    app.listen(PORT, () =>
      console.log('The server is running on port ' + PORT),
    );
  } catch (error) {
    console.log(error);
  }
}

startApp();
