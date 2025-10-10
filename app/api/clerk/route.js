import { messageInRaw, Webhook } from "svix";                            //  Import Webhook tool to verify incoming webhooks
import connectDB from '../../..//config/db'                
import User from '../../../models/User'                 
import headers from 'next/headers'                          
import { NextRequest } from "next/server";

export async function POST(req) {                           //  Function runs when POST request is received
    const wh = new Webhook(process.env.SIGNING_SECRET);     //  Create webhook object with secret key for security

    const headerPayload = await headers();                  //  Get headers from request
    const svixHeaders = {                                   //  Prepare svix security headers
        "svix-id": headerPayload.get("svix-id"),            //  Unique webhook ID
      "svix-timestamps": headerPayload.get("svix-timestamps"),
        "svix-signature": headerPayload.get("svix-signature") //  Signature to verify source
    };

    const payload = await req.json();                       //  Get body (data) from request
    const body = JSON.stringify(payload);                   // Convert body to string
    const { data, type } = wh.verify(body, svixHeaders);    //  Verify webhook is real and extract data

    const userData = {                                     
        _id: data.id,                                     
        email: data.email_address[0].email_address,         
        name: `${data.first_name} ${data.last_name}`,        
        image: data.image_url,                              
    };

    await connectDB();                                      // 🌐 Connect to MongoDB before saving user

    switch(type) {
        case 'user.created':
            await User.create(userData)
            break;

        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData)
            break;

        case 'user.deleted':
            await User.findOneAndDelete(data.id)
            break;

        default:
            break;
    }

    return NextRequest.json({message: "Event received"})
}
