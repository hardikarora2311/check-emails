import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "../auth/[...nextauth]/route";
import { Base64 } from "js-base64";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const maxResults = parseInt(searchParams.get("maxResults") || "15");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: maxResults,
    });

    const emails = await Promise.all(
      response.data.messages!.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
        });

        const emailBody = getEmailBody(email.data.payload);
        return { ...email.data, body: emailBody };
      })
    );

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Error fetching emails" },
      { status: 500 }
    );
  }
}
const getEmailBody = (payload: any): string => {
  let body = "";
  if (!payload.parts) {
    body = payload.body.data;
  } else {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        body = part.body.data;
        break;
      } else if (part.mimeType === "text/html") {
        body = part.body.data;
      }
    }
  }
  return Base64.decode(body.replace(/-/g, "+").replace(/_/g, "/"));
};
