# Claypresso — Deployment & Production Guide

This guide details how to build, deploy, and maintain Claypresso in a production environment.

---

## Deployment Options

Claypresso can be deployed to modern serverless platforms like **Vercel** or containerized/standalone **Node.js** servers (e.g. AWS EC2, DigitalOcean, Hetzner, Docker).

---

## 1. Deploying to Vercel (Recommended for Serverless)

### Steps
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the Vercel Dashboard, click **Add New Project** and import the `claypresso` repository.
3. In **Build and Output Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add all environment variables (refer to `.env.example`).
5. **Database Configuration**:
   - When deploying to Vercel, switch from SQLite to a serverless PostgreSQL database (e.g., Vercel Postgres, Neon, Supabase, or Railway).
   - In `prisma/schema.prisma`, update `datasource db` provider to `postgresql`.
   - Run `npx prisma db push` against the production database connection string.
6. Click **Deploy**.

---

## 2. Deploying via Docker / Standalone Node.js Server

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### Running with PM2 (Process Manager)
On an Ubuntu / Debian VPS:

```bash
# 1. Clone repository
git clone https://github.com/your-username/claypresso.git /var/www/claypresso
cd /var/www/claypresso

# 2. Install dependencies & build
npm ci
npx prisma generate
npx prisma db push
npm run build

# 3. Start with PM2
npm install -g pm2
pm2 start npm --name "claypresso" -- run start
pm2 save
pm2 startup
```

---

## 3. Nginx Reverse Proxy & SSL Configuration

```nginx
server {
    server_name claypresso.com www.claypresso.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads max file size
    client_max_body_size 12M;

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/claypresso.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/claypresso.com/privkey.pem;
}
```

---

## 4. Production Checklist

- [ ] `NODE_ENV` is set to `production`.
- [ ] `JWT_SECRET` is a secure, random string (minimum 32 characters).
- [ ] `NEXT_PUBLIC_APP_URL` matches the production domain (e.g. `https://claypresso.com`).
- [ ] Database backups are automated (e.g. daily cron job or cloud provider snapshots).
- [ ] Live Razorpay / Stripe credentials and webhook signing secrets are verified.
- [ ] Courier tracking prefixes are configured in `src/lib/shipping.ts`.
- [ ] SSL certificate (HTTPS) is active with HSTS enabled.
- [ ] Health check endpoint (`/api/health` or `/`) responds with HTTP 200.
