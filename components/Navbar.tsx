"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUserSession, clearUserSession } from "../lib/session";

interface NavbarProps {
  title?: string;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/lessons", label: "Lessons" },
  { href: "/conversation", label: "Conversation" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/settings", label: "Settings" },
];

export function Navbar({ title = "VoiceGym" }: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAuthenticated(!!getUserSession());
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleSignOut() {
    clearUserSession();
    setIsAuthenticated(false);
    window.location.href = "/";
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        style={{
          background: "#1a1828",
          borderBottom: "1px solid rgba(124,110,245,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1024,
            margin: "0 auto",
            padding: "0 20px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>🎙️</span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e0dcff",
                letterSpacing: "0.3px",
              }}
            >
              {title}
            </span>
          </Link>

          {/* Desktop links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  background: isActive(link.href)
                    ? "rgba(124,110,245,0.18)"
                    : "transparent",
                  color: isActive(link.href) ? "#c4bcf7" : "#9b94c4",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Premium — special treatment */}
            <Link
              href="/premium"
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                textDecoration: "none",
                background: "rgba(245,166,35,0.12)",
                color: "#f5a623",
                border: "1px solid rgba(245,166,35,0.25)",
                marginLeft: 4,
              }}
            >
              ✦ Premium
            </Link>

            {/* Auth */}
            <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth/login"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "6px 14px",
                      borderRadius: 8,
                      textDecoration: "none",
                      color: "#9b94c4",
                      border: "1px solid rgba(124,110,245,0.2)",
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: 8,
                      textDecoration: "none",
                      background: "#7c6ef5",
                      color: "#fff",
                    }}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#9b94c4",
                    border: "1px solid rgba(124,110,245,0.2)",
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>

          {/* Mobile: auth + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="flex md:hidden">
            {!isAuthenticated ? (
              <Link
                href="/auth/signup"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: "#7c6ef5",
                  color: "#fff",
                }}
              >
                Sign up
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "5px 12px",
                  borderRadius: 8,
                  background: "transparent",
                  color: "#9b94c4",
                  border: "1px solid rgba(124,110,245,0.2)",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: menuOpen ? "rgba(124,110,245,0.18)" : "transparent",
                border: "1px solid rgba(124,110,245,0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 16,
                    height: 1.5,
                    borderRadius: 99,
                    background: "#a599f7",
                    transition: "transform 0.2s, opacity 0.2s",
                    transform:
                      menuOpen && i === 0
                        ? "translateY(6.5px) rotate(45deg)"
                        : menuOpen && i === 2
                        ? "translateY(-6.5px) rotate(-45deg)"
                        : "none",
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: menuOpen ? 480 : 0,
            transition: "max-height 0.3s ease",
            borderTop: menuOpen ? "1px solid rgba(124,110,245,0.1)" : "none",
          }}
        >
          <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "11px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isActive(link.href) ? "rgba(124,110,245,0.18)" : "transparent",
                  color: isActive(link.href) ? "#c4bcf7" : "#9b94c4",
                  display: "block",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/premium"
              style={{
                fontSize: 15,
                fontWeight: 600,
                padding: "11px 14px",
                borderRadius: 10,
                textDecoration: "none",
                background: "rgba(245,166,35,0.1)",
                color: "#f5a623",
                display: "block",
                marginTop: 4,
              }}
            >
              ✦ Premium
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}