/**
 * Mondly Complete Onboarding and Login Flow Test
 * 
 * This test demonstrates the complete onboarding and login flow:
 * 1. Change the "I Speak" language from English to Spanish
 * 2. Change the "I want to learn" language to French
 * 3. Select the learning level as "Intermedio" (Intermediate)
 * 4. Click on "Iniciar sesión" (Log in) link
 * 5. Enter email and password credentials
 * 6. Click the "Iniciar sesión" button to submit the login form
 * 
 * Perfect for learning Cypress basics!
 */

describe('Mondly Language Selection', () => {
  
  /**
   * beforeEach runs before every test in this describe block
   * It visits the Mondly homepage with a 30-second timeout
   */
  beforeEach(() => {
    // Visit the Mondly app homepage
    // baseUrl is set in cypress.config.ts, so '/' means https://app.mondly.com/
    cy.openMondly();
  });

  /**
   * Test: Complete onboarding flow and login
   * 
   * Steps:
   * 1. Change "I Speak" from English to Spanish
   * 2. Change "I want to learn" from Seleccionar to French
   * 3. Select learning level as "Intermedio" (Intermediate)
   * 4. Click "Iniciar sesión" link to open login form
   * 5. Enter email credentials
   * 6. Enter password credentials
   * 7. Click "Iniciar sesión" button to submit login
   */
  it('should complete onboarding and login', () => {
    // STEP 1: Select Spanish as mother language (I speak)
    // This clicks "English" dropdown, selects "Español", closes the dropdown
    cy.selectMotherLanguage('Español');
    
    // Verify that "Español" is now visible (meaning selection was successful)
    cy.contains('Español').should('be.visible');
    
    // STEP 2: Select French as target language (I want to learn)
    // This clicks "Seleccionar" dropdown, scrolls to "French", selects it, and closes the dropdown
    cy.selectTargetLanguage('French');
    
    // Verify that "French" is now visible (meaning target language was selected)
    cy.contains('French').should('be.visible');
    
    // STEP 3: Select learning level as "Intermedio" (Intermediate)
    // This slides the selector to "Intermedio" position and clicks it
    cy.selectLevel('Intermedio');
    
    // Verify that "Intermedio" was selected successfully
    cy.contains('Intermedio').should('be.visible');
    
    // STEP 4: Click on "Iniciar sesión" (Log in)
    // This link appears at the bottom of the modal after completing the onboarding steps
    cy.goToLogin();

    // STEP 5 & 6: Enter credentials using the custom command
    // This uses the credentials from your .env file securely
    cy.enterCredentials(Cypress.env('userEmail'), Cypress.env('userPassword'));

    // STEP 7: Submit the login form and confirm the home screen
    cy.submitLogin();
    cy.acceptCookies();
    cy.verifyCategories();
  });

  /**
   * Alternative test: Select a different language
   * You can uncomment this to test other languages
   */
  // it('should change mother language to French', () => {
  //   cy.selectMotherLanguage('Français');
  //   cy.contains('Français').should('be.visible');
  // });
});
