#!/bin/bash
# Create Slack and SMTP notification channels in Grafana (placeholders FILL_ME)
# Usage: GRAFANA_URL=http://localhost:3000 ./create_notification_channels.sh
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
USER="${USER:-admin}"
PASS="${PASS:-admin}"

# Slack
SLACK_WEBHOOK="${SLACK_WEBHOOK:-FILL_ME_SLACK_WEBHOOK}"
curl -s -X POST "${GRAFANA_URL}/api/notification-channels" \
  -u "${USER}:${PASS}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Slack - LexGPT Alerts",
  "type": "slack",
  "isDefault": false,
  "sendReminder": false,
  "settings": {
    "url": "'"${SLACK_WEBHOOK}"'"
  }
}' | jq '.'

# SMTP (email)
TARGET_EMAIL="${TARGET_EMAIL:-FILL_ME_TARGET_EMAIL@example.com}"
curl -s -X POST "${GRAFANA_URL}/api/notification-channels" \
  -u "${USER}:${PASS}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "SMTP - LexGPT Alerts",
  "type": "email",
  "isDefault": false,
  "settings": {
    "addresses": "'"${TARGET_EMAIL}"'"
  }
}' | jq '.'

echo "Created notification channels (placeholders used). Edit values and re-run if necessary."
