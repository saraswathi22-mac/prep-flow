import { Resend } from "resend";
import type { Config } from "@netlify/functions";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 },
    );
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "PrepFlow <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to PrepFlow 🎯",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Welcome to PrepFlow${name ? `, ${name}` : ""}! 🎯</h1>

          <p>Your account has been created successfully.</p>

          <p>
            PrepFlow is ready to help you stay organized,
            practice consistently, and track your interview preparation.
          </p>

          <p>
            Happy preparing! 🚀
          </p>

          <p>
            — Team PrepFlow
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return Response.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Welcome email error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
};

export const config: Config = {
  path: "/api/send-welcome-email",
  method: "POST",
};