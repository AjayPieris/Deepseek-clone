// --- route handler ---
import { Webhook } from "svix";                        // Verify and handle webhook data
import { headers } from "next/headers";                //  Get request headers
import { NextResponse } from "next/server";            //  Send response back
import connectDB from "../../../config/db";            //  Connect to MongoDB
import User from "../../../models/User";               //  Import User model

export async function POST(req) {                      //  Run when a POST webhook is received
    const wh = new Webhook(process.env.SIGNING_SECRET); //  Create Webhook verifier with secret key

    const headerPayload = await headers();              //  Get headers from webhook
    const svixHeaders = {                               //  Collect required security headers
        "svix-id": headerPayload.get("svix-id"),        //  Unique webhook ID
        "svix-timestamp": headerPayload.get("svix-timestamp"), //  Time webhook sent
        "svix-signature": headerPayload.get("svix-signature"), // Signature to verify source
    };

    const payload = await req.json();                   //  Read body (JSON data) from request
    const body = JSON.stringify(payload);               //  Convert to string for verification
    const { data, type } = wh.verify(body, svixHeaders); //  Check if webhook is real and get data

    const userData = {                                  //  Prepare user info to save/update
        _id: data.id,                                   //  User ID
        email: data.email_addresses[0].email_address,   //  User email
        name: `${data.first_name} ${data.last_name}`,   //  Full name
        image: data.image_url,                          //  Profile image (optional)
    };

    await connectDB();                                  //  Connect to MongoDB

    switch (type) {                                     //  Decide what action to take
        case "user.created":                            //  New user event
            await User.create(userData);                //  Add user to DB
            break;

        case "user.updated":                            //  Update event
            await User.findByIdAndUpdate(data.id, userData); //  Update user info
            break;

        case "user.deleted":                            //  Delete event
            await User.findOneAndDelete({ _id: data.id });   //  Remove user from DB
            break;

        default:                                        //  Unknown event
            break;
    }

    return NextResponse.json({ message: "Event received" }); //  Send success response
}
