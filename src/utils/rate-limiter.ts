import { Context, MiddlewareFn, NextFunction } from "grammy";
import { MyContext } from "./sessions";

// In-memory store for tracking auth attempts
interface RateLimitEntry {
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
  cooldownUntil?: Date;
}

// Configure rate limiting parameters
const AUTH_MAX_ATTEMPTS = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_COOLDOWN_MS = 30 * 60 * 1000;

// In-memory store for rate limiting (userId => RateLimitEntry)
const rateLimitStore = new Map<number, RateLimitEntry>();

// Cleanup old entries periodically by removing entries where cooldown has expired or window has passed with no cooldown
setInterval(() => {
  const now = new Date();
  rateLimitStore.forEach((entry, userId) => {
    if ((entry.cooldownUntil && entry.cooldownUntil < now) || 
        (!entry.cooldownUntil && (now.getTime() - entry.lastAttempt.getTime() > AUTH_WINDOW_MS))) {
      rateLimitStore.delete(userId);
    }
  });
}, 10 * 60 * 1000);

export function isRateLimited(userId: number): boolean {
  const entry = rateLimitStore.get(userId);
  if (!entry) return false;

  const now = new Date();
  
  // Check if user is in cooldown period
  if (entry.cooldownUntil && entry.cooldownUntil > now) {
    return true;
  }
  
  // If cooldown has expired, reset the entry
  if (entry.cooldownUntil && entry.cooldownUntil <= now) {
    rateLimitStore.delete(userId);
    return false;
  }
  
  // Check if attempts exceeded in the time window
  const windowExpired = now.getTime() - entry.firstAttempt.getTime() > AUTH_WINDOW_MS;
  if (windowExpired) {
    // Reset if window has expired
    rateLimitStore.delete(userId);
    return false;
  }
  
  return entry.attempts >= AUTH_MAX_ATTEMPTS;
}

export function recordAuthAttempt(userId: number, success: boolean): void {
  const now = new Date();
  const entry = rateLimitStore.get(userId) || {
    attempts: 0,
    firstAttempt: now,
    lastAttempt: now
  };
  
  if (success) {
    // On successful auth, remove entry
    rateLimitStore.delete(userId);
    return;
  }
  
  // Update attempt count
  entry.attempts += 1;
  entry.lastAttempt = now;
  
  // Check if we need to apply cooldown
  if (entry.attempts >= AUTH_MAX_ATTEMPTS) {
    entry.cooldownUntil = new Date(now.getTime() + AUTH_COOLDOWN_MS);
  }
  
  rateLimitStore.set(userId, entry);
}

export function getCooldownExpiry(userId: number): Date | null {
  const entry = rateLimitStore.get(userId);
  return entry?.cooldownUntil || null;
}

export function getRemainingAttempts(userId: number): number {
  const entry = rateLimitStore.get(userId);
  if (!entry) return AUTH_MAX_ATTEMPTS;
  return Math.max(0, AUTH_MAX_ATTEMPTS - entry.attempts);
}

export const authRateLimiter: MiddlewareFn<MyContext> = async (ctx, next) => {
  // Only apply to auth-related actions
  if (!ctx.from || !isAuthRelatedAction(ctx)) {
    return next();
  }
  
  const userId = ctx.from.id;
  
  // Check if user is rate limited
  if (isRateLimited(userId)) {
    const cooldownExpiry = getCooldownExpiry(userId);
    if (cooldownExpiry) {
      const minutesLeft = Math.ceil((cooldownExpiry.getTime() - new Date().getTime()) / 60000);
      await ctx.reply(`Too many failed attempts. Please try again in ${minutesLeft} minutes.`);
    } else {
      await ctx.reply("Too many attempts. Please try again later.");
    }
    return;
  }
  
  // Proceed with the request
  return next();
};

function isAuthRelatedAction(ctx: MyContext): boolean {
  // Check for authentication-related commands/actions
  if (ctx.callbackQuery?.data === "connect_account") return true;
  if (ctx.message?.text?.startsWith("/start")) return false; // Allow start command
  
  // Check current action in session
  if (ctx.session.currentAction === "waiting_for_email") return true;
  if (ctx.session.currentAction === "waiting_for_otp") return true;
  
  return false;
}