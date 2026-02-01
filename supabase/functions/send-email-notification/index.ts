import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface MessagePayload {
  type: "INSERT";
  table: "messages";
  record: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
  };
}

interface EmailRequest {
  messageId?: string;
  conversationId?: string;
  emailType?: "new_message" | "price_drop" | "new_listing";
  recipientEmail?: string;
  recipientId?: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const body: EmailRequest = await req.json();
    const { conversationId, emailType = "new_message", recipientId } = body;

    if (!conversationId || !recipientId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check notification preferences
    const { data: prefs, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("email_new_messages")
      .eq("user_id", recipientId)
      .single();

    // If user has disabled email notifications, skip sending
    if (prefs && !prefs.email_new_messages) {
      console.log(`User ${recipientId} has disabled email notifications`);
      return new Response(
        JSON.stringify({ message: "Notifications disabled for user" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch conversation and related data
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select(`
        *,
        product:products(title, price, image)
      `)
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error(`Failed to fetch conversation: ${convError?.message}`);
    }

    // Get recipient's email
    const { data: { user: recipient }, error: recipientError } = await supabase.auth.admin.getUserById(recipientId);

    if (recipientError || !recipient?.email) {
      throw new Error(`Failed to fetch recipient email: ${recipientError?.message}`);
    }

    // Get sender's name
    const senderId = conversation.buyer_id === recipientId ? conversation.seller_id : conversation.buyer_id;
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", senderId)
      .single();

    const { data: { user: sender } } = await supabase.auth.admin.getUserById(senderId);
    const senderName = senderProfile?.full_name || sender?.email?.split("@")[0] || "A user";

    // Prepare email content
    const product = conversation.product as any;
    const productTitle = product?.title || "a product";
    const productPrice = product?.price === 0 ? "FREE" : `$${product?.price.toFixed(2)}`;

    const emailSubject = `New message from ${senderName} about ${productTitle}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e5e5; }
            .product-info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .product-title { font-weight: bold; color: #2D3748; margin-bottom: 5px; }
            .product-price { color: #FF6B35; font-size: 18px; font-weight: bold; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">💬 New Message on Limin Market</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p><strong>${senderName}</strong> sent you a message about:</p>

              <div class="product-info">
                <div class="product-title">${productTitle}</div>
                <div class="product-price">${productPrice}</div>
              </div>

              <p>Log in to your account to read and respond to this message.</p>

              <a href="${SUPABASE_URL.replace('.supabase.co', '')}" class="button">View Message</a>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                You're receiving this email because you have message notifications enabled.
                You can change your notification preferences in your account settings.
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Limin Market. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email send");

      // Log attempt even if API key is missing
      await supabase.from("email_logs").insert({
        user_id: recipientId,
        email_type: emailType,
        status: "failed",
        error_message: "RESEND_API_KEY not configured"
      });

      return new Response(
        JSON.stringify({ warning: "Email API not configured" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Limin Market <notifications@liminmarket.com>",
        to: [recipient.email],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Failed to send email via Resend: ${error}`);
    }

    const emailResult = await resendResponse.json();

    // Log successful email
    await supabase.from("email_logs").insert({
      user_id: recipientId,
      email_type: emailType,
      status: "sent"
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailId: emailResult.id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-email-notification:", error);

    // Log failed email attempt if we have recipient info
    try {
      const body = await req.clone().json();
      if (body.recipientId) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("email_logs").insert({
          user_id: body.recipientId,
          email_type: body.emailType || "new_message",
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
