import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import { db } from '@db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface GoogleProfile {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

export function setupGoogleAuth() {
  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile: GoogleProfile, done) => {
        try {
          // Check if user exists
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, profile.emails[0].value))
            .limit(1);

          if (existingUser.length > 0) {
            // Update existing user
            await db
              .update(users)
              .set({
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value || null,
                lastLogin: new Date(),
              })
              .where(eq(users.email, profile.emails[0].value));

            return done(null, existingUser[0]);
          } else {
            // Create new user with a random username
            const username = `user_${profile.id.substring(0, 8)}`;
            const password = Math.random().toString(36).slice(-10); // Random password for OAuth users
            
            const newUser = await db
              .insert(users)
              .values({
                username,
                password, // Temporary password for OAuth users
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value || null,
                googleId: profile.id,
                lastLogin: new Date(),
              })
              .returning();

            return done(null, newUser[0]);
          }
        } catch (error) {
          console.error('Error in Google Auth Strategy:', error);
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (user.length === 0) {
        return done(new Error('User not found'));
      }

      done(null, user[0]);
    } catch (error) {
      done(error);
    }
  });

  return {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: (req: Request, res: Response, next: NextFunction) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.status(401).json({ message: 'Unauthorized' });
    },
  };
}

export const authRoutes = {
  // Google Auth Routes
  googleAuth: passport.authenticate('google', { scope: ['profile', 'email'] }),
  
  googleCallback: [
    passport.authenticate('google', { failureRedirect: '/login?error=google-auth' }),
    (req: Request, res: Response) => {
      res.redirect('/');
    },
  ],
  
  logout: (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.redirect('/login');
    });
  },
  
  // Get current user data
  getCurrentUser: (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Return user data without sensitive information
    const user = req.user as any;
    res.json({
      id: user.id,
      name: user.name || user.username,
      email: user.email,
      avatar: user.avatar,
      walletAddress: user.walletAddress,
      isAuthenticated: true,
    });
  },
}; 