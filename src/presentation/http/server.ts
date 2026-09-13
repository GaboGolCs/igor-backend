import express, { type Express } from 'express';
import { rAuthInstance } from '../routes/RAuth.js';
import { rFamilyInstance } from '../routes/RFamily.js';
import { rMoodInstace } from '../routes/RMood.js';
const PORT = process.env.PORT || 3000;
  
const app: Express = express();

app.use(express.json());
console.log("Ya parseamos")
app.use("/api/v1/auth",rAuthInstance)
app.use("/api/v1/family",rFamilyInstance)
app.use("/api/v1/moods",rMoodInstace)


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
