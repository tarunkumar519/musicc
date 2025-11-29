"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AuthGuard = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      if (pathname !== "/login" && pathname !== "/signup" && !pathname.startsWith("/reset-password")) {
         router.push("/login");
      }
    } else if (status === "authenticated") {
      // Check Last.fm
      const sk = localStorage.getItem("lastfm_session_key");
      if (!sk) {
        if (pathname !== "/scrobble") {
          router.push("/scrobble?setup=true");
        }
      }
    }
    setChecked(true);
  }, [status, pathname, router]);

  // Don't render content for unauthenticated users on protected pages
  if (status === "unauthenticated" && pathname !== "/login" && pathname !== "/signup" && !pathname.startsWith("/reset-password")) {
      return null;
  }
  
  // Don't render content for authenticated users who haven't set up scrobbling on protected pages
  if (status === "authenticated" && !localStorage.getItem("lastfm_session_key") && pathname !== "/scrobble") {
      return null;
  }

  return children; 
};

export default AuthGuard;

