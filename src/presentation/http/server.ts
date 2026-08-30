import express, { type Express } from 'express';
const app: Express = express();


import { rAuthInstance } from '../routes/RAuth.js';

const PORT = process.env.PORT || 3000;

app.use("/api/v1/auth",rAuthInstance)

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
