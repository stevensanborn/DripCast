import 'dotenv/config';
import { users } from './db/schema';


import { drizzle } from 'drizzle-orm/neon-http';
// console.log(process.env.DATABASE_URL)
export  const db = drizzle(process.env.DATABASE_URL!);
// console.log(db)


async function main(){
    const result = await db.select().from(users);
    console.log(result);
}

main();