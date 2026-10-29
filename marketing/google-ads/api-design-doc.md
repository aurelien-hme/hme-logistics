---
title: "HME Logistics — Google Ads API Tool Design Document"
---

**Company:** HME Logistics (Home Made E-Logistics), France — https://www.homemade-elogistics.com
**Manager account (MCC):** 961-008-2188
**API contact:** contact@homemade-elogistics.com
**Tool type:** Internal tool, used only by HME Logistics employees

# 1. Business overview

HME Logistics is a French e-commerce fulfillment company specialised in health, wellness and beauty brands. We advertise our own services on Google Search to generate B2B leads. We are an advertiser managing **our own Google Ads account only**, through our own manager account. We do not manage accounts for third parties and the tool is not offered to anyone outside our company.

# 2. Purpose of the tool

An internal script that connects to our Google Ads account to:

1. **Reporting** — retrieve daily campaign, ad group, keyword, search term and ad performance (impressions, clicks, cost, conversions) to build a weekly internal performance review.
2. **Campaign management** — make limited, human-approved changes to our own Search campaigns: add negative keywords from search term analysis, pause poorly performing keywords, adjust keyword bids and budgets.
3. **Offline conversion import** — upload offline conversions (qualified meetings and signed customers) from our internal CRM, matched by GCLID, so that bidding optimises toward real business outcomes.

# 3. Architecture

- Language: Python, using the official `google-ads` client library.
- Authentication: OAuth 2.0 (desktop application flow) with a single HME Logistics Google user; `login-customer-id` set to our MCC.
- Credentials are stored as encrypted environment secrets, never in source code.
- Execution: on demand and once per day (scheduled job). Expected volume: under 1,000 operations per day.
- Data flow: Google Ads API → internal report (Google Sheet / internal dashboard). CRM (lead records with GCLID) → Google Ads API `ConversionUploadService`.

# 4. API services used

- `GoogleAdsService.SearchStream` (GAQL reporting)
- `CampaignService`, `CampaignBudgetService`, `AdGroupCriterionService`, `CampaignCriterionService` (mutates on our own campaigns)
- `ConversionUploadService.UploadClickConversions`

# 5. Access and users

- Users: HME Logistics marketing team only (1–3 people).
- No external clients, no reselling of data, no access granted to third parties.
- All changes are reviewed by an HME employee before being applied.

# 6. Compliance

We comply with the Google Ads API Terms and Conditions and Required Minimum Functionality as applicable to an internal tool. Data retrieved from the API is used solely to manage and report on our own advertising.
