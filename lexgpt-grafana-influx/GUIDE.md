# 🚀 K6 Load Testing with Grafana & InfluxDB - Complete Guide

## 📋 Tổng quan

Guide này hướng dẫn cách setup và chạy performance testing với k6, lưu metrics vào InfluxDB và visualize/monitor với Grafana alerts.

## 🏗️ Infrastructure Setup

### 1. Start Services

```bash
cd /Users/azurakiko/K6_Template/lexgpt-grafana-influx

# Start InfluxDB + Grafana
docker compose up -d

# Check status
docker compose ps
docker compose logs -f grafana influxdb
```

### 2. Access Points

- **Grafana**: http://localhost:3000 (admin/Admin@123)
- **InfluxDB**: http://localhost:8086 (admin/admin123)

## 🧪 Chạy K6 Tests

### Basic Test Run

```bash
# Smoke test (1 user, 30s)
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  tests/test-scenarios.js

# Load test (10-20 users ramping)
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  tests/test-scenarios.js --tag testid=load-test-001

# Custom parameters
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  --vus 50 --duration 5m \
  tests/test-scenarios.js
```

### Environment Variables

```bash
# Override default configs
export BASE_URL=https://user-stg.lexcentra.ai
export EMAIL=your-email@example.com
export PASSWORD=your-password

# Run with custom config
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  tests/test-scenarios.js
```

## 📊 Grafana Dashboard & Visualization

### 1. Access Dashboard

- Open: http://localhost:3000
- Login: admin / Admin@123
- Navigate: **Home** → **k6 Load Testing Results**

### 2. Available Metrics

- **Response Times**: P50, P95, P99
- **Error Rates**: HTTP error percentages
- **Throughput**: Requests per second
- **Active Users**: Virtual users over time

### 3. Dashboard Features

- Real-time metrics updates
- Time range selection
- Query inspection
- Export capabilities

## 🚨 Setup Alerts & Notifications

### 1. Configure Notification Channels

Edit `grafana/provisioning/alerting/contact-points.yaml`:

```yaml
contactPoints:
  - orgId: 1
    name: "Slack - LexGPT Alerts"
    receivers:
      - uid: "slack-lexgpt"
        type: slack
        settings:
          url: "YOUR_SLACK_WEBHOOK_URL" # Add your Slack webhook
  - orgId: 1
    name: "SMTP - LexGPT Alerts"
    receivers:
      - uid: "smtp-lexgpt"
        type: email
        settings:
          addresses: "alerts@yourcompany.com" # Add email addresses
```

Restart Grafana to apply changes:

```bash
docker compose restart grafana
```

### 2. Create Alert Rules

#### P95 Response Time Alert

1. **Grafana UI** → **Alerting** → **Alert rules** → **Create alert rule**
2. **Rule name**: `High P95 Response Time`
3. **Query**:
   - **Datasource**: `influxdb-k6`
   - **Query**:
     ```
     SELECT percentile("value", 95) FROM "http_req_duration" WHERE $timeFilter
     ```
4. **Conditions**:
   - **Threshold**: `>` `2000` (2 seconds)
   - **For**: `3m` (3 minutes)
5. **Notifications**:
   - Select: `Slack - LexGPT Alerts` và `SMTP - LexGPT Alerts`
6. **Labels**: `severity=warning`, `team=performance`

#### HTTP Error Rate Alert

1. **Rule name**: `High HTTP Error Rate`
2. **Query**:
   ```
   SELECT mean("value") FROM "http_req_failed" WHERE $timeFilter
   ```
3. **Conditions**:
   - **Threshold**: `>` `0.02` (2% error rate)
   - **For**: `3m`
4. **Notifications**: Same as above
5. **Labels**: `severity=critical`, `team=performance`

### 3. Alert Policies (Optional)

Current setup routes all alerts to both Slack and SMTP. To customize:

Edit `grafana/provisioning/alerting/policies.yaml`:

```yaml
policies:
  - orgId: 1
    receiver: "Slack - LexGPT Alerts"
    routes:
      - receiver: "SMTP - LexGPT Alerts"
        matchers:
          - key: severity
            value: critical
    group_by:
      - grafana_folder
      - alertname
```

## 🔍 Monitoring & Troubleshooting

### Check Services Status

```bash
# Container status
docker compose ps

# Logs
docker compose logs -f grafana
docker compose logs -f influxdb

# Check InfluxDB data
curl -G http://localhost:8086/query \
  --data-urlencode "db=k6" \
  --data-urlencode "q=SHOW MEASUREMENTS"
```

### Test Queries in Grafana

1. **Explore** tab → Select `influxdb-k6` datasource
2. Test queries:

   ```
   # Response time percentiles
   SELECT percentile("value", 95) FROM "http_req_duration" WHERE time > now() - 1h

   # Error rate
   SELECT mean("value") FROM "http_req_failed" WHERE time > now() - 1h

   # Request rate
   SELECT count("value") FROM "http_req_duration" WHERE time > now() - 1h GROUP BY time(1m)
   ```

### Alert Debugging

1. **Alerting** → **Alert rules** → Check rule status
2. **Alerting** → **Alert instances** → View active alerts
3. **Explore** → Test alert queries with different time ranges

### Common Issues

#### No Data in Dashboard

```bash
# Check k6 output URL
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 tests/test-scenarios.js --vus 1 --duration 10s

# Verify InfluxDB connection
curl http://localhost:8086/ping
```

#### Alerts Not Firing

- Check query syntax in alert rule
- Verify thresholds are reasonable
- Ensure time range covers data points
- Check datasource connectivity

#### Notifications Not Working

- Verify Slack webhook URL is valid
- Check SMTP settings if using email
- Test webhook manually: `curl -X POST -H 'Content-Type: application/json' -d '{"text":"Test"}' YOUR_WEBHOOK_URL`

## 📈 Advanced Scenarios

### Stress Testing

```bash
# Enable stress scenario in test-scenarios.js
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  --tag testid=stress-test \
  tests/test-scenarios.js
```

### Spike Testing

```bash
# Enable spike scenario
k6 run --out influxdb=http://admin:admin123@localhost:8086/k6 \
  --env ENV=stg --env INSECURE=true \
  --tag testid=spike-test \
  tests/test-scenarios.js
```

### Test Alert Scenarios

Use the provided test script to trigger different alert conditions:

```bash
# Test normal operation (should not trigger alerts)
./test-alerts.sh normal

# Test high response time alerts
./test-alerts.sh rt

# Test error rate alerts
./test-alerts.sh errors

# Run all test scenarios
./test-alerts.sh all

# Show results checking guide
./test-alerts.sh results
```

### Custom Metrics

Add to `test-scenarios.js`:

```javascript
import { Trend, Rate, Counter } from "k6/metrics";

const myTrend = new Trend("custom_response_time");
const myRate = new Rate("custom_success_rate");
const myCounter = new Counter("custom_requests_total");

// In test function
myTrend.add(response.timings.duration);
myRate.add(response.status === 200);
myCounter.add(1);
```

## 🔧 Configuration Files

### Environment Configs

Located in `config/`:

- `dev.env.json` - Development environment
- `stg.env.json` - Staging environment
- `prod.env.json` - Production environment

### Test Data

Located in `data/`:

- `users.csv` - Test user accounts

### Dashboard Template

- `grafana/dashboards/k6-dashboard.json` - Pre-built k6 dashboard

## 🔍 Checking Environment Variables

Use the provided utility script to view all environment variables:

```bash
# View all environment variables
./show-env.sh

# Search for specific variable
./show-env.sh SLACK_WEBHOOK
./show-env.sh BASE_URL
```

## 📋 Quick Start Checklist

- [ ] Docker & Docker Compose installed
- [ ] k6 installed (`brew install k6`)
- [ ] Environment variables configured (`./show-env.sh`)
- [ ] Services started (`docker compose up -d`)
- [ ] Grafana accessible (http://localhost:3000)
- [ ] Notification channels configured
- [ ] Alert rules created
- [ ] Test run successful
- [ ] Dashboard shows metrics
- [ ] Alerts firing correctly

## 🎯 Best Practices

### Alert Configuration

- Set reasonable thresholds based on baseline performance
- Use appropriate time windows (3-5 minutes for stability)
- Label alerts with severity levels
- Test alerts with controlled load

### Test Execution

- Use descriptive tags: `--tag testid=my-test-run`
- Vary load gradually to identify breaking points
- Run tests multiple times for consistency
- Document test scenarios and expected results

### Monitoring

- Monitor both technical metrics and business KPIs
- Set up dashboards for different stakeholder views
- Archive test results for trend analysis
- Establish performance baselines

## 📞 Support

For issues:

1. Check logs: `docker compose logs -f`
2. Verify configurations in provisioning files
3. Test components individually
4. Check Grafana/InfluxDB documentation

## 🔗 Useful Links

- [k6 Documentation](https://k6.io/docs/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)
- [InfluxDB Query Language](https://docs.influxdata.com/influxdb/v1.8/query_language/)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Happy Testing! 🚀**
