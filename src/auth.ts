import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        const expectedUser = process.env.DASHBOARD_USERNAME;
        const expectedPass = process.env.DASHBOARD_PASSWORD;

        if (!expectedUser || !expectedPass) {
          throw new Error("DASHBOARD_USERNAME / DASHBOARD_PASSWORD are not configured");
        }
        if (username === expectedUser && password === expectedPass) {
          return { id: "1", name: "Ops manager", email: username };
        }
        return null;
      },
    }),
  ],
});
