import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { normalizeUserImage } from "@/lib/account/avatar";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  databaseHooks: {
    user: {
      create: {
        before: (user) =>
          Promise.resolve({
            data: {
              ...user,
              image: normalizeUserImage(user.image),
            },
          }),
      },
      update: {
        before: (user) =>
          Promise.resolve({
            data:
              "image" in user
                ? {
                    ...user,
                    image: normalizeUserImage(user.image),
                  }
                : user,
          }),
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        react: ForgotPasswordEmail({
          resetUrl: url,
          userEmail: user.email,
          username: user.name,
        }),
        subject: "Reset your password",
        to: user.email,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
        subject: "Verify your email",
        to: user.email,
      });
    },
  },
  plugins: [
    apiKey({
      defaultPrefix: "ytb_",
      // Per-key request throttle; the monthly generation quota is enforced
      // separately by the blog pipeline.
      rateLimit: {
        enabled: true,
        maxRequests: 10,
        timeWindow: 60 * 1000,
      },
    }),
    lastLoginMethod(),
    nextCookies(),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        image: profile.picture,
        name: profile.name,
      }),
    },
  },
});
