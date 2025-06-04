import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('connect', () => {
  console.log('✅ Conectado ao Redis com sucesso!');
});


await client.connect();

export default client;
