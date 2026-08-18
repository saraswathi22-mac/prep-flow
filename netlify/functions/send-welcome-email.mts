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

    const displayName = name || "there";
    const prepFlowUrl = process.env.PREPFLOW_URL;

    const { data, error } = await resend.emails.send({
      from: "PrepFlow <onboarding@resend.dev>",
      to: [email],
      subject: "🎯 Welcome to PrepFlow — Let's get you interview ready!",
      html: `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background-color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
        ">
          <div style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
          ">

            <h1 style="
              margin: 0 0 24px;
              font-size: 28px;
              line-height: 1.3;
              color: #0f172a;
            ">
              Welcome to PrepFlow, ${displayName}! 🎯
            </h1>

            <p style="
              margin: 0 0 18px;
              font-size: 16px;
              line-height: 1.7;
              color: #475569;
            ">
              Your account is ready, and you're all set to start building
              a consistent interview-prep routine.
            </p>

            <p style="
              margin: 0 0 12px;
              font-size: 16px;
              line-height: 1.7;
              color: #475569;
            ">
              With PrepFlow, you can:
            </p>

            <ul style="
              margin: 0 0 28px;
              padding-left: 22px;
              color: #475569;
              font-size: 16px;
              line-height: 1.9;
            ">
              <li>Track your daily interview tasks</li>
              <li>Monitor your preparation progress</li>
              <li>Build and maintain your preparation streak</li>
              <li>Stay consistent throughout your interview journey</li>
            </ul>

            ${
              prepFlowUrl
                ? `
                  <div style="text-align: center; margin: 32px 0;">
                    <a
                      href="${prepFlowUrl}"
                      style="
                        display: inline-block;
                        padding: 14px 28px;
                        background-color: #4f46e5;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                      "
                    >
                      Start Preparing 🚀
                    </a>
                  </div>
                `
                : ""
            }

            <p style="
              margin: 28px 0 0;
              font-size: 16px;
              line-height: 1.7;
              color: #475569;
            ">
              Keep learning. Keep growing. Keep going. 🚀
              You've got this! 💪
            </p>

            <p style="
              margin: 28px 0 0;
              font-size: 15px;
              line-height: 1.6;
              color: #64748b;
            ">
              — Team PrepFlow
            </p>

          </div>
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