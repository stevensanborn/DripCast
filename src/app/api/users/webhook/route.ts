import { db } from '@/db'
import { users } from '@/db/schema'
import { UserJSON } from '@clerk/nextjs/server';
import { verifyWebhook, WebhookEvent } from '@clerk/nextjs/webhooks'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    let evt:WebhookEvent;
    let firstName:string;
    let lastName:string;
    let imageUrl:string;
    let name:string;
    try {
      console.log('webhook received')
         evt = await verifyWebhook(req) 
        console.log('webhook verified',evt)
      
        firstName = (evt.data as UserJSON).first_name!;
        lastName = (evt.data as UserJSON).last_name!;
        imageUrl = (evt.data as UserJSON).image_url!;
        name = `${firstName} ${lastName}`;
     // return new Response('Webhook received', { status: 200 })
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error verifying webhook', { status: 400 })
    }

    try {
          // Do something with payload
      // For this guide, log payload to console
      const { id } = evt.data
      const eventType = evt.type
      console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    const clerkId = id!;

      if (eventType === 'user.created') {
        console.log('user.creating' ,firstName + ' ' + lastName,id,imageUrl)
        const u = {
            clerkId,
            name,
            imageUrl,
        }
        try {
          await db.insert(users).values(u)
          console.log('User inserted successfully')
        } catch (error) {
          console.error('Insert error:', error)
          throw error
        }
      }
       else if (eventType === 'user.updated') {
             await db.update(users).set({
                name: name,
                imageUrl: imageUrl,
            }).where(eq(users.clerkId, clerkId))
        }
        else if (eventType === 'user.deleted') {
            console.log('user.deleting' ,clerkId)  
             await db.delete(users).where(eq(users.clerkId, clerkId))
        }

        return new Response('Webhook received', { status: 200 })

    } catch (err) {
        console.error('Error inserting user:', err)
      return new Response('Error inserting user', { status: 400 })
    }
  }