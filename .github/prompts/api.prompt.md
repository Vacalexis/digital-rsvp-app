# API Development Task

You are working on the Vercel Serverless API for Digital RSVP App.

## API Architecture

### Location
All API files are in the `/api` folder:
```
api/
├── events/
│   ├── index.ts           # GET (list), POST (create)
│   ├── [id].ts            # GET, PUT, DELETE by ID
│   └── share/
│       └── [code].ts      # GET by share code
├── guests/
│   ├── index.ts           # GET (list), POST (create)
│   └── [id].ts            # GET, PUT, DELETE by ID
├── invitations/
│   ├── index.ts           # GET (list), POST (create)
│   ├── [id].ts            # GET, PUT, DELETE by ID
│   └── code/
│       └── [code].ts      # GET by share code (public)
└── lib/
    └── mongodb.ts         # Connection singleton
```

### Database
- **MongoDB Atlas** with connection string in `MONGODB_URI` env var
- **Collections**: `events`, `guests`, `invitations`

## API Endpoint Pattern

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMongoClient } from "../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers (required for frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const client = await getMongoClient();
    const db = client.db("digital-rsvp");
    const collection = db.collection("items");

    switch (req.method) {
      case "GET": {
        const items = await collection.find({}).toArray();
        // Convert _id to id for frontend
        const result = items.map(item => ({
          ...item,
          id: item._id.toString(),
          _id: undefined,
        }));
        return res.status(200).json(result);
      }

      case "POST": {
        const data = req.body;
        
        // Validate required fields
        if (!data.requiredField) {
          return res.status(400).json({ error: "requiredField is required" });
        }
        
        const now = new Date().toISOString();
        const newItem = {
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        
        const result = await collection.insertOne(newItem);
        return res.status(201).json({
          ...newItem,
          id: result.insertedId.toString(),
        });
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
}
```

## ID Handling (Critical!)

MongoDB uses `_id` (ObjectId), but frontend expects `id` (string).

```typescript
// Converting for response
const item = await collection.findOne({ _id: new ObjectId(id) });
if (item) {
  return res.status(200).json({
    ...item,
    id: item._id.toString(),
    _id: undefined,
  });
}

// Finding by either format (backwards compatibility)
const item = await collection.findOne({
  $or: [
    { _id: new ObjectId(id) },
    { id: id }  // Legacy string id
  ]
});
```

## Validation Pattern

```typescript
// Basic validation
function validateEventData(data: any): { valid: boolean; error?: string } {
  if (!data.title?.trim()) {
    return { valid: false, error: "title is required" };
  }
  if (!data.date) {
    return { valid: false, error: "date is required" };
  }
  if (!data.eventType) {
    return { valid: false, error: "eventType is required" };
  }
  return { valid: true };
}

// Usage in handler
case "POST": {
  const validation = validateEventData(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  // ... proceed with creation
}
```

## Testing Locally

```bash
# Start local server with API
vercel dev

# Test endpoints (in a SEPARATE terminal!)
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET

# Create item
$body = @{ title = "Test"; date = "2026-06-15" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method POST -Body $body -ContentType "application/json"
```

## Common Issues

### "Cannot find module 'mongodb'"
Ensure `mongodb` is in dependencies (not devDependencies).

### CORS errors
All handlers must have CORS headers at the top.

### ObjectId errors
Always wrap in try-catch when creating `new ObjectId(id)`.

### Connection timeouts
Use the singleton pattern in `lib/mongodb.ts`.

## Checklist
- [ ] CORS headers present
- [ ] `_id` converted to `id` in responses
- [ ] Required fields validated
- [ ] Error responses have consistent format
- [ ] Timestamps (`createdAt`, `updatedAt`) managed
