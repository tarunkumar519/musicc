import { getServerSession } from "next-auth";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import { authOptions } from "@/utils/authOptions";

// check if user is logged in
export default async function auth(req) {
    // In App Router route handlers, getServerSession correctly retrieves the session
    // It automatically looks at cookies in the request
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return null
    }
    
    try {
        await dbConnect(); // Await db connection
        // We can just rely on session.user.email if we trust the session, 
        // but fetching the full user object is safer if you need fresh DB data
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return null
        }
        return user;
    } catch (error) {
        console.error(error);
        return null
    }
}