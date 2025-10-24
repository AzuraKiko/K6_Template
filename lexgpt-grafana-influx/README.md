
# Grafana + InfluxDB Dashboard for k6

This setup provides a local Grafana (port 3000) and InfluxDB (port 8086) to collect and visualize k6 metrics.

## Run with Docker Compose
```bash
docker-compose up -d
```

Wait a minute for services to start. Then open Grafana at http://localhost:3000
- username: admin
- password: admin

InfluxDB:
- URL: http://localhost:8086
- DB: k6
- user: admin
- password: admin123

## Send k6 metrics to InfluxDB
Use the InfluxDB V1 output for k6. Example:
```bash
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 test-script.js --env ENV=stg
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
