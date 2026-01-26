import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDatabase } from "../../lib/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid invitation code" });
  }

  try {
    const db = await getDatabase();

    // Try to find in invitations collection first (new system)
    const invitationsCollection = db.collection("invitations");
    const invitation = await invitationsCollection.findOne({
      shareCode: code.toUpperCase(),
    });

    if (invitation) {
      // Found an invitation - get the associated event
      const eventsCollection = db.collection("events");
      const event =
        (await eventsCollection.findOne({ _id: invitation.eventId })) ||
        (await eventsCollection.findOne({ id: invitation.eventId }));

      return res.status(200).json({
        type: "invitation",
        invitation: {
          ...invitation,
          id: invitation._id.toString(),
          _id: undefined,
        },
        event: event
          ? {
              ...event,
              id: event._id?.toString() || event.id,
              _id: undefined,
            }
          : null,
      });
    }

    // Fallback: check if it's an event shareCode (legacy system)
    const eventsCollection = db.collection("events");
    const event = await eventsCollection.findOne({
      shareCode: code.toUpperCase(),
    });

    if (event) {
      return res.status(200).json({
        type: "event",
        event: {
          ...event,
          id: event._id.toString(),
          _id: undefined,
        },
        invitation: null,
      });
    }

    return res.status(404).json({ error: "Invitation or event not found" });
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
