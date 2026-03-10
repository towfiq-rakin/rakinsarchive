---
draft: true
---

# Hosting Quartz Site on Google Cloud Storage (GCS)

This document roughly outlines the steps taken to migrate our Quartz-based digital garden (`archive.rakin.me`) from GitHub Pages / Cloudflare Pages to a Google Cloud Storage (GCS) bucket, while maintaining a custom domain and an automated CI/CD pipeline via GitHub Actions.

## Prerequisites & Current State Analysis

- **Framework:** Quartz (v4.5.x)
- **Domain:** `archive.rakin.me` (registered on Namecheap, using Cloudflare DNS)
- **Previous Hosting:** Dual setup with GitHub Pages and Cloudflare Pages
- **Goal:** Host entirely on Google Cloud Storage with automated GitHub Actions CI/CD to push new notes on commit.

---

## Step 1: Verify Domain Ownership in Google Search Console

Before GCS allows a bucket to use a custom domain name, ownership must be validated.

1. Navigated to [Google Search Console](https://search.google.com/search-console).
2. Added a property for `archive.rakin.me`.
3. Copied the provided TXT record.
4. Logged in to Namecheap (or Cloudflare DNS depending on current nameserver setup) and added the TXT record to the domain's DNS settings.
5. Clicked "Verify" in the Search Console.

## Step 2: Create and Configure the GCS Bucket

1. Created a new bucket in the Google Cloud Console.
2. **Name:** `archive.rakin.me` (Bucket name _must_ exactly match the subdomain).
3. **Location:** Kept regional (e.g., `us-central1`).
4. **Access Control:** Disabled "Enforce public access prevention" and set to **Uniform** access control.
5. **Permissions:**
   - Granted access to `allUsers` with the role **Cloud Storage -> Storage Object Viewer**.
6. **Website Configuration:**
   - Edited the bucket's website configuration pointing the **Main page suffix** to `index.html` and **Error page** to `404.html`.

## Step 3: Configure DNS and HTTPS via Cloudflare

GCS does not natively provide SSL/TLS for custom domains. We used Cloudflare as a proxy to secure the connection.

1. Switched Namecheap nameservers to Cloudflare (if not already done).
2. Cleaned up old DNS records (deleted previous `CNAME`/`A` records for `archive` pointing to GitHub Pages or Cloudflare Pages).
3. Created a new **CNAME** record:
   - **Name:** `archive`
   - **Target:** `c.storage.googleapis.com`
   - **Proxy Status:** Proxied (Orange cloud on).
4. Set SSL/TLS Encryption Mode to **Full** in Cloudflare to prevent redirect loops between Cloudflare and Google Cloud.

## Step 4: Set up Service Account for GitHub Actions

The automated CI/CD pipeline needs permission to write files to the bucket.

1. In Google Cloud Console, created an IAM Service Account (e.g., `github-actions-deployer`).
2. Assigned it the **Storage Object Admin** role.
3. Generated and downloaded a JSON key for the Service Account.
4. In the GitHub Repository's **Settings > Secrets and variables > Actions**, created a new secret:
   - **Name:** `GCP_CREDENTIALS`
   - **Value:** Complete contents of the JSON key file.

## Step 5: Create the CI/CD Pipeline (GitHub Actions)

Created the deployment workflow file so pushing notes to `v4` automatically syncs the output to the bucket.

**File:** `.github/workflows/deploy-gcs.yml`

```yaml
name: Deploy to Google Cloud Storage

on:
  push:
    branches:
      - v4 # Change this to your default branch if it's 'master'

concurrency:
  group: "gcs"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Needed for Quartz to resolve git timestamps

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: npm ci

      - name: Build Quartz Site
        run: npx quartz build

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Sync files to GCS
        # Quartz outputs the built site to the 'public/' directory.
        # The -m flag enables parallel uploads, -d deletes files in the bucket that don't exist in the build, and -r is recursive.
        run: |
          gsutil -m rsync -r -d public/ gs://archive.rakin.me/
```

### Result

When you push to `v4` (e.g., via `npx quartz sync`), the GitHub Action automatically runs, securely builds the site, and utilizes parallel `gsutil rsync` to instantly mirror the `public/` directory to the GCS bucket. Cloudflare then proxies that GCS bucket to the world over HTTPS.
