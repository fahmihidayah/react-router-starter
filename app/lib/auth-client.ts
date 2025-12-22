import { createAuthClient } from "better-auth/react";
import { authLogger } from "~/utils/logger";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5173";

authLogger.info("Initializing auth client", { baseURL });

export const authClient = createAuthClient({
  baseURL,
});

authLogger.info("Auth client initialized successfully");

// Wrap auth methods with logging
const originalSignIn = authClient.signIn;
const originalSignUp = authClient.signUp;
const originalSignOut = authClient.signOut;

// Enhanced signIn with logging
// authClient.signIn = {
//   ...originalSignIn,
//   email: async (credentials: { email: string; password: string }) => {
//     authLogger.info("Sign in attempt", { email: credentials.email });
//     try {
//       const result = await originalSignIn.email(credentials);
//       if (result.error) {
//         authLogger.error("Sign in failed", result.error);
//       } else {
//         authLogger.info("Sign in successful", { email: credentials.email });
//       }
//       return result;
//     } catch (error) {
//       authLogger.error("Sign in exception", error);
//       throw error;
//     }
//   },
// };

// Enhanced signUp with logging
// authClient.signUp = {
//   ...originalSignUp,
//   email: async (data: { name: string; email: string; password: string }) => {
//     authLogger.info("Sign up attempt", { name: data.name, email: data.email });
//     try {
//       const result = await originalSignUp.email(data);
//       if (result.error) {
//         authLogger.error("Sign up failed", result.error);
//       } else {
//         authLogger.info("Sign up successful", { email: data.email });
//       }
//       return result;
//     } catch (error) {
//       authLogger.error("Sign up exception", error);
//       throw error;
//     }
//   },
// };

// Enhanced signOut with logging
// authClient.signOut = async () => {
//   authLogger.info("Sign out attempt");
//   try {
//     const result = await originalSignOut();
//     authLogger.info("Sign out successful");
//     return result;
//   } catch (error) {
//     authLogger.error("Sign out exception", error);
//     throw error;
//   }
// };

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
