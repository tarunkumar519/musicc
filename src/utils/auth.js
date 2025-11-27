import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";


// check if user is logged in
export default async function auth(req) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    
    // Fallback: If no token, check for __Secure-next-auth.session-token
    if (!token) {
        // Log headers for debugging
        // console.log("Req Headers:", req.headers);
        return null; 
    }
    
    try {
        await dbConnect(); // Await db connection
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return null
        }
        return user;
    } catch (error) {
        console.error(error);
        return null
    }
}