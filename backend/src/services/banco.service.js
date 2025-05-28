import { MongoClient, ObjectId, Collection } from 'mongodb';
const URL="mongodb+srv://mariantoniaalves:jWRgwkcdB34OZFLg@lista-tarefas-cluster.ohabi48.mongodb.net/?retryWrites=true&w=majority&appName=lista-tarefas-cluster"
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
