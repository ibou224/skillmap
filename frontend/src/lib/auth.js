import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { isValidEmail, isValidPassword } from "./validation";
import { getIp } from "./permission";

const ACCESS_TOKEN_DURATION = 15 * 60;
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60;

// Codes d'erreur envoyes au client, puis traduits en messages dans useAuth.js.
class LoginError extends CredentialsSignin {
  constructor(code) {
    super();
    this.code = code;
  }
}
// Fonction pour generer le refresh token
const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, 10);
  const expires = new Date(Date.now() + REFRESH_TOKEN_DURATION * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokenHash: hash,
      refreshExpiresAt: expires,
    },
  });

  return token;
};

// Renouvelle l'access token via le refresh token
const refreshAccessToken = async (token) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: {
        refreshTokenHash: true,
        refreshExpiresAt: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) throw new Error("Utilisateur invalide");
    if (!user.refreshTokenHash) throw new Error("Aucun refresh token en base");
    if (user.refreshExpiresAt < new Date())
      throw new Error("Refresh token expiré");

    const valide = await bcrypt.compare(
      token.refreshToken,
      user.refreshTokenHash,
    );
    if (!valide) throw new Error("Refresh token invalide");

    return {
      ...token,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("Erreur lors du refresh du token :", error);
    return { ...token, error: "RefreshTokenError" };
  }
};

const {
  handlers,
  auth: _auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@lacitec.on.ca",
        },
        password: {
          label: "Mot de passe",
          type: "password",
          placeholder: "••••••••",
        },
      },

      authorize: async (credentials, request) => {
        if (!credentials?.email || !credentials?.password) {
          throw new LoginError("Identifiants incorrects. Veuillez réessayer.");
        }

        const emailValidation = isValidEmail(credentials.email);
        if (!emailValidation.valid) {
          throw new LoginError(emailValidation.message);
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          throw new LoginError("Identifiants incorrects. Veuillez réessayer.");
        }
        if (!user.isActive) {
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_ATTEMPT",
              entityType: "USER",
              entityId: user.id,
              metadata: {
                email: user.email,
                role: user.role,
                message: "Tentative de connexion sur un compte désactivé",
              },
              ipAddress: getIp(request),
              userId: user.id,
            },
          });
          throw new LoginError("Compte désactivé. Contactez l'administrateur.");
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_ATTEMPT",
              entityType: "USER",
              entityId: user.id,
              metadata: {
                email: user.email,
                role: user.role,
                message: "Compte temporairement verrouillé",
              },
              ipAddress: getIp(request),
              userId: user.id,
            },
          });
          throw new LoginError(
            "Compte temporairement verrouillé. Réessayez dans 30 minutes.",
          );
        }

        const passwordValidation = isValidPassword(credentials.password);
        if (!passwordValidation.valid) {
          throw new LoginError("Identifiants incorrects. Veuillez réessayer.");
        }
        const passwordOk = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!passwordOk) {
          const newAttemps = user.loginAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: user.loginAttempts + 1,
              lockedUntil:
                newAttemps >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null,
            },
          });
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_ATTEMPT",
              entityType: "USER",
              entityId: user.id,
              metadata: {
                email: user.email,
                role: user.role,
                message: "Mauvais mot de passe",
              },
              ipAddress: getIp(request),
              userId: user.id,
            },
          });
          throw new LoginError("Identifiants incorrects. Veuillez réessayer.");
        }

        const refreshToken = await createRefreshToken(user.id);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });
        await prisma.auditLog.create({
          data: {
            action: "LOGIN",
            entityType: "USER",
            entityId: user.id,
            metadata: {
              email: user.email,
              role: user.role,
              message: "Connexion réussie",
            },
            ipAddress: getIp(request),
            userId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom,
          refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Première connexion : initialiser le token avec les données de authorize()
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_DURATION * 1000,
        };
      }

      // Refresh déjà échoué → ne pas retenter, laisser le middleware rediriger
      if (token.error === "RefreshTokenError") return token;

      // Access token encore valide → rien à faire
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token expiré → tenter le renouvellement via le refresh token
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.nom = token.nom;
      session.user.prenom = token.prenom;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_DURATION,
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        try {
          const user = await prisma.user.update({
            where: { id: token.id },
            data: { refreshTokenHash: null, refreshExpiresAt: null },
          });
          await prisma.auditLog.create({
            data: {
              action: "LOGOUT",
              entityType: "USER",
              entityId: user.id,
              metadata: {
                email: user.email,
                role: user.role,
                message: "Déconnexion réussie",
              },
              ipAddress: null,
              userId: user.id,
            },
          });
        } catch (error) {
          console.error(
            "Échec de la suppression du refresh token lors de la déconnexion :",
            error,
          );
        }
      }
    },
  },
});

export { handlers, signIn, signOut };
export const auth = cache(_auth);
