# Email API Service

A Node.js email service that provides a RESTful API for sending emails through various SMTP providers. Deployed on Vercel.

## Features

- Send emails via SMTP
- Secure API key authentication
- Rate limiting
- Request validation
- Logging
- Environment-based configuration

## Prerequisites

- Node.js 16.x or higher
- Vercel CLI (for deployment)
- SMTP credentials (e.g., Gmail, SendGrid, etc.)

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The server will be available at `http://localhost:3000`

## API Endpoints

### Send Email

```http
POST /api/email/send
Content-Type: application/json
x-api-key: your-api-key

{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello World</h1><p>This is a test email</p>"
}
```

### Health Check

```http
GET /health
```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   ```bash
   vercel env add
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| SMTP_HOST | Yes | SMTP server host |
| SMTP_PORT | Yes | SMTP server port |
| SMTP_SECURE | Yes | Use SSL/TLS (true/false) |
| SMTP_USER | Yes | SMTP username |
| SMTP_PASS | Yes | SMTP password |
| FROM_NAME | Yes | Sender name |
| API_KEYS | Yes | Comma-separated list of valid API keys |
| NODE_ENV | No | Environment (development/production) |
| PORT | No | Server port (default: 3000) |

## License

ISC
