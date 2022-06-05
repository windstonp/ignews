import { Client } from 'faunadb';

export const faunaClient = new Client({
  secret: process.env.FAUNA_DB_KEY
});