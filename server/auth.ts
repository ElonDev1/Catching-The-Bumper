/**
 * Simple password gate middleware.
 * Set APP_PASSWORD env var on Railway to enable.
 * If APP_PASSWORD is not set, the app is open (dev mode).
 *
 * Flow:
 *   - GET /login  → serve login page
 *   - POST /login → check password, set signed cookie
 *   - All other routes → check cookie, redirect to /login if missing
 *   - /api/* routes → return 401 JSON (for fetch calls)
 */

import type { Request, Response, NextFunction, Express } from "express";

const PASSWORD = process.env.APP_PASSWORD;
const COOKIE_NAME = "dc_intel_auth";
const COOKIE_VALUE = "granted";

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DC Intel — Login</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #04454B;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
    }
    .card {
      background: #04454B;
      border: 1px solid #01747B;
      padding: 48px 40px;
      width: 360px;
      text-align: center;
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      color: #72BBC1;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .sub {
      font-size: 10px;
      color: #407277;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 36px;
    }
    label {
      display: block;
      font-size: 10px;
      color: #72BBC1;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: left;
      margin-bottom: 8px;
    }
    input[type="password"] {
      width: 100%;
      background: #000;
      border: 1px solid #01747B;
      color: #fff;
      font-family: inherit;
      font-size: 14px;
      padding: 10px 12px;
      outline: none;
      margin-bottom: 20px;
    }
    input[type="password"]:focus { border-color: #72BBC1; }
    button {
      width: 100%;
      background: #01747B;
      border: none;
      color: #fff;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 12px;
      cursor: pointer;
    }
    button:hover { background: #72BBC1; color: #000; }
    .error {
      font-size: 11px;
      color: #ff4444;
      margin-top: 12px;
      letter-spacing: 0.04em;
    }
    .dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00FF41;
      margin-right: 6px;
      vertical-align: middle;
    }
    .live {
      font-size: 9px;
      color: #00FF41;
      letter-spacing: 0.08em;
      margin-bottom: 32px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DC Intel</div>
    <div class="sub">BTM Generation Tracker</div>
    <div class="live"><span class="dot"></span>LIVE DATA</div>
    <form method="POST" action="/login">
      <label>Access Password</label>
      <input type="password" name="password" autofocus placeholder="••••••••" />
      {{ERROR}}
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;

export function setupAuth(app: Express) {
  // If no password set, skip auth entirely
  if (!PASSWORD) return;

  // Parse cookies manually (no cookie-parser dependency)
  function getCookie(req: Request, name: string): string | undefined {
    const cookies = req.headers.cookie || "";
    const parts = cookies.split(";").map(c => c.trim());
    for (const part of parts) {
      const [key, ...rest] = part.split("=");
      if (key.trim() === name) return rest.join("=").trim();
    }
    return undefined;
  }

  function isAuthed(req: Request): boolean {
    return getCookie(req, COOKIE_NAME) === COOKIE_VALUE;
  }

  // Login page
  app.get("/login", (_req, res) => {
    res.send(LOGIN_HTML.replace("{{ERROR}}", ""));
  });

  // Login handler
  app.post("/login", express.urlencoded({ extended: false }), (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      // Set cookie for 7 days
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      res.setHeader("Set-Cookie", `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax`);
      res.redirect("/");
    } else {
      res.send(LOGIN_HTML.replace("{{ERROR}}", '<div class="error">Incorrect password — try again.</div>'));
    }
  });

  // Auth guard middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Allow login page through
    if (req.path === "/login") return next();
    // Allow static assets through (css, js, fonts, favicon)
    if (req.path.match(/\.(js|css|png|ico|woff2?|ttf|svg|map)$/)) return next();

    if (isAuthed(req)) return next();

    // API routes return 401 JSON
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // All other routes → redirect to login
    res.redirect("/login");
  });
}

import express from "express";
