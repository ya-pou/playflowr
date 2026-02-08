import dotenv from 'dotenv';
dotenv.config();

import express, { Router } from 'express';
import routes from './routes';


const app = express();
const router = Router();


app.use(routes);


export default app;
