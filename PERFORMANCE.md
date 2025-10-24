# Setup k6 Performance Test

## 1. Kiểm tra và cài đặt Homebrew

k6 được phân phối qua Homebrew, vì vậy bạn cần cài đặt Homebrew trước nếu chưa có.

**Kiểm tra Homebrew:**
```bash
brew --version
```

**Cài đặt Homebrew (nếu chưa có):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 2. Cài đặt k6

**Cài đặt k6 qua Homebrew:**
```bash
brew install k6
```

**Kiểm tra phiên bản k6 để đảm bảo cài đặt thành công:**
```bash
k6 version
```

## 3. Chạy thử một script k6 cơ bản

**Tạo file script test.js:**
```bash
touch test.js
```

**Thêm nội dung vào file test.js:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // Số lượng user ảo
  duration: '30s', // Thời gian chạy
};

export default function () {
  let res = http.get('https://test.k6.io');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1); // Nghỉ 1 giây giữa mỗi lần request
}
```

**Chạy script với k6:**
```bash
k6 run test.js
```

## 4. Tích hợp k6 với API testing

**Tạo file script API test:**

**File: api_test.js**

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  let url = 'https://api.example.com/login';
  let payload = JSON.stringify({
    username: 'testuser',
    password: 'testpass',
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response contains token': (r) => JSON.parse(r.body).token !== undefined,
  });
}
```

**Chạy script:**
```bash
k6 run api_test.js
```

# Hướng dẫn cài đặt môi trường Automation Test với Playwright

## 1. Kiểm tra yêu cầu hệ thống

### a. Node.js (Phiên bản >= 16.x)

**Kiểm tra phiên bản Node.js:**
```bash
node -v
```

**Nếu chưa cài đặt Node.js:**

**Cài đặt Homebrew (nếu chưa có):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Cài Node.js qua Homebrew:**
```bash
brew install node
```

## 2. Tạo dự án Playwright

**Tạo thư mục dự án:**
```bash
mkdir playwright-automation
cd playwright-automation
```

**Khởi tạo dự án Node.js:**
```bash
npm init -y
```

**Cài đặt Playwright:**
```bash
npm install -D @playwright/test
```

**Cài đặt các trình duyệt:**
```bash
npx playwright install
```

## 3. Viết testcase cơ bản

**Tạo cấu trúc thư mục:**
```bash
mkdir tests
```

**Tạo file test:**

**File: tests/example.test.js**

```javascript
import { test, expect } from '@playwright/test';

test('Kiểm tra tiêu đề trang', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```

**Chạy testcase:**
```bash
npx playwright test
```

## 4. Cấu hình Playwright (Tùy chọn)

**Tạo file cấu hình playwright.config.js:**
```bash
touch playwright.config.js
```

**Thêm cấu hình cơ bản:**

**File: playwright.config.js**

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    headless: false, // Chạy ở chế độ giao diện để kiểm tra
    baseURL: 'https://example.com',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
});
```

## 5. Báo cáo kết quả

**Chạy test và tạo báo cáo:**
```bash
npx playwright test --reporter=html
```

**Mở báo cáo trên trình duyệt:**
```bash
npx playwright show-report
```

## 6. Một số lệnh hữu ích

### a. Chạy test với trình duyệt cụ thể:

**Chromium:**
```bash
npx playwright test --project=chromium
```

**WebKit (Safari):**
```bash
npx playwright test --project=webkit
```

**Firefox:**
```bash
npx playwright test --project=firefox
```

### b. Chạy test trong chế độ không giao diện (headless):
```bash
npx playwright test --headed=false
```

### c. Chạy một test cụ thể:
```bash
npx playwright test tests/example.test.js
```

## 7. Debug Testcase

**Chạy test ở chế độ debug:**
```bash
npx playwright test --debug
```

**Ghi lại thao tác để tạo testcase:**
```bash
npx playwright codegen https://example.com
```

## 8. Xử lý lỗi phổ biến

### a. Lỗi quyền hạn trên macOS:
Nếu gặp lỗi EACCES, sử dụng lệnh sau để sửa:
```bash
sudo chmod -R 755 /usr/local/lib/node_modules
```

### b. Không thể cài đặt trình duyệt:

**Kiểm tra quyền thư mục:**
```bash
sudo chown -R $(whoami) ~/.cache/ms-playwright
```

**Chạy lại lệnh:**
```bash
npx playwright install
```

## 9. Kết nối với CI/CD (Tùy chọn)

GitHub Actions hoặc Jenkins có thể tự động hóa việc chạy test.

**Ví dụ: Cấu hình GitHub Actions:**

```yaml
name: Playwright Tests

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install dependencies
        run: npm install

      - name: Run Playwright tests
        run: npx playwright test
```
