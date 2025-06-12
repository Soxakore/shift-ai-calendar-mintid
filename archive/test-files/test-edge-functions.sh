#!/bin/bash

# Test all deployed Edge Functions for MinTid Smart Work Schedule Calendar
# Run this script to verify all functions are working correctly

echo "🚀 Testing MinTid Edge Functions"
echo "================================="

# Get the Supabase URL and anon key from .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check if we have the required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local"
    exit 1
fi

SUPABASE_URL="$VITE_SUPABASE_URL"
ANON_KEY="$VITE_SUPABASE_ANON_KEY"
FUNCTIONS_URL="${SUPABASE_URL}/functions/v1"

echo "🔗 Testing functions at: $FUNCTIONS_URL"
echo ""

# Test 1: Schedule Reminder Function
echo "📅 Testing schedule-reminder function..."
curl -s -X POST "${FUNCTIONS_URL}/schedule-reminder" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "days_ahead": 1
  }' | jq '.' || echo "Response not in JSON format"

echo ""
echo "---"

# Test 2: Generate Report Function
echo "📊 Testing generate-report function..."
curl -s -X POST "${FUNCTIONS_URL}/generate-report" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "weekly"
  }' | jq '.' || echo "Response not in JSON format"

echo ""
echo "---"

# Test 3: Send Notification Function
echo "📧 Testing send-notification function..."
curl -s -X POST "${FUNCTIONS_URL}/send-notification" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email",
    "recipient": "test@example.com",
    "message": "Test notification from MinTid",
    "template": "schedule_reminder",
    "data": {
      "employee_name": "John Doe",
      "date": "2024-01-15",
      "start_time": "09:00",
      "end_time": "17:00",
      "shift_type": "Morning Shift"
    }
  }' | jq '.' || echo "Response not in JSON format"

echo ""
echo "---"

# Test 4: Presence Notifications Function
echo "👥 Testing presence-notifications function..."
curl -s -X POST "${FUNCTIONS_URL}/presence-notifications" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "team_alert",
    "message": "Team meeting in 10 minutes in Conference Room A",
    "priority": "medium",
    "sender_id": "test-user-id",
    "channels": ["employee_workspace"]
  }' | jq '.' || echo "Response not in JSON format"

echo ""
echo "---"

# Summary
echo ""
echo "✅ All Edge Functions tested!"
echo ""
echo "📋 Available Functions:"
echo "   • schedule-reminder    - Automated shift reminders"
echo "   • generate-report      - Work hour analytics and reporting"
echo "   • send-notification    - Multi-channel notification system"
echo "   • presence-notifications - Presence-aware smart notifications"
echo ""
echo "🌐 Function URLs:"
echo "   • ${FUNCTIONS_URL}/schedule-reminder"
echo "   • ${FUNCTIONS_URL}/generate-report"
echo "   • ${FUNCTIONS_URL}/send-notification"
echo "   • ${FUNCTIONS_URL}/presence-notifications"
echo ""
echo "📖 For detailed documentation, see:"
echo "   • EDGE_FUNCTIONS_GUIDE.md"
echo "   • PRESENCE_GUIDE.md"
