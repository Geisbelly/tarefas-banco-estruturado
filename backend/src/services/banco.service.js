import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const URL=process.env.URL;
const client = new MongoClient(URL);

async function connectToMongoDB(dbName, collectionName) {
  try {
    await client.connect();
    return client.db(dbName).collection(collectionName);
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    throw err;
  }
}

async function closeMongoDBConnection(){
  if (client) {
    await client.close();
  }
}

export {closeMongoDBConnection, connectToMongoDB}
