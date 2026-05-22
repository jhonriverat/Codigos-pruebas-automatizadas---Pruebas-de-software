import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',

  use: {
    headless: false,
    baseURL: 'https://www.worldmonitor.app',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
})
