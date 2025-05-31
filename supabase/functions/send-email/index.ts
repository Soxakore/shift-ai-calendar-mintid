
// Supabase Edge Function for sending emails
// This file uses Deno runtime - TypeScript errors in VS Code are expected and don't affect runtime

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// @ts-ignore - Deno global is available in Edge Function runtime
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'password_reset' | 'backup_codes' | 'security_alert' | 'user_notification';
  to: string;
  data: {
    username?: string;
    resetLink?: string;
    backupCodes?: string[];
    alertMessage?: string;
    notificationMessage?: string;
  };
}

interface EmailTemplateData {
  username?: string;
  resetLink?: string;
  backupCodes?: string[];
  alertMessage?: string;
  notificationMessage?: string;
}

const getEmailTemplate = (type: string, data: EmailTemplateData) => {
  switch (type) {
    case 'password_reset':
      return {
        subject: 'Password Reset - MinTid',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Password Reset Request</h2>
            <p>Hello ${data.username || 'there'},</p>
            <p>You requested a password reset for your MinTid account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The MinTid Team</p>
          </div>
        `
      };
    
    case 'backup_codes':
      return {
        subject: '2FA Backup Codes - MinTid',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Your 2FA Backup Codes</h2>
            <p>Hello ${data.username || 'there'},</p>
            <p>Here are your new 2FA backup codes. Please store them in a safe place:</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Backup Codes:</h3>
              ${data.backupCodes?.map((code: string) => `<p style="font-family: monospace; font-size: 16px; margin: 8px 0; color: #1f2937;">${code}</p>`).join('')}
            </div>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0;"><strong>Important:</strong> Each backup code can only be used once. Store them securely and don't share them with anyone.</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The MinTid Team</p>
          </div>
        `
      };
    
    case 'security_alert':
      return {
        subject: 'Security Alert - MinTid',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🔒 Security Alert</h2>
            <p>Hello ${data.username || 'there'},</p>
            <p>We detected a security event on your MinTid account:</p>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0;">${data.alertMessage}</p>
            </div>
            <p>If this was you, no action is needed. If you didn't perform this action, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Review your account settings</li>
              <li>Contact support if you need assistance</li>
            </ul>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The MinTid Security Team</p>
          </div>
        `
      };
    
    case 'user_notification':
      return {
        subject: 'Notification - MinTid',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">MinTid Notification</h2>
            <p>Hello ${data.username || 'there'},</p>
            <p>${data.notificationMessage}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The MinTid Team</p>
          </div>
        `
      };
    
    default:
      return {
        subject: 'MinTid Notification',
        html: `<p>You have a new notification from MinTid.</p>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Email function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    console.log('Sending email of type:', type, 'to:', to);

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type and to" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const template = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "MinTid <noreply@resend.dev>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
