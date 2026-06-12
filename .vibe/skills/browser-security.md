# Skill: Browser Security Fundamentals

## When to Use
Protecting web applications and their users from common web vulnerabilities: XSS, CSRF, clickjacking, insecure cookies, and data leakage.

## Content Security Policy (CSP)
CSP prevents XSS by whitelisting allowed sources for scripts, styles, images, etc.

### Express Middleware
```ts
import helmet from 'helmet';

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // avoid 'unsafe-inline' if possible
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameAncestors: ["'none'"], // prevents clickjacking
      upgradeInsecureRequests: [],
    },
  })
);

// Even stricter: nonce-based CSP
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'`
  );
  next();
});
```

### Report-Only Mode (Test before enforcing)
```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

## CORS (Cross-Origin Resource Sharing)
### Backend Configuration
```ts
import cors from 'cors';

const allowedOrigins = ['https://app.example.com', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

### Frontend Fetch with Credentials
```ts
fetch('/api/user', {
  credentials: 'include', // sends cookies
  headers: { 'Content-Type': 'application/json' },
});
```

## XSS Prevention
### Input Sanitization
```ts
import DOMPurify from 'isomorphic-dompurify';

// Server-side
const clean = DOMPurify.sanitize(userInput);

// Client-side (React mostly handles this, but for dangerouslySetInnerHTML)
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml) }} />
```

### Output Encoding
- React escapes by default. Never use `dangerouslySetInnerHTML` with user input.
- For vanilla JS: `textContent` is safe, `innerHTML` is dangerous.

### HttpOnly Cookies
```ts
// Express: prevent JS from reading auth tokens
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000,
});
```

## CSRF Protection
### Double Submit Cookie Pattern
```ts
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Send token to client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Frontend: Include Token in Requests
```ts
// Fetch CSRF token on app load
const { csrfToken } = await fetch('/api/csrf-token').then((r) => r.json());

// Include in all mutating requests
fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

## Clickjacking Prevention
```ts
app.use(helmet.frameguard({ action: 'deny' }));
// or via CSP: frame-ancestors 'none'
```

## Secure Headers with Helmet
```ts
import helmet from 'helmet';

app.use(helmet());
// Includes:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 0 (deprecated, CSP replaces it)
// - Strict-Transport-Security (HSTS)
// - Referrer-Policy
```

## Subresource Integrity (SRI)
Verify external scripts haven't been tampered with:
```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>
```

Generate hash:
```bash
curl -s https://cdn.example.com/lib.js | openssl dgst -sha384 -binary | openssl base64 -A
```

## Secure Authentication Patterns
### Password Storage
```ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const valid = await bcrypt.compare(password, hash);
```

### JWT Best Practices
```ts
import jwt from 'jsonwebtoken';

// Sign with short expiry
const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
  expiresIn: '15m',
});

// Refresh token (long-lived, stored in HttpOnly cookie)
const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
  expiresIn: '7d',
});
```

## Security Checklist
- [ ] CSP header configured and enforced.
- [ ] CORS restricted to known origins.
- [ ] Auth cookies are HttpOnly, Secure, SameSite=Strict.
- [ ] CSRF tokens on all state-changing requests.
- [ ] User input sanitized before rendering.
- [ ] Helmet middleware applied for security headers.
- [ ] SRI on all external CDN resources.
- [ ] JWTs have short expiry; refresh tokens rotated.
- [ ] Rate limiting on auth endpoints.
- [ ] No secrets in client-side code.
