import { defineConfig, devices } from '@playwright/test';
import { AUTH_STATE_PATH, DEMO_REMOTE_ROOT, readE2eTarget } from './e2e/env';

const target = readE2eTarget();

const webServers = target.skipWebServer
  ? undefined
  : [
      {
        command: 'pnpm dev',
        url: target.shellBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: '.',
      },
      ...(target.hasDemoRemote
        ? [
            {
              command: 'pnpm dev',
              url: `${target.remoteDevUrl}/mf-manifest.json`,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
              stdout: 'pipe',
              stderr: 'pipe',
              cwd: DEMO_REMOTE_ROOT,
            },
          ]
        : []),
    ];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: webServers,
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
