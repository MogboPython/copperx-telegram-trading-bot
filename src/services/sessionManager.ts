import { AuthResponse } from '../types/auth';
import { UserProfile, UserSession } from '../types/user';

// TODO: best memory practice
// In-memory session store (replace with Redis or DB in production)
class SessionManager {
  private sessions: Map<number, UserSession> = new Map();
  
  // Start OTP flow for a user
  startOtpFlow(telegramId: number, email: string, sid: string): void {
    const existingSession = this.sessions.get(telegramId) || {
      telegramId,
      userId: '',
      accessToken: '',
      accessTokenId: '',
      expireAt: '',
      profile: {} as UserProfile
    };
    
    this.sessions.set(telegramId, {
      ...existingSession,
      email,
      otpSid: sid
    });
  }
  
  // Create session from auth response
  createSession(telegramId: number, authResponse: AuthResponse): UserSession {
    const session: UserSession = {
      telegramId,
      userId: authResponse.user.id,
      accessToken: authResponse.accessToken,
      accessTokenId: authResponse.accessTokenId,
      expireAt: authResponse.expireAt,
      profile: authResponse.user
    };
    
    this.sessions.set(telegramId, session);
    return session;
  }
  
  // Get session
  getSession(telegramId: number): UserSession | undefined {
    return this.sessions.get(telegramId);
  }
  
  // Check if session exists and not expired
  isAuthenticated(telegramId: number): boolean {
    const session = this.sessions.get(telegramId);
    if (!session || !session.accessToken) return false;
    
    // Check if token is expired
    const expireAt = new Date(session.expireAt).getTime();
    const now = new Date().getTime();
    
    return expireAt > now;
  }
  
  // Remove session
  removeSession(telegramId: number): void {
    this.sessions.delete(telegramId);
  }
  
  // Get OTP details for a user in OTP flow
  getOtpDetails(telegramId: number): { email: string, sid: string } | null {
    const session = this.sessions.get(telegramId);
    if (!session || !session.email || !session.otpSid) return null;
    
    return { email: session.email, sid: session.otpSid };
  }
  
  // Clear OTP details after completion
  clearOtpDetails(telegramId: number): void {
    const session = this.sessions.get(telegramId);
    if (!session) return;
    
    // Keep other session data but remove OTP fields
    const { otpSid, email, ...rest } = session;
    this.sessions.set(telegramId, rest as UserSession);
  }
  
  // TODO: remove all session checks
  // Debug: list all sessions
  listAllSessions(): void {
    console.log('All active sessions:');
    this.sessions.forEach((session, telegramId) => {
      console.log(`User ${telegramId}:`, {
        userId: session.userId,
        email: session.profile.email,
        name: `${session.profile.firstName} ${session.profile.lastName}`,
        expires: session.expireAt
      });
    });
  }
}

export const sessionManager = new SessionManager();