# ReviewFlow

ReviewFlow is a responsive prototype for setting up branded review pages and QR posters. On Windows, double-click **Open ReviewFlow.cmd** to start the local server and open ReviewFlow in your browser. Keep its terminal window open while using the app.

1. Select **Add New Client** and enter a public business website. The **Royal Gold Jewellery** sample URL runs the original demo.
2. Select **Analyse Website** and review the detected business details and website overview. The analyser reads the submitted page and may check one linked contact page. It uses a bounded portion of very large pages and tells you when that happens. Fields missing from the scanned markup show **Not found**. Some sites block automated requests or load their details in JavaScript. Then confirm the simulated Google profile.
3. ReviewFlow suggests three questions using the business information found on the site. In client setup, select any of the 20 available questions for each slot, then select **Preview Customer Journey** or scan the QR on a phone.
4. Answer the three customer questions, edit the draft, and select **Finish Preview** to copy the result. The current draft generator joins the customer's answers into an editable draft.

The direct-to-Google review link and QR poster features are paused during prototype testing.

## Project folders

- `frontend/` contains the pages, browser code, styles, and visual assets.
- `backend/` contains the website analysis services, local server, and Cloudflare Worker source.
- `api/` contains small Vercel entry points that forward requests to `backend/api/`.
- `cloudflare-dist/` is the generated Cloudflare deployment output. Refresh it with `prepare-cloudflare.ps1` after making changes before committing or deploying.
- Root configuration files and `Open ReviewFlow.cmd` remain in the project root so existing launch and deployment settings continue to work. The existing `security/` folder is unchanged.

## Preview the guided customer page on a phone

Open ReviewFlow with **Open ReviewFlow.cmd** and keep its terminal open. After confirming the example profile, scan the QR code in **Guided review preview** with the phone’s camera. You can download the QR image or copy its customer page address.

An HTTP preview address needs the phone and computer on the same Wi-Fi. When a temporary HTTPS preview is active, the QR works over Wi-Fi or mobile data while the preview is running. Refresh the setup page and use a new QR when the address changes. **Ctrl+C** stops the local server.

The agency dashboard and saved setups use browser storage. Website analysis uses the local server without API keys. Google profile confirmation and review drafting are simulated. Opening the HTML file directly supports the sample flow.

## Cloudflare deployment

The `cloudflare-dist` folder contains the site and the Cloudflare Pages Worker. It can be uploaded using Cloudflare Pages Direct Upload. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\prepare-cloudflare.ps1` after editing the project to refresh this folder before uploading.

For a Git-connected Cloudflare Worker, commit the refreshed `cloudflare-dist` folder along with `wrangler.jsonc`, then use `npx wrangler deploy` as the deploy command. The Worker name in the configuration is `google-reviews-saas-0-2` and must match the Cloudflare Worker.

Cloudflare client setups remain stored in the browser that created them. Customer links encode the business configuration so they can open on another device without a separate database. The Google profile screen and review draft are demo features.
