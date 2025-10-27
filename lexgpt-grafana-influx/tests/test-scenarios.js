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
  // dev: {
  //   baseUrl: 'https://user-dev.lexcentra.ai',
  //   email: 'anhtu@novus-fintech.com',
  //   password: 'Admin@123'
  // },
  stg: {
    baseUrl: 'https://user-stg.lexcentra.ai',
    email: 'anhtu@novus-fintech.com',
    password: 'Admin@1234'
  },
  // prod: {
  //   baseUrl: 'https://user.lexcentra.ai',
  //   email: 'anhtu@novus-fintech.com',
  //   password: 'Admin@123'
  // }
}[ENV];

// Scenarios
export const options = {
  // Allow opting out via env: INSECURE=false
  insecureSkipTLSVerify: (__ENV.INSECURE || 'true') === 'true',
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
        { duration: '1m', target: 10 },
        { duration: '3m', target: 20 },
        { duration: '2m', target: 0 },
      ],
      exec: 'loginAndQuery'
    },
    // stress: {
    //   executor: 'ramping-vus',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '2m', target: 50 },
    //     { duration: '2m', target: 150 },
    //     { duration: '2m', target: 300 },
    //     { duration: '2m', target: 0 },
    //   ],
    //   exec: 'loginAndQuery'
    // },
    // spike: {
    //   executor: 'ramping-arrival-rate',
    //   startRate: 10,
    //   preAllocatedVUs: 100,
    //   timeUnit: '1s',
    //   stages: [
    //     { duration: '30s', target: 10 },
    //     { duration: '10s', target: 200 },
    //     { duration: '1m', target: 200 },
    //     { duration: '30s', target: 10 },
    //   ],
    //   exec: 'loginAndQuery'
    // }
  }
};

// Function: login + lexGPT query
export function loginAndQuery() {
  const baseUrl = __ENV.BASE_URL || CONFIG.baseUrl;
  const email = __ENV.EMAIL || CONFIG.email;
  const password = __ENV.PASSWORD || CONFIG.password;

  const loginRes = http.post(`${baseUrl}/api/auth/user/login`, JSON.stringify({
    email: email,
    password: password,
    remember_me: true,
    is_lex: false,
    isHasNews: false,
    loggedIn: true,
    isClient: true
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s'
  });

  loginTrend.add(loginRes.timings.duration);
  const successLogin = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });
  if (!successLogin) {
    errorRate.add(1);
    return;
  }

  const responseBody = loginRes.json();
  const token = responseBody.data?.token || '';
  const refreshToken = responseBody.data?.refresh_token || '';

  // const lexRes = http.post(`${CONFIG.baseUrl}/api/lex-gpt/v3.0`, {
  //   prompt: 'giao dịch trái phiếu',
  //   channel_id: '81c2df088abc4849ef7f98e7121b08fd_1761466821200',
  //   vbtt: 'false',
  //   group_code: '',
  // }, {
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'X-Request-Id': 'test-request-' + Math.random().toString(36).slice(2, 11),
  //     'device_id': 'test-device-' + Math.random().toString(36).slice(2, 11),
  //     'locale': 'vi',
  //   },
  // });

  // queryTrend.add(lexRes.timings.duration);
  // check(lexRes, {
  //   'lexgpt query status is 200': (r) => r.status === 200,
  // }) || errorRate.add(1);

  sleep(1);
}

export default function () {
  loginAndQuery();
}
