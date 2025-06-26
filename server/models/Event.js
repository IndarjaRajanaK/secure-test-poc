import mongoose from 'mongoose';
export default mongoose.model('Event', new mongoose.Schema({
  userId: String,
  sessionId: String,
  eventType: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
}));