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

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Guest ID is required' });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('guests');

    // Check if id is a valid ObjectId or a custom id
    let query: any;
    if (ObjectId.isValid(id) && id.length === 24) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }

    switch (req.method) {
      case 'GET': {
        const guest = await collection.findOne(query);
        
        if (!guest) {
          return res.status(404).json({ error: 'Guest not found' });
        }
        
        return res.status(200).json({
          ...guest,
          id: guest._id.toString(),
          _id: undefined,
        });
      }

      case 'PUT': {
        const updates = req.body;
        
        const result = await collection.findOneAndUpdate(
          query,
          { 
            $set: {
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return res.status(404).json({ error: 'Guest not found' });
        }
        
        return res.status(200).json({
          ...result,
          id: result._id.toString(),
          _id: undefined,
        });
      }

      case 'DELETE': {
        const result = await collection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Guest not found' });
        }
        
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
