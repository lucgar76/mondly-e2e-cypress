import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: 'https://app.mondly.com',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    
    // Pass environment variables to Cypress
    // These come from your .env file
    env: {
      userEmail: process.env.CYPRESS_USER_EMAIL,
      userPassword: process.env.CYPRESS_USER_PASSWORD,
    },
    
    // Recommended settings
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    // Mondly's load event waits on third-party scripts and sometimes the
    // first request to the live site times out.
    pageLoadTimeout: 90000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});
