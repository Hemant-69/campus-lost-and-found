import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function generatePdf() {
  console.log("Starting PDF generation for Campus Lost & Found Manual...");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Campus Lost & Found - Operational Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #231F20;
      background-color: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.5;
    }

    /* Page Breaks */
    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Typography */
    h1, h2, h3, h4 {
      font-family: 'Fraunces', Georgia, serif;
      color: #231F20;
      margin-top: 0;
      font-weight: 700;
    }

    h1 { font-size: 24pt; line-height: 1.15; margin-bottom: 8pt; }
    h2 { font-size: 16pt; line-height: 1.25; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 2px solid #231F20; padding-bottom: 4pt; }
    h3 { font-size: 12pt; line-height: 1.3; margin-top: 12pt; margin-bottom: 4pt; }
    h4 { font-size: 10.5pt; font-weight: 700; margin-top: 8pt; margin-bottom: 2pt; }

    p { margin-top: 0; margin-bottom: 6pt; }
    strong { font-weight: 700; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; background: #F1ECE1; padding: 1.5pt 3pt; border-radius: 3px; border: 1px solid #D5CBB8; }

    /* Notice Board Palette */
    .bg-yellow { background-color: #F2B84B; }
    .bg-paper { background-color: #F7F0E3; }
    .bg-coral { background-color: #D9482B; color: #FFFFFF; }
    .bg-sky { background-color: #A9D4E8; }
    .bg-sage { background-color: #9CC5A1; }
    .bg-dark { background-color: #231F20; color: #FFFFFF; }

    /* Cover Page */
    .cover {
      min-height: 240mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3.5px solid #231F20;
      border-radius: 12px;
      padding: 30pt;
      background: #F7F0E3;
      box-shadow: 6px 6px 0px #231F20;
      position: relative;
    }

    .cover-badge {
      display: inline-block;
      align-self: flex-start;
      background-color: #231F20;
      color: #F7F0E3;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 4pt 10pt;
      border-radius: 4px;
      margin-bottom: 15pt;
    }

    .cover-title-group {
      margin-top: 15pt;
    }

    .cover-tagline {
      font-family: 'Caveat', cursive;
      font-size: 20pt;
      color: #D9482B;
      font-weight: 700;
      margin-bottom: 4pt;
    }

    .cover-title {
      font-size: 34pt;
      line-height: 1.05;
      color: #231F20;
      margin-bottom: 12pt;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #3D3638;
      max-width: 480pt;
      line-height: 1.45;
      font-weight: 500;
      margin-bottom: 25pt;
    }

    .cover-features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12pt;
      margin-top: 20pt;
    }

    .cover-feature-card {
      background: #FFFFFF;
      border: 2px solid #231F20;
      border-radius: 8px;
      padding: 10pt 12pt;
      box-shadow: 3px 3px 0px #231F20;
    }

    .cover-feature-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 2pt;
      color: #231F20;
    }

    .cover-feature-desc {
      font-size: 8.5pt;
      color: #4A4244;
      margin: 0;
      line-height: 1.35;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 2px dashed #231F20;
      padding-top: 15pt;
      margin-top: 20pt;
    }

    .cover-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #3D3638;
      line-height: 1.5;
    }

    /* Callout & Alert Boxes */
    .callout {
      border: 2px solid #231F20;
      border-radius: 8px;
      padding: 8pt 12pt;
      margin: 8pt 0 12pt 0;
      background: #F7F0E3;
      box-shadow: 2.5px 2.5px 0px #231F20;
      break-inside: avoid;
    }

    .callout-title {
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 700;
      font-size: 10.5pt;
      margin-bottom: 2pt;
      display: flex;
      align-items: center;
      gap: 6pt;
    }

    .callout-coral { background: #FDEEEB; border-color: #D9482B; box-shadow: 2.5px 2.5px 0px #D9482B; }
    .callout-coral .callout-title { color: #D9482B; }

    .callout-yellow { background: #FEF8EC; border-color: #231F20; }
    .callout-yellow .callout-title { color: #8C5E00; }

    .callout-sage { background: #F2F8F3; border-color: #2E6B39; box-shadow: 2.5px 2.5px 0px #2E6B39; }
    .callout-sage .callout-title { color: #2E6B39; }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0 14pt 0;
      font-size: 8.5pt;
      border: 2px solid #231F20;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 2.5px 2.5px 0px #231F20;
      break-inside: avoid;
    }

    table.data-table th {
      background: #231F20;
      color: #FFFFFF;
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 700;
      font-size: 9pt;
      text-align: left;
      padding: 6pt 8pt;
      border: 1px solid #231F20;
    }

    table.data-table td {
      padding: 5pt 8pt;
      border: 1px solid #D5CBB8;
      vertical-align: top;
    }

    table.data-table tr:nth-child(even) td {
      background-color: #FAF6EF;
    }

    /* Badges */
    .badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1.5pt 5pt;
      border-radius: 999px;
      border: 1.5px solid #231F20;
      white-space: nowrap;
    }

    .badge-open { background: #F7F0E3; color: #231F20; }
    .badge-lost { background: #F2B84B; color: #231F20; }
    .badge-found { background: #9CC5A1; color: #231F20; }
    .badge-returned { background: #A9D4E8; color: #231F20; }
    .badge-claim { background: #F9D3C7; color: #D9482B; border-color: #D9482B; }
    .badge-admin { background: #231F20; color: #FFFFFF; }

    /* Workflow Step Boxes */
    .step-flow {
      display: flex;
      flex-direction: column;
      gap: 8pt;
      margin: 10pt 0 14pt 0;
    }

    .step-card {
      display: flex;
      gap: 12pt;
      background: #FFFFFF;
      border: 2px solid #231F20;
      border-radius: 8px;
      padding: 8pt 12pt;
      box-shadow: 2.5px 2.5px 0px #231F20;
      break-inside: avoid;
    }

    .step-number-box {
      width: 28pt;
      height: 28pt;
      border-radius: 6pt;
      background: #F2B84B;
      border: 2px solid #231F20;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 800;
      font-size: 12pt;
      color: #231F20;
      flex-shrink: 0;
      box-shadow: 1.5px 1.5px 0px #231F20;
    }

    .step-content {
      flex: 1;
    }

    .step-header {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 10.5pt;
      font-weight: 700;
      margin-bottom: 2pt;
      color: #231F20;
    }

    .step-desc {
      font-size: 8.5pt;
      color: #3D3638;
      margin: 0;
      line-height: 1.4;
    }

    /* Diagram / Flowchart boxes */
    .flowchart-container {
      background: #F7F0E3;
      border: 2px solid #231F20;
      border-radius: 8px;
      padding: 12pt;
      margin: 10pt 0 14pt 0;
      box-shadow: 3px 3px 0px #231F20;
      break-inside: avoid;
    }

    .flowchart-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Checklists */
    ul.checklist {
      list-style: none;
      padding-left: 0;
      margin: 6pt 0 10pt 0;
    }

    ul.checklist li {
      position: relative;
      padding-left: 18pt;
      margin-bottom: 4pt;
      font-size: 9pt;
      line-height: 1.4;
    }

    ul.checklist li::before {
      content: "[x]";
      position: absolute;
      left: 0;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 8pt;
      color: #2E6B39;
    }

    /* Two column grid */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12pt;
      margin: 8pt 0 12pt 0;
    }

    .header-rule {
      height: 2px;
      background: #231F20;
      margin: 4pt 0 12pt 0;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover page-break">
    <div>
      <div class="cover-badge">Official System Documentation &amp; Operational Guide</div>
      <div class="cover-title-group">
        <div class="cover-tagline">for students &amp; campus staff</div>
        <h1 class="cover-title">Campus Lost &amp; Found</h1>
        <p class="cover-subtitle">
          The verified college board for reporting lost belongings, returning found items safely, and protecting campus community members from fraud and spam.
        </p>
      </div>

      <div class="cover-features-grid">
        <div class="cover-feature-card">
          <div class="cover-feature-title">Student Operations Guide</div>
          <p class="cover-feature-desc">
            Complete walkthrough for ID verification, reporting lost articles, logging found items with secret questions, and executing the 6-digit handover OTP.
          </p>
        </div>
        <div class="cover-feature-card">
          <div class="cover-feature-title">Admin Moderator Desk</div>
          <p class="cover-feature-desc">
            Standard Operating Procedures (SOPs) for student ID approvals, content takedowns, disciplinary actions, fraud reports, and automated maintenance jobs.
          </p>
        </div>
        <div class="cover-feature-card">
          <div class="cover-feature-title">3-Step Verification Protocol</div>
          <p class="cover-feature-desc">
            Comprehensive lifecycle flowcharts demonstrating the end-to-end journey from initial claim to final in-person code verification at designated safe spots.
          </p>
        </div>
        <div class="cover-feature-card">
          <div class="cover-feature-title">Security &amp; Privacy Architecture</div>
          <p class="cover-feature-desc">
            Authenticated private ID storage, encrypted student records, anti-scam secret question defense, and rate-limited API protection.
          </p>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div class="cover-meta">
        <strong>Document ID:</strong> DOC-CLF-2026-V1<br>
        <strong>Author:</strong> Campus Safety &amp; Systems Team<br>
        <strong>Applicability:</strong> Campus Students, Security Staff, System Administrators
      </div>
      <div class="cover-meta" style="text-align: right;">
        <strong>Version:</strong> 1.0.0 (Production Release)<br>
        <strong>Effective Date:</strong> November 2026<br>
        <strong>Classification:</strong> Campus Public Operational Guide
      </div>
    </div>
  </div>

  <!-- ==================== TABLE OF CONTENTS & EXECUTIVE SUMMARY ==================== -->
  <div>
    <h2>1. Executive Summary &amp; System Architecture</h2>
    <p>
      The <strong>Campus Lost &amp; Found</strong> platform is a purpose-built, verified bulletin board designed specifically for college campuses. It eliminates the chaos, spam, and fraud typical of unverified social media groups (e.g. WhatsApp, Facebook, Telegram) by enforcing institutional identity verification, private question proof-of-ownership, and in-person cryptographic code validation.
    </p>

    <div class="callout callout-yellow">
      <div class="callout-title">Core Security Philosophy: Zero Public PII &amp; Zero Spam</div>
      <p style="margin: 0; font-size: 8.5pt;">
        Student ID card images are <strong>strictly private</strong> and accessible only to institutional administrators via authenticated streams. Furthermore, found items utilize a <strong>private question challenge</strong> so that claim details are never broadcasted publicly, completely eliminating false claims.
      </p>
    </div>

    <h3>User Roles &amp; Permissions Matrix</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>User Role</th>
          <th>Account Status</th>
          <th>Feed &amp; Search Access</th>
          <th>Posting &amp; Claiming</th>
          <th>Chat &amp; Messaging</th>
          <th>Administrative Rights</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Guest (Public)</strong></td>
          <td>Unauthenticated</td>
          <td>View public feed &amp; post details</td>
          <td>None (Must register/sign in)</td>
          <td>None</td>
          <td>None</td>
        </tr>
        <tr>
          <td><strong>Pending Student</strong></td>
          <td><span class="badge badge-open">PENDING_VERIFICATION</span></td>
          <td>View feed &amp; search</td>
          <td>Blocked pending ID card review</td>
          <td>Blocked</td>
          <td>None</td>
        </tr>
        <tr>
          <td><strong>Verified Student</strong></td>
          <td><span class="badge badge-found">VERIFIED</span></td>
          <td>Full search &amp; filter access</td>
          <td>Post Lost/Found, submit claims</td>
          <td>1-on-1 private chat with claimants</td>
          <td>None</td>
        </tr>
        <tr>
          <td><strong>Rejected Student</strong></td>
          <td><span class="badge badge-claim">REJECTED</span></td>
          <td>View feed</td>
          <td>Blocked (Must re-upload ID)</td>
          <td>Blocked</td>
          <td>None</td>
        </tr>
        <tr>
          <td><strong>Campus Administrator</strong></td>
          <td><span class="badge badge-admin">ADMIN</span></td>
          <td>Unrestricted access</td>
          <td>Unrestricted post &amp; claim access</td>
          <td>Moderator oversight chat</td>
          <td>Full Moderator Desk, ID approval, takedowns</td>
        </tr>
      </tbody>
    </table>

    <h3>Platform Design Tokens (The Notice Board Aesthetic)</h3>
    <ul class="checklist">
      <li><strong>Border Integrity:</strong> Bold 2.5px solid ink borders (<code>#231F20</code>) provide high-contrast legibility across all lighting environments.</li>
      <li><strong>Hard Drop Shadows:</strong> Tactile 3px to 4px hard drop shadows (<code>shadow-hard-btn</code>, <code>shadow-hard-card</code>) reinforce physical notice board depth.</li>
      <li><strong>Accessible Touch Targets:</strong> All buttons and interactive inputs enforce a minimum 44px touch target on mobile viewports.</li>
      <li><strong>Zero Emojis:</strong> Visual iconography is exclusively powered by vector Lucide line icons with consistent 2.5px stroke weight for institutional clarity.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- ==================== STUDENT USER GUIDE ==================== -->
  <div>
    <h2>2. Student User Guide &amp; Core Workflows</h2>
    <p>
      This section details the end-to-end journey for enrolled campus students, from account onboarding to safe recovery of lost possessions.
    </p>

    <h3>2.1 Account Registration &amp; Student ID Verification</h3>
    <p>
      To maintain platform safety, every student must register using their official college email address and upload an authentic photograph of their physical student ID card.
    </p>

    <div class="step-flow">
      <div class="step-card">
        <div class="step-number-box">1</div>
        <div class="step-content">
          <div class="step-header">Submit Registration Details</div>
          <p class="step-desc">
            Navigate to <code>/register</code>. Enter Full Name, Official College Email (e.g. <code>student@college.edu</code>), Roll Number, Academic Department, Study Year (1st–4th), and secure Password.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">2</div>
        <div class="step-content">
          <div class="step-header">Upload College ID Card Photograph</div>
          <p class="step-desc">
            Upload a clear, legible photo of the front of your student ID card. The browser automatically compresses and optimizes the image locally prior to transmission.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">3</div>
        <div class="step-content">
          <div class="step-header">Administrative Review Queue</div>
          <p class="step-desc">
            Your account is set to <code>PENDING_VERIFICATION</code>. A designated campus administrator reviews your credentials by hand. You receive an in-app notification once verified.
          </p>
        </div>
      </div>
    </div>

    <h3>2.2 Reporting a LOST Item</h3>
    <p>
      If you misplace an item on campus, report it immediately to generate an indexed card on the community board:
    </p>
    <ul class="checklist">
      <li>Click <strong>"+ Post item"</strong> and select post type <strong>"I LOST an item"</strong>.</li>
      <li><strong>Title:</strong> Keep it concise and specific (e.g., <em>"Navy Blue Dell Laptop Charger (65W)"</em>).</li>
      <li><strong>Category:</strong> Select from Electronics, ID Cards, Books, Keys, Bags, Clothing, Wallets, or Other.</li>
      <li><strong>Campus Location:</strong> Choose the primary landmark (Library, Canteen, Block A/B/C, Sports Ground, Auditorium, Hostels, Main Gate, Parking).</li>
      <li><strong>Location Details:</strong> Mention specific desk, floor, or room (e.g., <em>"2nd Floor Reading Hall, Desk 14"</em>).</li>
      <li><strong>Date &amp; Time:</strong> Provide the approximate date and time the item was misplaced.</li>
      <li><strong>Photographs:</strong> Attach up to 4 clear reference photos if you have pictures of your item.</li>
    </ul>

    <h3>2.3 Reporting a FOUND Item (Anti-Fraud Secret Question Protocol)</h3>
    <p>
      When you pick up an unattended belonging on campus, you are the designated finder. To prevent opportunistic false claims, you can enable a <strong>Private Secret Question</strong>:
    </p>

    <div class="callout callout-sage">
      <div class="callout-title">How the Secret Question Protects the Finder &amp; Owner</div>
      <p style="margin: 0; font-size: 8.5pt;">
        <strong>Finder posts:</strong> <em>"Found a Black Leather Bifold Wallet near Main Gate."</em><br>
        <strong>Secret Question:</strong> <em>"What brand or distinct logo is embossed on the inner coin pocket?"</em><br>
        <strong>Secret Answer (Stored privately):</strong> <em>"Woodland logo with two Metro cards inside."</em><br>
        <em>Only the genuine owner knows what is hidden inside. Claimants must answer this question during claim submission.</em>
      </p>
    </div>

    <h3>2.4 Submitting an Ownership Claim</h3>
    <p>
      If you spot your lost item on the feed with a green <span class="badge badge-found">FOUND</span> badge:
    </p>
    <div class="step-flow">
      <div class="step-card">
        <div class="step-number-box">A</div>
        <div class="step-content">
          <div class="step-header">Click "Claim This Item"</div>
          <p class="step-desc">
            Open the post page. Verified students can click the primary action button to open the claim modal.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">B</div>
        <div class="step-content">
          <div class="step-header">Provide Ownership Evidence &amp; Answer Question</div>
          <p class="step-desc">
            Explain unique identifiers (scratches, stickers, contents) not visible in the public photos. If a Secret Question is present, provide your exact answer.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">C</div>
        <div class="step-content">
          <div class="step-header">Upload Proof Photograph (Optional)</div>
          <p class="step-desc">
            Attach an old photo of you with the item, a purchase receipt, or serial number document. Proof photos are kept private between you and the finder.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== THE 3-STEP HANDOVER PROTOCOL ==================== -->
  <div>
    <h2>3. The 3-Step Verification &amp; Safe Handover Protocol</h2>
    <p>
      To eliminate awkward encounters, disputes, and mistaken identities, the platform enforces an automated <strong>6-digit cryptographic handover OTP</strong> protocol.
    </p>

    <div class="flowchart-container">
      <svg class="flowchart-svg" viewBox="0 0 680 180" xmlns="http://www.w3.org/2000/svg">
        <!-- Step 1 Box -->
        <rect x="10" y="20" width="190" height="140" rx="8" fill="#FFFFFF" stroke="#231F20" stroke-width="2.5" />
        <rect x="20" y="10" width="60" height="20" rx="4" fill="#F2B84B" stroke="#231F20" stroke-width="2" />
        <text x="50" y="24" font-family="Fraunces, serif" font-weight="700" font-size="10" text-anchor="middle" fill="#231F20">STEP 01</text>
        <text x="25" y="55" font-family="Fraunces, serif" font-weight="700" font-size="13" fill="#231F20">Claim Review</text>
        <text x="25" y="75" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">Finder reviews claimant's</text>
        <text x="25" y="90" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">proof &amp; secret answer.</text>
        <text x="25" y="115" font-family="Inter, sans-serif" font-size="8.5" fill="#2E6B39" font-weight="bold">&#10003; Finder Clicks "Approve"</text>
        <text x="25" y="130" font-family="Inter, sans-serif" font-size="8" fill="#666">Other claims auto-held</text>

        <!-- Arrow 1 -->
        <g transform="translate(210, 80)">
          <path d="M 0 10 L 25 10 L 25 4 L 40 15 L 25 26 L 25 20 L 0 20 Z" fill="#F2B84B" stroke="#231F20" stroke-width="2" />
        </g>

        <!-- Step 2 Box -->
        <rect x="260" y="20" width="190" height="140" rx="8" fill="#FFFFFF" stroke="#231F20" stroke-width="2.5" />
        <rect x="270" y="10" width="60" height="20" rx="4" fill="#F2B84B" stroke="#231F20" stroke-width="2" />
        <text x="300" y="24" font-family="Fraunces, serif" font-weight="700" font-size="10" text-anchor="middle" fill="#231F20">STEP 02</text>
        <text x="275" y="55" font-family="Fraunces, serif" font-weight="700" font-size="13" fill="#231F20">OTP Generated</text>
        <text x="275" y="75" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">System issues 6-digit OTP</text>
        <text x="275" y="90" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">exclusively to the claimant.</text>
        <rect x="275" y="105" width="90" height="26" rx="4" fill="#FFF8DC" stroke="#231F20" stroke-width="1.5" />
        <text x="320" y="122" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle" fill="#231F20">482917</text>
        <text x="275" y="145" font-family="Inter, sans-serif" font-size="7.5" fill="#D9482B">Chat opens for meeting spot</text>

        <!-- Arrow 2 -->
        <g transform="translate(460, 80)">
          <path d="M 0 10 L 25 10 L 25 4 L 40 15 L 25 26 L 25 20 L 0 20 Z" fill="#F2B84B" stroke="#231F20" stroke-width="2" />
        </g>

        <!-- Step 3 Box -->
        <rect x="510" y="20" width="160" height="140" rx="8" fill="#FFFFFF" stroke="#231F20" stroke-width="2.5" />
        <rect x="520" y="10" width="60" height="20" rx="4" fill="#F2B84B" stroke="#231F20" stroke-width="2" />
        <text x="550" y="24" font-family="Fraunces, serif" font-weight="700" font-size="10" text-anchor="middle" fill="#231F20">STEP 03</text>
        <text x="525" y="55" font-family="Fraunces, serif" font-weight="700" font-size="13" fill="#231F20">Handover Verified</text>
        <text x="525" y="75" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">Parties meet at Security.</text>
        <text x="525" y="90" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">Owner gives 6-digit code.</text>
        <text x="525" y="110" font-family="Inter, sans-serif" font-size="8.5" fill="#3D3638">Finder enters in app.</text>
        <text x="525" y="135" font-family="Fraunces, serif" font-weight="700" font-size="10" fill="#2E6B39">&#9989; Post = RETURNED</text>
      </svg>
    </div>

    <h3>Detailed Procedural Steps:</h3>
    <div class="two-col">
      <div class="callout callout-yellow" style="margin: 0;">
        <div class="callout-title">For the Finder (Item Custodian)</div>
        <p style="font-size: 8.5pt;">
          1. Go to <strong>"My Posts"</strong> and open your listed item.<br>
          2. Click the <strong>"Claims"</strong> tab to see all submitted ownership claims.<br>
          3. Read the description and answer. If confident, click <strong>"Approve Claim"</strong>.<br>
          4. If uncertain, click <strong>"Request More Info"</strong> to start an instant 1-on-1 chat.<br>
          5. Meet the claimant at a designated safe campus spot.<br>
          6. Ask the claimant for their <strong>6-digit code</strong>.<br>
          7. Enter the code in the prompt and click <strong>"Confirm Handover"</strong>.
        </p>
      </div>

      <div class="callout callout-sage" style="margin: 0;">
        <div class="callout-title">For the Owner (Item Claimant)</div>
        <p style="font-size: 8.5pt;">
          1. Once the finder approves your claim, you receive an instant alert.<br>
          2. Navigate to <strong>"My Claims"</strong>.<br>
          3. Your active card displays your unique <strong>6-Digit Handover Code</strong>.<br>
          4. Use the in-app chat to coordinate a safe meeting time.<br>
          5. Meet at the <strong>Campus Security Office</strong> or <strong>Central Library Counter</strong>.<br>
          6. Inspect your item and verbally communicate your 6-digit code.<br>
          7. Once the finder inputs it, your item is recorded as <strong>RETURNED</strong>.
        </p>
      </div>
    </div>

    <div class="callout callout-coral">
      <div class="callout-title">Mandatory Campus Handover Safety Rule</div>
      <p style="margin: 0; font-size: 8.5pt;">
        Never meet in isolated areas, private vehicles, or outside campus boundaries. Handovers must always occur during operational daylight hours at official campus control points: <strong>Campus Security Office (Main Gate)</strong>, <strong>Central Library Circulation Desk</strong>, or <strong>Department HOD Reception</strong>.
      </p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== ADMINISTRATOR GUIDE ==================== -->
  <div>
    <h2>4. Administrator Guide &amp; Moderator Desk</h2>
    <p>
      Institutional administrators have full governance over identity verification, content moderation, fraud dispute resolution, and system audit trails. The Moderator Desk is located at <code>/admin</code>.
    </p>

    <h3>4.1 Dashboard Overview &amp; Live Campus Metrics</h3>
    <p>
      The Admin Overview screen aggregates live metrics across campus:
    </p>
    <ul class="checklist">
      <li><strong>Pending Verifications:</strong> Student ID cards awaiting human review.</li>
      <li><strong>Active Lost Items:</strong> Open inquiries currently broadcasted across campus.</li>
      <li><strong>Active Found Items:</strong> Items in safe custody awaiting claims.</li>
      <li><strong>Resolved Handovers:</strong> Successfully closed handovers verified via 6-digit OTP.</li>
      <li><strong>Abuse Reports:</strong> Community flags requiring moderator adjudication.</li>
      <li><strong>Storage Footprint:</strong> Real-time aggregate count and disk size of all encrypted item and ID images.</li>
    </ul>

    <h3>4.2 Student ID Verification Standard Operating Procedure (SOP)</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Inspection Checkpoint</th>
          <th>Acceptance Criteria</th>
          <th>Action on Failure</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Roll Number Matching</strong></td>
          <td>Must match college database directory format exactly.</td>
          <td>Reject with reason: <em>"Invalid Roll Number format"</em></td>
        </tr>
        <tr>
          <td><strong>Full Name &amp; Photo</strong></td>
          <td>Legible photo, clear name matching college records.</td>
          <td>Reject with reason: <em>"Photograph blurred/unreadable"</em></td>
        </tr>
        <tr>
          <td><strong>Institutional Email</strong></td>
          <td>Must possess the official <code>@college.edu</code> domain.</td>
          <td>Account flagged / Suspended</td>
        </tr>
        <tr>
          <td><strong>Card Validity Period</strong></td>
          <td>Card must be active and not expired.</td>
          <td>Reject with reason: <em>"Expired college ID card"</em></td>
        </tr>
      </tbody>
    </table>

    <div class="two-col">
      <div class="callout callout-sage" style="margin: 0;">
        <div class="callout-title">To APPROVE a Student:</div>
        <p style="font-size: 8.5pt; margin: 0;">
          1. Go to <code>/admin/students</code>.<br>
          2. Click student row to open ID inspection modal.<br>
          3. Inspect the authenticated ID image stream.<br>
          4. Click <strong>"Approve Verification"</strong>.<br>
          5. Student status changes to <code>VERIFIED</code>; notification sent immediately.
        </p>
      </div>

      <div class="callout callout-coral" style="margin: 0;">
        <div class="callout-title">To REJECT a Student:</div>
        <p style="font-size: 8.5pt; margin: 0;">
          1. Click <strong>"Reject ID"</strong>.<br>
          2. Select or enter actionable rejection feedback (e.g. <em>"Name blurred, please re-upload in good lighting"</em>).<br>
          3. Click <strong>"Confirm Rejection"</strong>.<br>
          4. Student receives alert with a direct re-upload link.
        </p>
      </div>
    </div>

    <h3>4.3 Post Moderation &amp; Content Takedowns</h3>
    <p>
      Administrators can intervene on any campus post via <code>/admin/posts</code>:
    </p>
    <ul class="checklist">
      <li><strong>TAKEDOWN (Soft Remove):</strong> Immediately sets post status to <code>CLOSED</code>, removes it from public search and feeds, and notifies the author with an administrative explanation.</li>
      <li><strong>RESTORE:</strong> Unhides a previously taken-down or auto-hidden post and returns status to <code>OPEN</code>.</li>
      <li><strong>DELETE (Hard Purge):</strong> Permanently deletes the post and all associated claim records from the database (reserved for severe legal or policy violations).</li>
    </ul>

    <h3>4.4 Handling Abuse Reports &amp; Fraud Queue</h3>
    <p>
      When students click "Report Post", the inquiry enters <code>/admin/reports</code>:
    </p>
    <div class="step-flow">
      <div class="step-card">
        <div class="step-number-box">1</div>
        <div class="step-content">
          <div class="step-header">Inspect Allegation &amp; Evidence</div>
          <p class="step-desc">
            Review the reporter's statement, reported category (Spam, False Claim, Harassment, Inappropriate Item), and direct link to the offending card.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">2</div>
        <div class="step-content">
          <div class="step-header">Take Disciplinary Action</div>
          <p class="step-desc">
            Admins can simultaneously take down the post, dismiss false reports, or click <strong>"Disable User"</strong> to lock the offending student's credentials.
          </p>
        </div>
      </div>
      <div class="step-card">
        <div class="step-number-box">3</div>
        <div class="step-content">
          <div class="step-header">Log Resolution Summary</div>
          <p class="step-desc">
            Record administrative notes (e.g. <em>"Spam seller account banned, post purged"</em>). The report status updates to <code>ACTIONED</code> in the permanent audit trail.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== COMPLETE SYSTEM FLOWCHARTS ==================== -->
  <div>
    <h2>5. Complete End-to-End System Flowcharts</h2>
    <p>
      The following diagrams summarize the complete logic flow of the application across frontend client interactions and backend database state transitions.
    </p>

    <h3>5.1 Overall User &amp; Verification Journey</h3>
    <div class="flowchart-container">
      <svg class="flowchart-svg" viewBox="0 0 680 150" xmlns="http://www.w3.org/2000/svg">
        <!-- Start -->
        <circle cx="35" cy="75" r="22" fill="#231F20" />
        <text x="35" y="79" font-family="Inter, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#FFFFFF">START</text>

        <!-- Arrow -->
        <line x1="57" y1="75" x2="85" y2="75" stroke="#231F20" stroke-width="2" marker-end="url(#arrow)" />

        <!-- Register -->
        <rect x="85" y="45" width="105" height="60" rx="6" fill="#FFFFFF" stroke="#231F20" stroke-width="2" />
        <text x="137" y="72" font-family="Fraunces, serif" font-weight="700" font-size="10" text-anchor="middle" fill="#231F20">Student Register</text>
        <text x="137" y="87" font-family="Inter, sans-serif" font-size="7.5" text-anchor="middle" fill="#666">Uploads ID Card</text>

        <!-- Arrow -->
        <line x1="190" y1="75" x2="225" y2="75" stroke="#231F20" stroke-width="2" />

        <!-- Admin Decision Diamond -->
        <polygon points="265,40 310,75 265,110 220,75" fill="#FFF8DC" stroke="#231F20" stroke-width="2" />
        <text x="265" y="72" font-family="Fraunces, serif" font-weight="700" font-size="9" text-anchor="middle" fill="#231F20">Admin</text>
        <text x="265" y="83" font-family="Fraunces, serif" font-weight="700" font-size="9" text-anchor="middle" fill="#231F20">Review</text>

        <!-- Reject branch -->
        <line x1="265" y1="40" x2="265" y2="18" stroke="#D9482B" stroke-width="2" />
        <line x1="265" y1="18" x2="137" y2="18" stroke="#D9482B" stroke-width="2" />
        <line x1="137" y1="18" x2="137" y2="45" stroke="#D9482B" stroke-width="2" />
        <text x="200" y="14" font-family="JetBrains Mono, monospace" font-size="7.5" font-weight="bold" fill="#D9482B">REJECT (Re-upload)</text>

        <!-- Approve branch -->
        <line x1="310" y1="75" x2="350" y2="75" stroke="#2E6B39" stroke-width="2" />
        <text x="330" y="68" font-family="JetBrains Mono, monospace" font-size="7.5" font-weight="bold" fill="#2E6B39">APPROVE</text>

        <!-- Verified State -->
        <rect x="350" y="45" width="115" height="60" rx="6" fill="#9CC5A1" stroke="#231F20" stroke-width="2" />
        <text x="407" y="72" font-family="Fraunces, serif" font-weight="700" font-size="10.5" text-anchor="middle" fill="#231F20">Account Verified</text>
        <text x="407" y="87" font-family="Inter, sans-serif" font-size="7.5" text-anchor="middle" fill="#231F20">Full Platform Access</text>

        <!-- Arrow -->
        <line x1="465" y1="75" x2="505" y2="75" stroke="#231F20" stroke-width="2" />

        <!-- Actions -->
        <rect x="505" y="30" width="160" height="90" rx="6" fill="#FFFFFF" stroke="#231F20" stroke-width="2" />
        <text x="585" y="52" font-family="Fraunces, serif" font-weight="700" font-size="10" text-anchor="middle" fill="#231F20">Active Student Rights</text>
        <text x="520" y="70" font-family="Inter, sans-serif" font-size="7.5" fill="#3D3638">&#8226; Post Lost &amp; Found Items</text>
        <text x="520" y="84" font-family="Inter, sans-serif" font-size="7.5" fill="#3D3638">&#8226; Submit Ownership Claims</text>
        <text x="520" y="98" font-family="Inter, sans-serif" font-size="7.5" fill="#3D3638">&#8226; 1-on-1 Messages &amp; 6-Digit OTP</text>
        <text x="520" y="112" font-family="Inter, sans-serif" font-size="7.5" fill="#3D3638">&#8226; Post Comments &amp; Alerts</text>
      </svg>
    </div>

    <h3>5.2 Found Item Claim, Secret Question &amp; Handover State Machine</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>State / Stage</th>
          <th>Trigger Event</th>
          <th>Post Status</th>
          <th>Claim Status</th>
          <th>Security Controls Enforced</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Open Broadcast</strong></td>
          <td>Finder submits post</td>
          <td><span class="badge badge-open">OPEN</span></td>
          <td>N/A</td>
          <td>Secret Answer stored securely; question visible publicly.</td>
        </tr>
        <tr>
          <td><strong>2. Claim Submitted</strong></td>
          <td>Claimant files claim</td>
          <td><span class="badge badge-open">OPEN</span></td>
          <td><span class="badge badge-claim">PENDING</span></td>
          <td>Claim limit enforced (max 10/day). Proof photo encrypted.</td>
        </tr>
        <tr>
          <td><strong>3. Claim Approved</strong></td>
          <td>Finder clicks "Approve"</td>
          <td><span class="badge badge-found">CLAIM_IN_PROGRESS</span></td>
          <td><span class="badge badge-returned">APPROVED</span></td>
          <td>System creates 6-digit random code; 7-day expiration clock starts.</td>
        </tr>
        <tr>
          <td><strong>4. In-App Chat</strong></td>
          <td>Approval or More Info</td>
          <td><span class="badge badge-found">CLAIM_IN_PROGRESS</span></td>
          <td><span class="badge badge-returned">APPROVED</span></td>
          <td>Direct SWR polling 1-to-1 conversation; coordinates meeting spot.</td>
        </tr>
        <tr>
          <td><strong>5. In-Person Handover</strong></td>
          <td>Finder enters 6-digit OTP</td>
          <td><span class="badge badge-returned">RETURNED</span></td>
          <td><span class="badge badge-returned">COMPLETED</span></td>
          <td>Database transaction marks item returned; permanent audit log recorded.</td>
        </tr>
        <tr>
          <td><strong>6. Stale Expiration</strong></td>
          <td>72h-7d Inactive Handover</td>
          <td><span class="badge badge-open">OPEN</span></td>
          <td><span class="badge badge-claim">EXPIRED</span></td>
          <td>Vercel Cron resets post back to OPEN for other claimants.</td>
        </tr>
      </tbody>
    </table>

    <h3>5.3 Automated Background Jobs (Vercel Cron)</h3>
    <ul class="checklist">
      <li><strong>Handover Expiration Cron (<code>/api/cron/expire-handovers</code>):</strong> Runs daily at 02:00 AM. Scans for claims in <code>APPROVED</code> status exceeding their 7-day deadline without OTP verification, automatically returning the post to <code>OPEN</code> so other claimants can recover the item.</li>
      <li><strong>Notification Pruning Cron (<code>/api/cron/cleanup-notifications</code>):</strong> Runs daily at 02:30 AM. Purges read notifications older than 30 days to optimize database performance.</li>
      <li><strong>Webhook Security:</strong> All automated endpoints require an authorized <code>CRON_SECRET</code> bearer token header, returning <code>401 Unauthorized</code> on unauthenticated requests.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- ==================== SECURITY, PRIVACY & FAQ ==================== -->
  <div>
    <h2>6. Security, Privacy &amp; Frequently Asked Questions</h2>

    <h3>6.1 Security &amp; Privacy Architecture</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Asset / Feature</th>
          <th>Public Visibility</th>
          <th>Storage &amp; Streaming Security</th>
          <th>Access Control Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Student ID Card Photos</strong></td>
          <td>NEVER Public</td>
          <td>Encrypted on disk; streamed via authenticated route</td>
          <td>Owner &amp; Verified Admin only (403 Forbidden otherwise)</td>
        </tr>
        <tr>
          <td><strong>Secret Question Answer</strong></td>
          <td>NEVER Public</td>
          <td>Encrypted database field; never sent in JSON payload</td>
          <td>Finder &amp; Verified Admin only</td>
        </tr>
        <tr>
          <td><strong>Claim Proof Photographs</strong></td>
          <td>NEVER Public</td>
          <td>Private authenticated asset</td>
          <td>Claimant, Post Author &amp; Admin only</td>
        </tr>
        <tr>
          <td><strong>Post Photographs</strong></td>
          <td>Public on Feed</td>
          <td>Web-optimized JPEG thumbnails &amp; full viewer</td>
          <td>Publicly accessible without login</td>
        </tr>
        <tr>
          <td><strong>6-Digit Handover Code</strong></td>
          <td>Private to Owner</td>
          <td>Stored in claim record; verified in atomic transaction</td>
          <td>Revealed exclusively to approved claimant</td>
        </tr>
      </tbody>
    </table>

    <h3>6.2 Frequently Asked Questions (FAQ)</h3>

    <div class="callout callout-yellow">
      <div class="callout-title">Q: What happens if an admin rejects my student ID card?</div>
      <p style="margin: 0; font-size: 8.5pt;">
        <strong>A:</strong> You will receive an immediate in-app notification stating the exact reason (e.g., <em>"Card photo blurred"</em> or <em>"Roll number does not match"</em>). Simply navigate to <code>/verify-pending</code> and re-upload a crisp, high-resolution photo in good lighting.
      </p>
    </div>

    <div class="callout callout-sage">
      <div class="callout-title">Q: Can multiple students claim the same found item?</div>
      <p style="margin: 0; font-size: 8.5pt;">
        <strong>A:</strong> Yes. Multiple students can submit ownership claims. The finder reviews all submitted evidence and secret answers in their <strong>"Claims"</strong> tab. Once the finder approves the genuine owner, other pending claims are placed on hold. If the handover expires or is cancelled, the other claims can be reviewed.
      </p>
    </div>

    <div class="callout callout-coral">
      <div class="callout-title">Q: What if the claimant does not have their 6-digit code at the meeting?</div>
      <p style="margin: 0; font-size: 8.5pt;">
        <strong>A:</strong> <strong>Do not hand over the item without the code.</strong> The claimant can view their 6-digit code at any time by logging into their account on their phone and opening <strong>"My Claims"</strong>. Entering the code protects both parties and provides indisputable proof of handover.
      </p>
    </div>

    <div class="callout callout-yellow">
      <div class="callout-title">Q: How do rate limits protect the campus network?</div>
      <p style="margin: 0; font-size: 8.5pt;">
        <strong>A:</strong> The platform applies sliding-window rate limiters via Redis: maximum 5 registrations per hour per IP, 10 post creations per hour, and 10 claims per day. This prevents malicious spamming or bot scraping of campus items.
      </p>
    </div>

    <div style="border-top: 2px solid #231F20; padding-top: 10pt; margin-top: 15pt; display: flex; justify-content: space-between; font-size: 8pt; color: #4A4244;">
      <span>Campus Lost &amp; Found Platform &bull; Official Operational Manual</span>
      <span>Published for Campus Students &amp; Administration &bull; Version 1.0</span>
    </div>
  </div>

</body>
</html>
  `;

  const outputPath = path.join(process.cwd(), "public", "Campus_Lost_and_Found_Manual.pdf");
  const rootOutputPath = path.join(process.cwd(), "Campus_Lost_and_Found_Manual.pdf");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  console.log("Rendering PDF with Chrome print engine...");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "12mm",
      right: "12mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 7.5pt; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #777; padding: 0 12mm; display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
        <span>Campus Lost & Found Platform — Operational Manual</span>
        <span>Confidential & Internal Campus Guide</span>
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; font-size: 7.5pt; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #777; padding: 0 12mm; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 4px;">
        <span>Version 1.0.0 &bull; November 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();

  // Copy to root as well for convenience
  fs.copyFileSync(outputPath, rootOutputPath);

  const stats = fs.statSync(outputPath);
  console.log(`PDF successfully created! Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`Saved to: ${outputPath} and ${rootOutputPath}`);
}

generatePdf().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
