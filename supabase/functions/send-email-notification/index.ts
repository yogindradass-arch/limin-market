import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface EmailPayload {
  to: string;
  type: 'new_message' | 'price_drop' | 'new_listing';
  data: {
    productTitle?: string;
    productId?: string;
    senderName?: string;
    oldPrice?: number;
    newPrice?: number;
    searchName?: string;
    category?: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(payload: EmailPayload) {
  const { to, type, data } = payload;

  let subject = '';
  let htmlContent = '';

  // Generate email content based on type
  switch (type) {
    case 'new_message':
      subject = `New message about ${data.productTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0EA5E9 0%, #F97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message</h1>
            </div>
            <div class="content">
              <p>Hi!</p>
              <p><strong>${data.senderName || 'Someone'}</strong> sent you a message about your listing:</p>
              <h3>${data.productTitle}</h3>
              <p>Click the button below to view and respond to the message:</p>
              <a href="${SUPABASE_URL.replace(/\/$/, '')}" class="button">View Message</a>
            </div>
            <div class="footer">
              <p>You're receiving this email because you have message notifications enabled.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case 'price_drop':
      const savings = data.oldPrice && data.newPrice ? data.oldPrice - data.newPrice : 0;
      const savingsPercent = data.oldPrice ? Math.round((savings / data.oldPrice) * 100) : 0;
      subject = `💰 Price Drop Alert: ${data.productTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .price-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
            .new-price { color: #10B981; font-size: 32px; font-weight: bold; }
            .savings { color: #059669; font-size: 16px; font-weight: bold; margin-top: 10px; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Price Drop Alert!</h1>
            </div>
            <div class="content">
              <p>Good news! A product you favorited just dropped in price:</p>
              <h3>${data.productTitle}</h3>
              <div class="price-box">
                <div class="old-price">Was: $${data.oldPrice?.toFixed(2)}</div>
                <div class="new-price">Now: $${data.newPrice?.toFixed(2)}</div>
                <div class="savings">Save $${savings.toFixed(2)} (${savingsPercent}% off)!</div>
              </div>
              <p style="text-align: center;">Don't miss out on this deal!</p>
              <div style="text-align: center;">
                <a href="${SUPABASE_URL.replace(/\/$/, '')}" class="button">View Product</a>
              </div>
            </div>
            <div class="footer">
              <p>You're receiving this email because you favorited this product.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case 'new_listing':
      subject = `🔔 New listing matches your search: ${data.searchName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .search-badge { display: inline-block; background: #8B5CF6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
            .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Listing Alert</h1>
            </div>
            <div class="content">
              <p>Great news! A new listing matches your saved search:</p>
              <div class="search-badge">${data.searchName}</div>
              <h3>${data.productTitle}</h3>
              ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
              <p>Check it out before it's gone!</p>
              <div style="text-align: center;">
                <a href="${SUPABASE_URL.replace(/\/$/, '')}" class="button">View Listing</a>
              </div>
            </div>
            <div class="footer">
              <p>You're receiving this email because of your saved search preferences.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;
  }

  // Send email via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Limin Market <notifications@liminmarket.com>',
      to: [to],
      subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check user's notification preferences
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', payload.to)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      throw prefError;
    }

    // Check if user has this notification type enabled
    const prefKey = `email_${payload.type.replace('_', '_')}s` as keyof typeof preferences;
    if (preferences && !preferences[prefKey]) {
      return new Response(
        JSON.stringify({ message: 'User has disabled this notification type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Send the email
    const result = await sendEmail(payload);

    // Log the email in email_logs table
    await supabase.from('email_logs').insert({
      user_id: payload.to,
      email_type: payload.type,
      status: 'sent',
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);

    // Log the error in email_logs table
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const payload = await req.json();
      await supabase.from('email_logs').insert({
        user_id: payload.to,
        email_type: payload.type,
        status: 'failed',
        error_message: error.message,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
