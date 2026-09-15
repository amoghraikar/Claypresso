# Authentication & Session Management

Claypresso implements a lightweight, stateless authentication architecture powered by **Jose JWT** and **bcryptjs**.

---

## 1. Principles

- **Guest-First**: Customers are never forced to create an account to browse, configure custom orders, or complete checkout.
- **Stateless Tokens**: User sessions are authenticated using signed JWT tokens, avoiding server-side session store bottlenecks.
- **HTTP-Only Cookies**: Tokens are stored strictly in `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies, neutralizing browser XSS token theft.

---

## 2. Token Payload

```ts
interface TokenPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
}
```

---

## 3. Middleware Role-Based Access Control (`src/middleware.ts`)

```ts
// Path matcher protecting admin routes
if (request.nextUrl.pathname.startsWith('/admin')) {
  const token = request.cookies.get('claypresso_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/account/login', request.url));
  }
  const payload = await verifyJwtToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/account/login?error=unauthorized', request.url));
  }
}
```

---

## 4. Password Security

Passwords are hashed using `bcryptjs` with salt rounds prior to persistence in the database. Raw passwords are never logged or stored.
