
#!/bin/bash
# Script to create Grafana notification channels (Slack + SMTP) via Grafana HTTP API
# Replace FILL_ME_* with real values before running.

GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
USER="admin"
PASS="admin"

# Slack channel payload (Incoming Webhook style)
SLACK_WEBHOOK="FILL_ME_SLACK_WEBHOOK"

curl -s -X POST "${GRAFANA_URL}/api/notification-channels" \
  -u "${USER}:${PASS}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack - LexGPT Alerts",
    "type": "slack",
    "isDefault": false,
    "settings": {
      "url": "'"${SLACK_WEBHOOK}"'"
    }
  }' | jq

# SMTP channel payload (example)
curl -s -X POST "${GRAFANA_URL}/api/notification-channels" \
  -u "${USER}:${PASS}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMTP - LexGPT Alerts",
    "type": "email",
    "isDefault": false,
    "settings": {
      "addresses": "FILL_ME_TARGET_EMAIL@example.com"
    }
  }' | jq

echo "Done. Update FILL_ME values and run this script after Grafana is up."
