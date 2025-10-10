// --- route handler ---
import { Webhook } from "svix";                      // ✅ Only import Webhook
import { headers } from "next/headers";              // ✅ Correct import
import { NextResponse } from "next/server";          // ✅ Use for sending responses
import connectDB from "../../../config/db";
import User from "../../../models/User";

export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET);

    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-timestamp": headerPayload.get("svix-timestamp"), // ✅ correct spelling
        "svix-signature": headerPayload.get("svix-signature"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address, // ✅ note plural "email_addresses"
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
    };

    await connectDB();

    switch (type) {
        case "user.created":
            await User.create(userData);
            break;
        case "user.updated":
            await User.findByIdAndUpdate(data.id, userData);
            break;
        case "user.deleted":
            await User.findOneAndDelete({ _id: data.id });
            break;
        default:
            break;
    }

    return NextResponse.json({ message: "Event received" });
}
