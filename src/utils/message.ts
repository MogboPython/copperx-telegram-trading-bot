import { MyContext } from "./sessions";

export const getWelcomeMessage = (ctx: MyContext): string => {
  const firstName = ctx.session.firstName || 'there';
  
  return (
    `Welcome to CopperX TG Bot - the fastest and most secure bot for managing your account!\n\n` +
    `Hello, ${firstName}! To use your account, select any of the following options:`
  );
};

export const getWelcomeBackMessage = (ctx: MyContext): string => {
  const firstName = ctx.session.firstName || 'there';
  
  return (
    `Welcome back to CopperX TG Bot!\n\n` +
    `Hello, ${firstName}! To use your account, select any of the following options:`
  );
};

export const getErrorMessage = (message: string): string => {
  return `⚠️ *Error*: ${message}`;
};

export const getSuccessMessage = (message: string): string => {
  return `✅ *Success*: ${message}`;
};