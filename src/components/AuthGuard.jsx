"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AuthGuard = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Loading: do nothing
    if (status === "loading") return;

    // 2. Unauthenticated: Redirect to login
    if (status === "unauthenticated") {
      if (pathname !== "/login" && pathname !== "/signup" && !pathname.startsWith("/reset-password")) {
         router.replace("/login");
      } else {
         setAuthorized(true); // Allowed to view login/signup
      }
      return;
    }

    // 3. Authenticated
    if (status === "authenticated") {
      // Check Last.fm setup
      const sk = localStorage.getItem("lastfm_session_key");
      
      if (!sk) {
        // Enforce setup
        if (pathname !== "/scrobble") {
          // If not on scrobble page, redirect
          router.replace("/scrobble?setup=true");
          setAuthorized(false); // Not authorized to view other content yet
        } else {
          // Allowed to view scrobble page
          setAuthorized(true);
        }
      } else {
        // Fully authorized
        setAuthorized(true);
      }
    }
  }, [status, pathname, router]);

  // Block rendering until authorized
  if (!authorized) {
      return null;
  }

  return children; 
};

export default AuthGuard;
