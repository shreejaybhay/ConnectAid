import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  trustHost: true, // Add this for production
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET, // Ensure secret is set at top level
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();
          
          // Find user by email
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check password
          const isPasswordValid = await user.comparePassword(credentials.password);
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Check if user can login
          const loginCheck = user.canLogin();
          if (!loginCheck.canLogin) {
            console.log('User cannot login:', loginCheck.reason);
            return null; // Return null instead of throwing error
          }

          // Update last login
          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            location: user.location,
            role: user.role,
            emailVerified: user.emailVerified,
            isApproved: user.isApproved,
            profileImage: user.profileImage
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secret: process.env.NEXTAUTH_SECRET, // Explicitly set the secret
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.fullName = user.fullName;
        token.phone = user.phone;
        token.location = user.location;
        token.emailVerified = user.emailVerified;
        token.isApproved = user.isApproved;
        token.profileImage = user.profileImage;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        // Update token with new session data
        if (session.firstName) token.firstName = session.firstName;
        if (session.lastName) token.lastName = session.lastName;
        if (session.fullName) token.fullName = session.fullName;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.location !== undefined) token.location = session.location;
        if (session.profileImage !== undefined) token.profileImage = session.profileImage;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.fullName = token.fullName;
        session.user.phone = token.phone;
        session.user.location = token.location;
        session.user.emailVerified = token.emailVerified;
        session.user.isApproved = token.isApproved;
        session.user.profileImage = token.profileImage;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs properly
      console.log('NextAuth redirect:', { url, baseUrl });

      // If URL is relative, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('Redirecting to relative URL:', fullUrl);
        return fullUrl;
      }

      // Allow callback URLs on same origin
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('Redirecting to same origin URL:', url);
          return url;
        }
      } catch (error) {
        console.error('Error parsing URL in redirect:', error);
      }

      console.log('Redirecting to baseUrl:', baseUrl);
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ token, session }) {
      console.log('User signed out:', token?.email || session?.user?.email);
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
