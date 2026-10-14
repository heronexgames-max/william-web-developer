# William | Web Developer

React + Vite portfolio website.

## Run locally

```bash
npm install
npm run dev
```

For the production-style local server, build first and then run:

```bash
npm run build
npm start
```

The local server stores enquiries in `data/enquiries.jsonl`. This is suitable for local testing only.

## Deploy to Vercel

The project includes `api/enquiries.js`, a Vercel serverless endpoint. It sends form submissions to your email through Resend.

1. Create a [Resend](https://resend.com) account and create an API key.
2. In Vercel, open the project and go to **Settings → Environment Variables**.
3. Add these variables for the Production environment:

```text
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_EMAIL=william.l.eddieweb@gmail.com
```

4. Optionally add `FROM_EMAIL`. For a real deployment, use a sender address from a domain verified in Resend:

```text
FROM_EMAIL=Website enquiries <hello@yourdomain.com>
```

5. Redeploy the project after saving the variables.

Without these variables, the form will show a clear configuration error instead of falsely claiming that the enquiry was saved.

## What was fixed

- Portfolio cards are now real links rendered by React, so they work without a refresh or delayed DOM manipulation.
- Contact email and phone details are rendered directly in the page markup.
- The enquiry form now uses the Vercel API route in production and displays the server's actual error message.
- Duplicate submissions are prevented while a request is being sent.
- The old local JSON-file server remains available for local testing.

## Before publishing

- Replace the three clearly labelled **concept projects** with real screenshots and links when you have them. The examples are mockups, not deployed client projects.
- Verify your pricing and scope, especially custom functionality, hosting, and third-party costs.
- Add your own domain and a verified Resend sender address when ready.
