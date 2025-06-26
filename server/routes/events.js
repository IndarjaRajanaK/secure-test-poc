import { Router } from 'express';
import Event from '../models/Event.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; dotenv.config();

const router = Router();

function auth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  try{ req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch{ return res.sendStatus(403); }
}

router.post('/', auth, async (req,res)=>{
  const { userId, sessionId, eventType, details } = req.body;
  if(!userId||!sessionId||!eventType) return res.sendStatus(400);
  await Event.create({ userId, sessionId, eventType, details });
  res.sendStatus(201);
});

export default router;