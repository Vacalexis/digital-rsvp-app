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
    const collection = db.collection('guests');

    switch (req.method) {
      case 'GET': {
        // Optionally filter by eventId
        const { eventId } = req.query;
        const filter = eventId && typeof eventId === 'string' 
          ? { eventId } 
          : {};
        
        const guests = await collection.find(filter).toArray();
        
        // Convert _id to id for frontend compatibility
        const formattedGuests = guests.map(guest => ({
          ...guest,
          id: guest._id.toString(),
          _id: undefined,
        }));
        
        return res.status(200).json(formattedGuests);
      }

      case 'POST': {
        const guestData = req.body;
        const now = new Date().toISOString();
        
        const newGuest = {
          ...guestData,
          createdAt: now,
          updatedAt: now,
        };
        
        const result = await collection.insertOne(newGuest);
        
        return res.status(201).json({
          ...newGuest,
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
