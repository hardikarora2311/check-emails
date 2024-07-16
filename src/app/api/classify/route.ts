import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emails, openaiKey } = body;

  if (!emails || !openaiKey) {
    return NextResponse.json(
      { error: "Missing email or OpenAI key" },
      { status: 400 }
    );
  }

  const model = new ChatOpenAI({
    apiKey: openaiKey,
    temperature: 0,
    model: "gpt-3.5-turbo",
  });

  const template = `Classify the following email into one of these categories: important, promotional, social, marketing, or spam.
  
Important: Emails that are personal or work-related and require immediate attention.
Promotions: Emails related to sales, discounts, and marketing campaigns.
Social: Emails from social networks, friends, and family.
Marketing: Emails related to marketing, newsletters, and notifications.
Spam: Unwanted or unsolicited emails.
General: If none of the above are matched, use General


Email:
Subject: {subject}
From: {from}
Body: {body}

Classification:`;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(model);

  try {
    const results = await Promise.all(
      emails.map(async (email: any) => {
        const result = await chain.invoke({
          subject:
            email.payload.headers.find((h: any) => h.name === "Subject")
              ?.value || "No subject",
          from:
            email.payload.headers.find((h: any) => h.name === "From")?.value ||
            "Unknown",
          body: email.snippet,
        });
        return {
          id: email.id,
          classification: result.text.trim(), 
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error classifying email:", error);
    return NextResponse.json(
      { error: "Error classifying email" },
      { status: 500 }
    );
  }
}
