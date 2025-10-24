#!/bin/bash
# Import alert rules into Grafana via HTTP API (Grafana v10.x)
# Usage: GRAFANA_URL=http://localhost:3000 ./import_alert_rules.sh
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
USER="${USER:-admin}"
PASS="${PASS:-admin}"

PAYLOAD_FILE="${PAYLOAD_FILE:-alert_rules_payload.json}"

if [ ! -f "${PAYLOAD_FILE}" ]; then
  echo "Payload file ${PAYLOAD_FILE} not found!"
  exit 1
fi

echo "Reading payload from ${PAYLOAD_FILE} ..."
# This script posts a simple rule representation; Grafana's exact alerting API requires a detailed rule object.
# You may need to adapt the payload to match your Grafana version and alerting type (grafana v10 alerting -> /api/ruler/* endpoints).
# Here we POST to /api/ruler/alert-rules/import as a convenience wrapper for some Grafana setups.
curl -s -X POST "${GRAFANA_URL}/api/ruler/alert-rules/import" \
  -u "${USER}:${PASS}" \
  -H "Content-Type: application/json" \
  -d @"${PAYLOAD_FILE}" | jq '.'

echo "Import attempt completed. If Grafana rejects the payload, open README to adapt the payload to your Grafana version."
