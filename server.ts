import express, { Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

//For env File 
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('common'));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Vending Machine API');
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});