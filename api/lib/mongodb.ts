import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env['MONGODB_URI'] || '';

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Only throw error when actually trying to connect, not at module load time
function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI environment variable is not defined'));
  }

  if (process.env['NODE_ENV'] === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(MONGODB_URI, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('digital-rsvp');
}

export default getClientPromise;
