#!/bin/bash

# Deploy MinTid Edge Functions
# This script deploys all Edge Functions to your Supabase project

PROJECT_REF="vcjmwgbjbllkkivrkvq"

echo "🚀 Deploying MinTid Edge Functions"
echo "=================================="
echo "Project: $PROJECT_REF"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "📦 Available Functions:"
echo "• schedule-reminder - Send schedule reminders to employees"
echo "• generate-report - Generate work hour reports"
echo "• send-notification - Send email/SMS/push notifications"
echo ""

# Deploy each function
echo "🚀 Deploying functions..."

echo "📅 Deploying schedule-reminder..."
supabase functions deploy schedule-reminder --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo "✅ schedule-reminder deployed successfully"
else
    echo "❌ Failed to deploy schedule-reminder"
fi

echo ""
echo "📊 Deploying generate-report..."
supabase functions deploy generate-report --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo "✅ generate-report deployed successfully"
else
    echo "❌ Failed to deploy generate-report"
fi

echo ""
echo "📧 Deploying send-notification..."
supabase functions deploy send-notification --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo "✅ send-notification deployed successfully"
else
    echo "❌ Failed to deploy send-notification"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📖 Function URLs:"
echo "• Schedule Reminder: https://$PROJECT_REF.supabase.co/functions/v1/schedule-reminder"
echo "• Generate Report: https://$PROJECT_REF.supabase.co/functions/v1/generate-report"
echo "• Send Notification: https://$PROJECT_REF.supabase.co/functions/v1/send-notification"
echo ""
echo "🔑 Use your Supabase anon key in the Authorization header:"
echo "   Authorization: Bearer YOUR_ANON_KEY"
echo ""
echo "💡 Example Usage:"
echo ""
echo "# Send a schedule reminder"
echo "curl -L -X POST 'https://$PROJECT_REF.supabase.co/functions/v1/schedule-reminder' \\"
echo "  -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  --data '{\"days_ahead\": 1}'"
echo ""
echo "# Generate a weekly report"
echo "curl -L -X POST 'https://$PROJECT_REF.supabase.co/functions/v1/generate-report' \\"
echo "  -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  --data '{\"report_type\": \"weekly\"}'"
echo ""
echo "# Send a notification"
echo "curl -L -X POST 'https://$PROJECT_REF.supabase.co/functions/v1/send-notification' \\"
echo "  -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  --data '{\"type\": \"email\", \"recipient\": \"user@example.com\", \"message\": \"Hello from MinTid!\"}'"
