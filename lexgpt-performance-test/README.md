# LexGPT Performance Test (k6)

## 🌐 Environments
| ENV | Base URL |
|-----|-----------|
| dev | https://user-dev.lexcentra.ai |
| stg | https://user-stg.lexcentra.ai |
| prod | https://user.lexcentra.ai |

## 🚀 Run test
```bash
k6 run test-script.js --env ENV=stg
```

## 📊 Generate report
```bash
k6 run --out json=results.json test-script.js --env ENV=stg
k6-reporter results.json report.html
```
