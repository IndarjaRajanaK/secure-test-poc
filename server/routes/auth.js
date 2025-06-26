import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; dotenv.config();

const router = Router();
router.post('/verify-otp', (req,res)=>{
  const { userId } = req.body; // assume OTP already checked
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, sessionId: crypto.randomUUID() });
});
export default router;