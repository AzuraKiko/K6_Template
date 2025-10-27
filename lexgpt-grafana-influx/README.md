# Grafana + InfluxDB Dashboard for k6

This setup provides a local Grafana (port 3000) and InfluxDB (port 8086) to collect and visualize k6 metrics.

📖 **Quick Start Guide**: See [GUIDE.md](GUIDE.md) for complete setup and usage instructions.

🔍 **Environment Variables**: Run `./show-env.sh` to view all configured environment variables.

## Run with Docker Compose

```bash
docker compose up -d
docker compose restart grafana

## Restart stack
cd /Users/azurakiko/K6_Template/lexgpt-grafana-influx
docker compose down
docker compose up -d
docker compose logs -f grafana influxdb

## Send k6 data
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  /Users/azurakiko/K6_Template/lexgpt-grafana-influx/tests/test-scenarios.js

Grafana logs: docker compose logs -f grafana
InfluxDB logs: docker compose logs -f influxdb
```

Wait a minute for services to start. Then open Grafana at http://localhost:3000

- username: admin
- password: Admin@123

InfluxDB:

- URL: http://localhost:8086
- DB: k6
- user: admin
- password: admin123

## Send k6 metrics to InfluxDB

Use the InfluxDB V1 output for k6. Example:

```bash
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 test-scenarios.js --env ENV=stg

cd /Users/azurakiko/K6_Template/lexgpt-grafana-influx
docker compose up -d
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --insecure-skip-tls-verify \
  tests/test-scenarios.js --env ENV=stg
```

Notes:

- The `k6` database is pre-created by InfluxDB env var INFLUXDB_DB=k6.
- Grafana is provisioned with an InfluxDB datasource named 'influxdb-k6' and a sample dashboard located in the Dashboards folder.

## Converting k6 summary-export to HTML

If you prefer to export a JSON summary:

```bash
k6 run --summary-export=summary.json test-scenarios.js --env ENV=stg
# then use k6-to-html or other tools to create HTML reports
```

## Troubleshooting

- If Grafana dashboard panels show 'No data', check that k6 metrics are being written to InfluxDB and that the datasource 'influxdb-k6' is present in Grafana.
- Check logs: docker-compose logs -f influxdb grafana

# Grafana Alerts + Notification Channels

This setup provides automatic provisioning of Slack and Email (SMTP) notification channels for Grafana.
Alert rules should be created manually in the Grafana UI using the example queries provided.

## Steps to use

1. Start Grafana + InfluxDB (see previous docker-compose setup).
2. Edit the file `grafana/provisioning/alerting/contact-points.yaml` and replace empty values:
   - url: "" (Slack webhook URL)
   - addresses: "" (email addresses for SMTP notifications)
3. Create alert rules manually:
   - Open Grafana UI → Alerting → Alert rules → Create new alert rule
   - Select 'influxdb-k6' as datasource
   - Use the example queries below as templates
   - Set appropriate thresholds (e.g., P95 > 2000ms, Error rate > 2%)
   - Configure notification channels (Slack/SMTP) and routing

## Example k6 -> Influx mapping (queries used in the examples)

- P95: `SELECT percentile("value",95) FROM "http_req_duration" WHERE $timeFilter`
- Error rate: `SELECT mean("value") FROM "http_req_failed" WHERE $timeFilter`

## Notes

- Notification channels are configured via Grafana provisioning (contact-points.yaml) for automatic setup.
- Alert rules should be created manually in Grafana UI for better control and environment-specific tuning.
- For production, use API keys or secure credentials instead of basic auth (admin/admin).

  cd /Users/azurakiko/K6_Template/lexgpt-grafana-influx
  k6 run --env ENV=stg --env INSECURE=true tests/test-scenarios.js

  ````
  - With InfluxDB output:
  ```bash
  cd /Users/azurakiko/K6_Template/lexgpt-grafana-influx
  docker compose up -d
  k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
    --env ENV=stg --env INSECURE=true tests/test-scenarios.js
  ````

- Optional overrides (no code edits needed):

  - `BASE_URL=https://user-stg.lexcentra.ai`
  - `EMAIL=...`
  - `PASSWORD=...`

- Expect to see occasional console logs like:

  - `Login failed: status=xxx duration_ms=... url=...`
  - `Response body (truncated): ...`
    Use these to pinpoint whether it’s a 4xx (credentials/endpoint), 5xx (server), or TLS/network issue.

- If your API requires a different path, set `BASE_URL` accordingly; we currently hit `/api/auth/user/login`.

- To verify quickly with a single request:

  ```bash
  k6 run --vus 1 --duration 2s --env ENV=stg --env INSECURE=true tests/test-scenarios.js
  ```

- If it’s a 401/403 with a JSON error, share the logged snippet and I’ll update the payload/endpoint.

- Changes made:

  - `tests/test-scenarios.js`: added `insecureSkipTLSVerify`, `BASE_URL/EMAIL/PASSWORD` env overrides, 30s request timeout, and sampled error logs.

- Impact:

  - Easier diagnosis of 100% login failures.
  - Flexibility to test other envs/credentials without editing code.

  k6 run --vus 1 --duration 2s --env ENV=stg --env INSECURE=true tests/test-scenarios.js

## 🌐 Environments

| ENV  | Base URL                      |
| ---- | ----------------------------- |
| dev  | https://user-dev.lexcentra.ai |
| stg  | https://user-stg.lexcentra.ai |
| prod | https://user.lexcentra.ai     |

## 🚀 Run test

```bash
k6 run test-scenarios.js --env ENV=stg
```

## 📊 Generate report

```bash
k6 run --out json=results.json test-scenarios.js --env ENV=stg
k6-reporter results.json report.html
```

## Copy env.example to create .env

cp lexgpt-grafana-influx/.env.example lexgpt-grafana-influx/.env
