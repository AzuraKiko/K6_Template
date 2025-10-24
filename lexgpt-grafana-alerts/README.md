
# Grafana Alerts + Notification Channels (placeholders)

This package helps you provision Slack and Email (SMTP) notification channels for Grafana,
and provides example alert rules to import manually or adapt into your Grafana setup.

## Steps to use

1. Start Grafana + InfluxDB (see previous docker-compose setup).
2. Edit the file `grafana/provisioning/notifiers/notifiers.yml` and replace:
   - FILL_ME_SLACK_WEBHOOK
   - FILL_ME_SMTP_HOST
   - FILL_ME_SMTP_USER
   - FILL_ME_SMTP_PASSWORD
   - FILL_ME_FROM_ADDRESS
3. Alternatively, run `create_notification_channels.sh` after replacing FILL_ME values:
   ```bash
   ./create_notification_channels.sh
   ```
   This will call Grafana HTTP API to create notification channels. You may need to install `jq`.

4. Import alert rules:
   - Open Grafana UI → Alerting → Alert rules → Import or create new.
   - Use the queries from `alert_rules_examples.json` as templates. They assume InfluxDB datasource named 'influxdb-k6'.

## Example k6 -> Influx mapping (queries used in the examples)
- P95: `SELECT percentile("value",95) FROM "http_req_duration" WHERE $timeFilter`
- Error rate: `SELECT mean("value") FROM "http_req_failed" WHERE $timeFilter`

## Notes
- The included notifier provisioning file is a placeholder and may require Grafana version compatibility.
- The script uses basic auth (admin/admin). For production, use API keys or secure credentials.
