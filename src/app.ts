import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use('/', (req, res) => {
  res.json('Welcome on playflowr ' + process.env.PORT);
});

export default app;
