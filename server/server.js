import https from 'https';
import fs from 'node:fs';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'; dotenv.config();

import eventsRoute from './routes/events.js';
import authRoute from './routes/auth.js';

await mongoose.connect(process.env.MONGO_URI);
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRoute);
app.use('/api/auth', authRoute);

// app.listen(process.env.PORT, ()=>
//   console.log('API listening on', process.env.PORT));


// 👇 HTTPS options
const httpsOptions = {
  key : fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

// Start HTTPS server
https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log(`✅  HTTPS API running at https://localhost:${process.env.PORT}`);
});