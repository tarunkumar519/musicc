import NextAuth from "next-auth";
import { authOptions } from "@/utils/authOptions";

const handler = (req, res) => NextAuth(req, res, authOptions);
export { handler as GET, handler as POST };
