// ============================================================
// YSA 5th Annual Youth STEM Summit — RSVP Confirmation Script
// Paste this in Google Apps Script (script.google.com)
// Linked to your RSVP Google Form/Sheet
// ============================================================

// ⚙️ CONFIGURATION — update these to match your form field names exactly
const CONFIG = {
  NAME_FIELD: "Full Name",           // Question label in your form
  EMAIL_FIELD: "Email Address",      // Only needed if NOT using Google's built-in email collection
  GUESTS_FIELD: "How many guests are you bringing?",
  SUMMIT_DATE: "Saturday, July 12, 2026",
  SUMMIT_LOCATION: "Toronto, Ontario",
  REPLY_TO: "gsachair@youngscientistacademy.org",
  ORG_NAME: "Young Scientist Academy",
};

// 🔁 Set this as your form submit trigger
function onFormSubmit(e) {
  const responses = e.namedValues;
  const timestamp = e.values[0]; // first column is always Timestamp

  // Pull the respondent email — Google collects it automatically if enabled
  // If your form collects it in a question instead, use:
  // const email = responses[CONFIG.EMAIL_FIELD]?.[0]?.trim();
  const email = e.response ? e.response.getRespondentEmail() : null;
  
  if (!email) {
    Logger.log("No email found — make sure 'Collect email addresses' is ON in Form settings.");
    return;
  }

  const name = responses[CONFIG.NAME_FIELD]?.[0]?.trim() || "Attendee";
  const firstName = name.split(" ")[0];
  const guestRaw = responses[CONFIG.GUESTS_FIELD]?.[0]?.trim();
  const guestCount = parseInt(guestRaw) || 0;
  const totalAttendees = 1 + guestCount;

  // Generate confirmation number: YSA + timestamp hash (6 chars)
  const confirmNum = "YSA-" + Math.abs(new Date(timestamp).getTime()).toString(36).toUpperCase().slice(-6);

  const subject = `✅ You're RSVPed! Summit Pass — ${confirmNum}`;
  const htmlBody = buildEmailHTML(firstName, name, confirmNum, guestCount, totalAttendees);

  GmailApp.sendEmail(email, subject, "", {
    htmlBody: htmlBody,
    replyTo: CONFIG.REPLY_TO,
    name: CONFIG.ORG_NAME,
  });

  Logger.log(`Sent pass to ${email} — Conf# ${confirmNum}`);
}

function buildEmailHTML(firstName, fullName, confirmNum, guestCount, totalAttendees) {
  const guestLine = guestCount === 0
    ? "No additional guests"
    : guestCount === 1
      ? "1 guest"
      : `${guestCount} guests`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f6f9; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .wrapper { max-width:560px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #2ec4b6 0%, #1a9e92 100%); padding:36px 32px 28px; text-align:center; }
  .header-eyebrow { color:rgba(255,255,255,0.8); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .header h1 { color:#fff; margin:0; font-size:26px; font-weight:800; line-height:1.2; }
  .header p { color:rgba(255,255,255,0.9); margin:6px 0 0; font-size:15px; }
  .pass-card { margin:24px; border:2px solid #2ec4b6; border-radius:12px; overflow:hidden; }
  .pass-header { background:#f0fbfa; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:2px dashed #c0ede9; }
  .pass-label { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#1a9e92; }
  .pass-title { font-size:16px; font-weight:800; color:#1a3c3a; margin:4px 0 0; }
  .pass-body { padding:20px; }
  .pass-row { display:flex; justify-content:space-between; margin-bottom:14px; }
  .pass-field { flex:1; }
  .pass-field-label { font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#888; margin-bottom:4px; }
  .pass-field-value { font-size:15px; font-weight:700; color:#1a3c3a; }
  .conf-box { margin:16px 0 0; background:linear-gradient(135deg, #2ec4b6 0%, #1a9e92 100%); border-radius:8px; padding:14px 20px; text-align:center; }
  .conf-label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.8); margin-bottom:6px; }
  .conf-number { font-size:28px; font-weight:900; color:#fff; letter-spacing:3px; font-family: monospace; }
  .instructions { margin:0 24px 24px; background:#f8f9fb; border-radius:10px; padding:18px 20px; }
  .instructions h3 { margin:0 0 12px; font-size:14px; color:#1a3c3a; font-weight:700; }
  .instructions ol { margin:0; padding-left:18px; }
  .instructions li { font-size:13px; color:#555; line-height:1.6; margin-bottom:6px; }
  .footer { text-align:center; padding:20px 24px 28px; }
  .footer p { font-size:12px; color:#aaa; margin:4px 0; }
  .footer a { color:#2ec4b6; text-decoration:none; }
  .badge { display:inline-block; background:#e8faf8; color:#1a9e92; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-top:4px; letter-spacing:0.5px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="header-eyebrow">Young Scientist Academy</div>
    <h1>5th Annual Youth STEM Summit</h1>
    <p>You're officially registered, ${firstName}! 🎉</p>
  </div>

  <div class="pass-card">
    <div class="pass-header">
      <div>
        <div class="pass-label">Summit Pass</div>
        <div class="pass-title">Youth STEM Summit 2026</div>
      </div>
      <div style="text-align:right">
        <span class="badge">✓ RSVP Confirmed</span>
      </div>
    </div>
    <div class="pass-body">
      <div class="pass-row">
        <div class="pass-field">
          <div class="pass-field-label">Name</div>
          <div class="pass-field-value">${fullName}</div>
        </div>
        <div class="pass-field" style="text-align:right">
          <div class="pass-field-label">Guests</div>
          <div class="pass-field-value">${guestLine}</div>
        </div>
      </div>
      <div class="pass-row">
        <div class="pass-field">
          <div class="pass-field-label">Date</div>
          <div class="pass-field-value">${CONFIG.SUMMIT_DATE}</div>
        </div>
        <div class="pass-field" style="text-align:right">
          <div class="pass-field-label">Total in Party</div>
          <div class="pass-field-value">${totalAttendees} person${totalAttendees !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="pass-row" style="margin-bottom:0">
        <div class="pass-field">
          <div class="pass-field-label">Location</div>
          <div class="pass-field-value">${CONFIG.SUMMIT_LOCATION}</div>
        </div>
      </div>
      <div class="conf-box">
        <div class="conf-label">Confirmation Number</div>
        <div class="conf-number">${confirmNum}</div>
      </div>
    </div>
  </div>

  <div class="instructions">
    <h3>📋 Check-In Instructions</h3>
    <ol>
      <li><strong>Show this email</strong> (or your confirmation number above) at the check-in desk on the day of the summit.</li>
      <li>Check in for yourself and all guests in your party — staff will mark your arrival.</li>
      <li>You'll receive your badge and welcome materials at check-in.</li>
      <li>Arrive 10–15 minutes early to allow time for check-in.</li>
    </ol>
  </div>

  <div class="footer">
    <p>Questions? Reply to this email or contact us at <a href="mailto:${CONFIG.REPLY_TO}">${CONFIG.REPLY_TO}</a></p>
    <p style="margin-top:12px; color:#ccc;">Young Scientist Academy &bull; Youth STEM Summit 2026</p>
  </div>
</div>
</body>
</html>
  `;
}

// ============================================================
// HOW TO SET THIS UP:
// 1. Go to script.google.com → New project
// 2. Link to your RSVP spreadsheet: Resources > Current project's triggers
//    OR: Extensions > Apps Script from inside Google Sheets
// 3. Paste this entire script, update CONFIG values to match your form
// 4. Click the clock icon (Triggers) → Add Trigger:
//      - Function: onFormSubmit
//      - Event source: From spreadsheet
//      - Event type: On form submit
// 5. Authorize when prompted
// 6. Test by submitting the form yourself!
// ============================================================
