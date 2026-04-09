"use client";
import { useEffect } from "react";

export default function SeedUserId() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      let userId = localStorage.getItem("userId");
      const cookieHas = document.cookie.split(";").some((c) => c.trim().startsWith("userId="));

      if (!userId) {
        userId = `user_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem("userId", userId);
      }

      if (!cookieHas) {
        // set cookie for one year
        document.cookie = `userId=${userId}; path=/; max-age=${60 * 60 * 24 * 365}`;
        // reload so the server can pick up the cookie and render personalized stats
        if (window.location.pathname === "/") {
          window.location.reload();
        }
      }
    } catch (e) {
      // ignore
      // eslint-disable-next-line no-console
      console.warn("SeedUserId error:", e);
    }
  }, []);

  return null;
}
