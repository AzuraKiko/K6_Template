import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const loginTrend = new Trend('login_duration');
const queryTrend = new Trend('lexgpt_query_duration');
const errorRate = new Rate('errors');

// Environment configs
const ENV = __ENV.ENV || 'stg';
const CONFIG = {
  dev: {
    baseUrl: 'https://user-dev.lexcentra.ai',
    email: 'anhtu@novus-fintech.com',
    password: 'Admin@123'
  },
  stg: {
    baseUrl: 'https://user-stg.lexcentra.ai',
    email: 'anhtu@novus-fintech.com',
    password: 'Admin@123'
  },
  prod: {
    baseUrl: 'https://user.lexcentra.ai',
    email: 'anhtu@novus-fintech.com',
    password: 'Admin@123'
  }
}[ENV];

// Scenarios
export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      exec: 'loginAndQuery'
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      exec: 'loginAndQuery'
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '2m', target: 150 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 0 },
      ],
      exec: 'loginAndQuery'
    },
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      preAllocatedVUs: 100,
      timeUnit: '1s',
      stages: [
        { duration: '30s', target: 10 },
        { duration: '10s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 10 },
      ],
      exec: 'loginAndQuery'
    }
  }
};

// Function: login + lexGPT query
export function loginAndQuery() {
  const loginRes = http.post(`${CONFIG.baseUrl}/api/auth/user/login`, JSON.stringify({
    email: CONFIG.email,
    password: CONFIG.password,
    remember_me: true,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  loginTrend.add(loginRes.timings.duration);
  const successLogin = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });
  if (!successLogin) {
    errorRate.add(1);
    return;
  }

  const token = loginRes.json('accessToken') || loginRes.json('token') || '';
  const lexRes = http.post(`${CONFIG.baseUrl}/api/lex-gpt/v3.0`, {
    prompt: 'giao dịch trái phiếu',
    channel_id: 'test-channel',
    vbtt: false,
    group_code: '',
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  queryTrend.add(lexRes.timings.duration);
  check(lexRes, {
    'lexgpt query status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}
