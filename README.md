# LexGPT Performance Test (Advanced Version)

This advanced version includes multiple test scenarios and built-in reporting.

## 🚀 Scenarios Included
1. **Smoke Test** - Quick verification of API health (few users, short time)
2. **Load Test** - Simulate normal traffic (e.g., 100 concurrent users for 10 mins)
3. **Stress Test** - Gradually increase load until failure point
4. **Spike Test** - Sudden traffic surge to test system recovery

## ⚙️ How to Run
### Run specific scenario
```bash
k6 run --env ENV=stg test-scenarios.js
```

### Environment Options
- `dev`
- `stg`
- `prod`

### View HTML Report
After running:
```bash
k6 run --summary-export=report.json test-scenarios.js
k6-to-html report.json > report.html
```

### Dependencies
- [k6](https://k6.io/)
- [k6-to-html](https://github.com/MattiSG/k6-to-html) for HTML reports


npm install -g k6-reporter
k6 run --out json=output.json test-script.js
k6-reporter output.json report.html
k6 run --out json=report.json test-scenarios.js
k6-to-html report.json > report.html