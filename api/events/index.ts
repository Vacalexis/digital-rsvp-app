import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('events');

    switch (req.method) {
      case 'GET': {
        const events = await collection.find({}).toArray();
        // Convert _id to id for frontend compatibility
        const formattedEvents = events.map(event => ({
          ...event,
          id: event._id.toString(),
          _id: undefined,
        }));
        return res.status(200).json(formattedEvents);
      }

      case 'POST': {
        const eventData = req.body;
        const now = new Date().toISOString();
        
        // Generate shareCode if not provided
        const shareCode = eventData.shareCode || generateShareCode();
        
        const newEvent = {
          ...eventData,
          shareCode,
          createdAt: now,
          updatedAt: now,
        };
        
        const result = await collection.insertOne(newEvent);
        
        return res.status(201).json({
          ...newEvent,
          id: result.insertedId.toString(),
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
