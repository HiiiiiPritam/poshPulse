import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./libs/dbConnect";
import User from "./models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (typeof window === "undefined") {
      await dbConnect(); // Ensure MongoDB is connected

      try {
        // Check if user already exists
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // If user doesn't exist, create a new user
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }

        if (existingUser) {
          // Attach MongoDB _id and role to the user object
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
        }
      } catch (error) {
        console.error("Error saving user to database:", error);
        return false; // Deny sign-in on error
      }
    }

      return true; // Allow sign-in
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (token.id) {
        // Fetch fresh role from DB if user object is not present (subsequent requests)
        await dbConnect();
        const freshUser = await User.findById(token.id);
        if (freshUser) {
          token.role = freshUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
