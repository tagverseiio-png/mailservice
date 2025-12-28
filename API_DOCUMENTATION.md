# Company Email Service API

Internal email service for company developers to send emails through the centralized no-reply Gmail account.

## Base URL
```
https://your-domain.vercel.app/api/email
```

## Authentication
All endpoints require an API key in the header:
```
x-api-key: your-api-key
```

## Endpoints

### 1. Send Single Email
**POST** `/send`

Send a single email to one recipient.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>HTML Content</h1><p>Your message here</p>",
  "text": "Plain text version (optional if html provided)",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64-encoded-content",
      "contentType": "application/pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "unique-message-id"
}
```

### 2. Send Bulk Emails
**POST** `/send-bulk`

Send the same email to multiple recipients.

**Request Body:**
```json
{
  "recipients": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ],
  "subject": "Bulk Email Subject",
  "html": "<h1>HTML Content</h1><p>Your message here</p>",
  "text": "Plain text version (optional)",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk email completed: 3 sent, 0 failed",
  "results": {
    "successful": [
      {
        "to": "user1@example.com",
        "success": true,
        "messageId": "message-id-1"
      }
    ],
    "failed": []
  }
}
```

### 3. Service Status
**GET** `/status`

Check email service health and configuration.

**Response:**
```json
{
  "success": true,
  "service": "Email Service",
  "status": "operational",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "smtp": {
    "host": "smtp.gmail.com",
    "port": "587",
    "secure": false
  }
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "to",
      "message": "Valid email is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "API key required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "SMTP connection failed"
}
```

## Usage Examples

### Node.js/JavaScript
```javascript
const axios = require('axios');

const sendEmail = async () => {
  try {
    const response = await axios.post('https://your-domain.vercel.app/api/email/send', {
      to: 'user@example.com',
      subject: 'Welcome to our service',
      html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
    }, {
      headers: {
        'x-api-key': 'your-api-key',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Email sent:', response.data);
  } catch (error) {
    console.error('Failed to send email:', error.response.data);
  }
};
```

### Python
```python
import requests

def send_email():
    url = "https://your-domain.vercel.app/api/email/send"
    headers = {
        "x-api-key": "your-api-key",
        "Content-Type": "application/json"
    }
    data = {
        "to": "user@example.com",
        "subject": "Welcome to our service",
        "html": "<h1>Welcome!</h1><p>Thank you for joining us.</p>"
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        print("Email sent:", response.json())
    else:
        print("Failed to send email:", response.json())
```

### cURL
```bash
curl -X POST https://your-domain.vercel.app/api/email/send \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email.</p>"
  }'
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Bulk emails count as 1 request regardless of recipient count

## Notes
- Maximum subject length: 255 characters
- Either `html` or `text` content is required
- Attachments should be base64 encoded
- All emails are sent from the company no-reply address
- Logs are maintained for all email activities