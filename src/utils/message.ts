import { MyContext } from "./sessions";

// TODO: remove if eventually not necessary
/**
 * Generate a welcome message with the user's name
 * @param ctx The context object with user session
 * @returns Formatted welcome message
 */
export const getWelcomeMessage = (ctx: MyContext): string => {
  const firstName = ctx.session.firstName || 'there';
  
  return (
    `Welcome to CopperX TG Bot - the fastest and most secure bot for managing your account!\n\n` +
    `Hello, ${firstName}! To use your account, select any of the following options:`
  );
};

/**
 * Generate a welcome back message with the user's name
 * @param ctx The context object with user session
 * @returns Formatted welcome back message
 */
export const getWelcomeBackMessage = (ctx: MyContext): string => {
  const firstName = ctx.session.firstName || 'there';
  
  return (
    `Welcome back to CopperX TG Bot!\n\n` +
    `Hello, ${firstName}! To use your account, select any of the following options:`
  );
};

/**
 * Generate a formatted error message
 * @param message The error message
 * @returns Formatted error message
 */
export const getErrorMessage = (message: string): string => {
  return `⚠️ *Error*: ${message}`;
};

/**
 * Generate a formatted success message
 * @param message The success message
 * @returns Formatted success message
 */
export const getSuccessMessage = (message: string): string => {
  return `✅ *Success*: ${message}`;
};