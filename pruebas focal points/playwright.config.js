module.exports = {

  timeout: 120000,

  testDir: './test',

  use: {

    headless: false,

    viewport: {
      width: 1600,
      height: 1000
    },

    actionTimeout: 20000,

    navigationTimeout: 90000,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure',

    launchOptions: {
      slowMo: 500
    }

  }

};