import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_KEY;
const dbName = "ADNz_data";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoDb(): Promise<Db> {
  if (!uri) {
    throw new Error("Missing MONGODB_KEY in environment variables");
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  const mongoClient = await global._mongoClientPromise;
  return mongoClient.db(dbName);
}
