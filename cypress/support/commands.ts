/// <reference types="cypress" />

declare global {
    namespace Cypress {
      interface Chainable {
        openMondly(): Chainable<void>;
        selectMotherLanguage(language: string): Chainable<void>;
        selectTargetLanguage(language: string): Chainable<void>;
        selectLevel(level: string): Chainable<void>;
        goToLogin(): Chainable<void>;
        enterCredentials(email: string, password: string): Chainable<void>;
        submitLogin(): Chainable<void>;
        acceptCookies(): Chainable<void>;
        verifyCategories(): Chainable<void>;
        completeOnboardingAndLogin(email: string, password: string): Chainable<void>;
      }
    }
  }
  
  const exactOption = (language: string): RegExp => {
    const escaped = language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^\\s*${escaped}\\s*$`);
  };

  /**
   * Open a Mondly dropdown and choose an option.
   *
   * The menu ignores selection while its 250ms open animation is running.
   * A click during that window updates the label but leaves the list open.
   */
  const selectFromDropdown = (root: string, language: string) => {
    cy.get(`${root} .selected-item`, { timeout: 20000 }).should('be.visible').click();
    cy.get(`${root} .options li`, { timeout: 10000 }).should('be.visible');
    cy.wait(400);

    cy.contains(`${root} .options li`, exactOption(language))
      .scrollIntoView()
      .click();

    cy.get(`${root} .options li`).should('not.exist');
    cy.get(`${root} .selected-item`).should('be.visible').and('contain', language);
  };

  Cypress.Commands.add('openMondly', () => {
    cy.visit('/', { timeout: 90000 });
    cy.get('.mother-dropdown', { timeout: 30000 }).should('be.visible');
  });

  Cypress.Commands.add('selectMotherLanguage', (language: string) => {
    // Mother-language names are native names (Español, English, Français).
    selectFromDropdown('.mother-dropdown', language);
  });
  
  /**
   * Select Target Language (I Want to Learn)
   * 
   * This command changes the "I want to learn" language dropdown.
   * Initially shows "Seleccionar" (Select in Spanish) after mother language is set.
   * 
   * @param language - The language you want to learn (e.g., 'French', 'Italian', 'German')
   * 
   * How it works:
   * 1. Opens the target-language dropdown
   * 2. Waits until the open animation finishes
   * 3. Clicks the language option, which closes the menu
   */
  Cypress.Commands.add('selectTargetLanguage', (language: string) => {
    // Target-language names stay in English (French, German) after the UI
    // switches to the mother language.
    selectFromDropdown('.target-dropdown', language);
  });
  
  /**
   * Select Learning Level
   * 
   * This command selects your language learning level.
   * Options typically include: Beginner (Principiante), Intermediate (Intermedio), Advanced (Avanzado)
   * 
   * @param level - The level to select (e.g., 'Intermedio', 'Principiante', 'Avanzado')
   * 
   * How it works:
   * 1. Waits for animations/dropdowns to close
   * 2. Scrolls to the level selection area
   * 3. Finds the tab containing the level text
   * 4. Clicks on the clickable tab element (not the text)
   * 
   * The interface has clickable tabs that control the level selection.
   */
  Cypress.Commands.add('selectLevel', (level: string) => {
    const levelIndex: { [key: string]: number } = {
      Principiante: 0,
      Intermedio: 1,
      Avanzado: 2,
    };

    const index = levelIndex[level];
    if (index === undefined) {
      throw new Error(`Unknown Mondly level "${level}"`);
    }

    // Clickable tabs are direct children. The visible labels live in
    // .tab-text and do not receive the select action.
    cy.get('.sliding-navigation.difficulty .tabs-inner > .tab', { timeout: 15000 })
      .eq(index)
      .click({ force: true });

    cy.contains('.sliding-navigation.difficulty .tab-text.selected', level, { timeout: 10000 })
      .should('be.visible');
  });
  
  /**
   * Navigate to Login Page
   * 
   * Clicks the "Iniciar sesión" (Log in) link to navigate to the login form.
   * This link appears at the bottom of the modal after completing the language selection steps.
   * 
   * Note: There are two separate links - "Iniciar sesión" and "Registrarte" separated by "/"
   * We click on "Iniciar sesión" to go to the login page.
   */
  Cypress.Commands.add('goToLogin', () => {
    // The first link is login and the second is sign up. The labels change
    // with the mother language ("Log in" / "Iniciar sesión").
    cy.get('.connect a', { timeout: 10000 })
      .first()
      .should('be.visible')
      .scrollIntoView()
      .click();
  });
  
  /**
   * Enter Login Credentials
   * 
   * Fills in the email and password fields on the login form.
   * 
   * @param email - User's email address (from environment variable)
   * @param password - User's password (from environment variable)
   * 
   * SECURITY NOTE: 
   * - Credentials should NEVER be hardcoded in test files
   * - Always use environment variables: Cypress.env('userEmail')
   * - Password typing uses { log: false } to hide it from the Cypress log
   * 
   * How it works:
   * 1. Finds the email input field using multiple selectors (handles different input types)
   * 2. Types the email address
   * 3. Finds the password field
   * 4. Types the password (without logging it for security)
   */
  Cypress.Commands.add('enterCredentials', (email: string, password: string) => {
    // Find the email input field
    // We try multiple selectors because Mondly might use different input types
    // .first() gets the first visible input if multiple exist
    cy.get('input[type="email"], input[type="text"], input[name="username"], input[name="email"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .type(email);
    
    // Find and fill the password field
    // { log: false } prevents the password from appearing in Cypress logs (security!)
    cy.get('input[type="password"]')
      .should('be.visible')
      .type(password, { log: false });
  });
  
  /**
   * Submit Login Form
   * 
   * Clicks the "Log in" button to submit the login form.
   * Uses the submit button to trigger the login action.
   * 
   * Note: The button text is "Iniciar sesión" (Log in in Spanish)
   */
  Cypress.Commands.add('submitLogin', () => {
    // Find and click the submit button
    // We look for a button with type="submit"
    cy.get('button[type="submit"]').click();
  });
  
  /**
   * Accept Cookies Banner
   * 
   * Handles the cookie consent banner if it appears.
   * Not all users see this banner, so we check if it exists first.
   * 
   * How it works:
   * 1. Check if the cookie accept button exists on the page
   * 2. If it exists, click it
   * 3. If it doesn't exist, do nothing (no error)
   * 
   * This is a defensive approach - the test won't fail if the banner doesn't appear
   */
  Cypress.Commands.add('acceptCookies', () => {
    // Use .then() to check if the element exists before interacting
    cy.get('body').then(($body) => {
      // Look for the cookie accept button using its test ID
      if ($body.find('[data-testid="cookie-accept"]').length > 0) {
        // Button exists, so click it
        cy.get('[data-testid="cookie-accept"]').click({ force: true });
      }
      // If button doesn't exist, do nothing (banner already accepted or not shown)
    });
  });
  
  /**
   * Verify Successful Login
   * 
   * Confirms that the user has successfully logged in by checking:
   * 1. The presence of "Lección Diaria" (Daily Lesson) on the page
   * 2. The URL includes '/home'
   * 
   * This is an ASSERTION - it verifies the expected state after login.
   * If either check fails, the test will fail.
   */
  Cypress.Commands.add('verifyCategories', () => {
    // Check for "Lección Diaria" (Daily Lesson) text - this appears after successful login
    // timeout: 10000 gives it 10 seconds to appear (page might load slowly)
    cy.contains('Lección Diaria', { timeout: 20000 }).should('be.visible');
    
    // Verify the URL changed to the home page
    // .should('include', '/home') checks that the URL contains '/home'
    cy.url().should('include', '/home');
  });
  
  /**
   * Complete Onboarding and Login (All-in-One Command)
   * 
   * This is a convenience command that combines all the steps needed to:
   * - Select language preferences
   * - Navigate to login
   * - Enter credentials
   * - Submit the form
   * - Handle cookies
   * 
   * @param email - User's email address
   * @param password - User's password
   * 
   * This command is useful when you want to quickly get to the logged-in state
   * without writing all the individual steps in your test.
   */
  Cypress.Commands.add('completeOnboardingAndLogin', (email: string, password: string) => {
    // Visit the homepage
    cy.openMondly();
    
    // Complete language selection
    cy.selectMotherLanguage('Español');
    cy.selectTargetLanguage('French');
    cy.selectLevel('Intermedio');
    
    // Navigate to login and authenticate
    cy.goToLogin();
    cy.enterCredentials(email, password);
    cy.submitLogin();
    
    // Handle cookie banner if it appears
    cy.acceptCookies();
  });
  
  export {};