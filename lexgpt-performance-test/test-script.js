import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';

const ENV = __ENV.ENV || 'stg';
const config = JSON.parse(open(`./config/${ENV}.env.json`));
const BASE_URL = config.BASE_URL;
const LOGIN_URL = `${BASE_URL}${config.LOGIN_ENDPOINT}`;
const GPT_URL = `${BASE_URL}${config.LEXGPT_ENDPOINT}`;

const users = new SharedArray('users', function () {
  return open('./data/users.csv')
    .split('\n')
    .slice(1)
    .map(line => {
      const [email, password] = line.split(',');
      return { email, password };
    });
});

export const options = {
  stages: [
    { duration: '20s', target: 10 },  // Faster ramp-up
    { duration: '40s', target: 30 },  // Reach higher load faster
    { duration: '1m', target: 50 },   // Shorter time at peak load
    { duration: '20s', target: 0 },   // Faster ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000', 'p(90)<5000'], // 95th percentile < 10s, 90th percentile < 5s
    http_req_failed: ['rate<0.1'],     // 10% error rate (much better than current 50%)
  },
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  const email = user.email || config.DEFAULT_EMAIL;
  const password = user.password || config.DEFAULT_PASSWORD;

  group('Login API', () => {
    const loginPayload = JSON.stringify({
      email,
      password,
      remember_me: true,
      is_lex: false,
      isHasNews: false,
      loggedIn: true,
      isClient: true,
    });

    const loginRes = http.post(LOGIN_URL, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      insecureSkipTLSVerify: true, // Skip TLS verification for staging
    });

    check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'token returned': (r) => r.json('token') !== '',
    });

    if (loginRes.status !== 200) {
      console.error(`❌ Login failed for ${email}`);
      return;
    }

    const token = loginRes.json('accessToken') || loginRes.json('token');
    if (!token) {
      console.error('❌ No token found in login response');
      return;
    }

    sleep(1);

    group('LexGPT Query', () => {
      const payload = {
        prompt: 'giao dịch trái phiếu',
        channel_id: 'test-channel',
        vbtt: false,
        group_code: '',
      };

      const res = http.post(GPT_URL, JSON.stringify(payload), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        insecureSkipTLSVerify: true, // Skip TLS verification for staging
      });

      const lexGptSuccess = check(res, {
        'LexGPT status 200': (r) => r.status === 200,
      });

      if (!lexGptSuccess) {
        console.error(`❌ LexGPT query failed: ${res.status} - ${res.body}`);
      }

      sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
    });
  });
}
