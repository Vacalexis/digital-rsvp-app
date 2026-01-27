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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid invitation ID" });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("invitations");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    switch (req.method) {
      case "GET": {
        const invitation = await collection.findOne({ _id: objectId });
        if (!invitation) {
          return res.status(404).json({ error: "Invitation not found" });
        }
        return res.status(200).json({
          ...invitation,
          id: invitation._id.toString(),
          _id: undefined,
        });
      }

      case "PUT": {
        const updateData = req.body;
        const now = new Date().toISOString();

        // Remove id from update data (we use _id)
        const { id: _, ...dataToUpdate } = updateData;

        const result = await collection.findOneAndUpdate(
          { _id: objectId },
          { $set: { ...dataToUpdate, updatedAt: now } },
          { returnDocument: "after" },
        );

        if (!result) {
          return res.status(404).json({ error: "Invitation not found" });
        }

        return res.status(200).json({
          ...result,
          id: result._id.toString(),
          _id: undefined,
        });
      }

      case "DELETE": {
        const result = await collection.deleteOne({ _id: objectId });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Invitation not found" });
        }
        return res.status(204).end();
      }

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
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
