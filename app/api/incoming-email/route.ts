import { NextResponse } from "next/server";

export async function POST(request: Request){
    try {
        const formData = await request.formData();

        const sender = formData.get('from') as string;
        const receiver = formData.get('to') as string;
        const subject = formData.get('subject') as string;
        const body = formData.get('text') as string;

        console.log("New Email Received");
        console.log("From:", sender);
        console.log("Subject:", subject);
        console.log("Message:", body);

        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}