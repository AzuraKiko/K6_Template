# LexGPT Grafana Alerts - Pro (Auto import + Slack/Email templates)

## Overview
This package helps you:
- Create Grafana notification channels (Slack + SMTP) via `create_notification_channels.sh` (placeholders present)
- Import example alert rules via `import_alert_rules.sh` (Grafana v10.x compatible attempt)
- Slack message template located at `templates/alert_slack.json` (block format, placeholder values)
- Alert rules payload template at `alert_rules_payload.json` (edit thresholds, queries, env placeholders)

## Quick start
1. Ensure Grafana is running and accessible (default http://localhost:3000)
2. Edit `create_notification_channels.sh` or set env vars:
   - SLACK_WEBHOOK
   - TARGET_EMAIL
   - GRAFANA_URL, USER, PASS if different
3. Run to create channels:
   ```bash
   GRAFANA_URL=http://localhost:3000 SLACK_WEBHOOK=FILL_ME_SLACK_WEBHOOK TARGET_EMAIL=you@example.com ./create_notification_channels.sh
   ```
4. Import alert rules (may need adapting for your Grafana):
   ```bash
   GRAFANA_URL=http://localhost:3000 USER=admin PASS=admin ./import_alert_rules.sh
   ```
5. Customize `templates/alert_slack.json` and the messages in `alert_rules_payload.json` to include real dashboard URL (replace FILL_ME_DASHBOARD_URL).

## Notes on Grafana API
- Grafana alerting API payloads vary across versions. The import script posts to `/api/ruler/alert-rules/import` which works for some Grafana distributions; if it fails, check Grafana docs for your version and adapt the payload format accordingly.
- For production use, prefer API keys instead of basic auth.

