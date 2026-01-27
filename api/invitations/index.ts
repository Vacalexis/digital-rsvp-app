import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDatabase } from "../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("invitations");

    switch (req.method) {
      case "GET": {
        const { eventId } = req.query;
        const query = eventId ? { eventId: eventId as string } : {};
        const invitations = await collection.find(query).toArray();

        // Convert _id to id for frontend compatibility
        const formattedInvitations = invitations.map((inv) => ({
          ...inv,
          id: inv._id.toString(),
          _id: undefined,
        }));
        return res.status(200).json(formattedInvitations);
      }

      case "POST": {
        const invitationData = req.body;
        const now = new Date().toISOString();

        // Generate unique shareCode
        const shareCode = generateInvitationCode();

        const newInvitation = {
          ...invitationData,
          shareCode,
          rsvpSubmitted: false,
          createdAt: now,
          updatedAt: now,
        };

        const result = await collection.insertOne(newInvitation);

        return res.status(201).json({
          ...newInvitation,
          id: result.insertedId.toString(),
        });
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Internal Server Error",
      message: errorMessage,
    });
  }
}

function generateInvitationCode(): string {
  // Longer code for invitations (more unique per guest)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: 0,O,1,I
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
