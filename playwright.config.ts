import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';
import {
  AUTH_STATE_PATH,
  DEMO_REMOTE_ROOT,
  readE2eAuth,
  readE2eTarget,
} from './e2e/env';

const target = readE2eTarget();
readE2eAuth(target.shellBaseUrl);

type HostWebServer = Exclude<
  NonNullable<PlaywrightTestConfig['webServer']>,
  unknown[]
>;

function createWebServers(): PlaywrightTestConfig['webServer'] {
  if (target.skipWebServer) {
    return undefined;
  }

  const servers: HostWebServer[] = [
    {
      command: 'pnpm dev',
      url: target.shellBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: '.',
    },
  ];

  if (target.hasDemoRemote) {
    servers.push({
      command: 'pnpm dev',
      url: `${target.remoteDevUrl}/mf-manifest.json`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: DEMO_REMOTE_ROOT,
    });
  }

  return servers;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: createWebServers(),
  use: {
    baseURL: target.shellBaseUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testMatch: /runtime-mf\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],
});
