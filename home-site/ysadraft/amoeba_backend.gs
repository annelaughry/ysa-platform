/**
 * AMOEBA BACKEND — Google Apps Script web app
 * ─────────────────────────────────────────────
 * Receives form submissions from amoeba.html and writes them
 * to a Google Sheet so you can review all entries in one place.
 *
 * HOW TO DEPLOY:
 *   1. Go to script.google.com → New project
 *   2. Paste this entire file, replacing any existing code
 *   3. Click Deploy → New deployment
 *   4. Type: Web app
 *   5. Execute as: Me (your Google account)
 *   6. Who has access: Anyone
 *   7. Click Deploy → Copy the web app URL
 *   8. Paste that URL into amoeba.html as APPS_SCRIPT_URL
 *
 * HOW TO VIEW RESPONSES:
 *   - Open the Google Sheet linked below (or let the script create one)
 *   - Each submission = one new row
 *   - Sort by Timestamp, filter by Membership, etc.
 *   - Column H is the design file link — click it to open the Google Drive file
 *
 * HOW TO RE-DEPLOY AFTER CHANGES:
 *   - Make your edits here
 *   - Deploy → Manage deployments → Edit (pencil) → New version → Deploy
 *   - Same URL, no need to update amoeba.html
 */

// ── CONFIGURATION ───────────────────────────────────────────────────────
// SHEET_NAME: the tab name inside the spreadsheet where responses go.
var SHEET_NAME = 'Submissions';

// SPREADSHEET_ID: leave blank to auto-create a new sheet on first run.
// Or paste the ID from an existing sheet's URL:
//   https://docs.google.com/spreadsheets/d/PASTE_ID_HERE/edit
var SPREADSHEET_ID = '';

// NOTIFY_EMAIL: set to your email to get an email alert on each new submission.
// Leave blank to skip email notifications.
var NOTIFY_EMAIL = 'gsachair@youngscientistacademy.org';
// ────────────────────────────────────────────────────────────────────────


/**
 * doPost(e)
 * Called automatically by Google whenever the form submits (HTTP POST).
 * Parses the JSON payload, writes a row to the Sheet, sends a notification.
 */
function doPost(e) {
  try {
    // Parse the JSON body sent by amoeba.html's fetch() call
    var data = JSON.parse(e.postData.contents);

    // Get (or create) the spreadsheet and the submissions tab
    var sheet = getSheet();

    // Add the header row if this is the first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Name', 'Email', 'Grade/Age', 'YSA Membership',
        'Team', 'Design Title', 'Description', 'Design File Link',
        'Process Notes', 'How They Heard', 'No-AI Confirmed', 'Scalable Confirmed',
        'Status'   // leave blank for you to fill in: 'Reviewing', 'Shortlisted', 'Winner'
      ]);
      // Bold the header row
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
    }

    // Append the submission as a new row
    sheet.appendRow([
      data.timestamp    || new Date().toISOString(),
      data.name         || '',
      data.email        || '',
      data.grade        || '',
      data.membership   || '',
      data.team         || '',
      data.title        || '',
      data.description  || '',
      data.fileLink     || '',
      data.process      || '',
      data.heard        || '',
      data.confirmNoAI  || '',
      data.confirmScale || '',
      'New'              // default status
    ]);

    // Make the Design File Link column clickable (column I = index 9)
    var lastRow = sheet.getLastRow();
    if (data.fileLink) {
      sheet.getRange(lastRow, 9).setFormula('=HYPERLINK("' + data.fileLink + '","View Design")');
    }

    // Send email notification if NOTIFY_EMAIL is set
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to:      NOTIFY_EMAIL,
        subject: '🎨 New Project Amoeba submission: ' + (data.title || 'Untitled'),
        htmlBody:
          '<h2>New Amoeba Submission</h2>' +
          '<p><strong>Name:</strong> '        + (data.name       || '—') + '</p>' +
          '<p><strong>Email:</strong> '        + (data.email      || '—') + '</p>' +
          '<p><strong>Membership:</strong> '   + (data.membership || '—') + '</p>' +
          '<p><strong>Team:</strong> '         + (data.team       || '—') + '</p>' +
          '<p><strong>Design Title:</strong> ' + (data.title      || '—') + '</p>' +
          '<p><strong>Description:</strong><br/>' + (data.description || '—') + '</p>' +
          '<p><strong>Design File:</strong> <a href="' + (data.fileLink || '#') + '">Click to view</a></p>' +
          '<hr/><p style="color:#999;font-size:12px;">Sent by the YSA Amoeba backend script.</p>'
      });
    }

    // Return success (the frontend uses no-cors so it won't see this,
    // but it's good practice)
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    // Log the error so you can debug in Apps Script → Executions
    Logger.log('Error in doPost: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * getSheet()
 * Gets the submissions sheet. If SPREADSHEET_ID is set, opens that
 * spreadsheet. Otherwise creates a brand-new one in your Drive.
 */
function getSheet() {
  var ss;

  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    // Check if we've already created a sheet (stored in script properties)
    var props = PropertiesService.getScriptProperties();
    var existingId = props.getProperty('SHEET_ID');

    if (existingId) {
      ss = SpreadsheetApp.openById(existingId);
    } else {
      // First run — create a new spreadsheet and remember its ID
      ss = SpreadsheetApp.create('Project Amoeba — Submissions');
      props.setProperty('SHEET_ID', ss.getId());
      Logger.log('Created new spreadsheet: ' + ss.getUrl());
    }
  }

  // Get or create the named tab
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}


/**
 * testPost()
 * Run this function from the Apps Script editor to test the sheet-writing
 * logic without needing a real form submission.
 */
function testPost() {
  var fakePayload = {
    postData: {
      contents: JSON.stringify({
        timestamp:    new Date().toISOString(),
        name:         'Test Submitter',
        email:        'test@example.com',
        grade:        '10th grade',
        membership:   'Global STEM Ambassador',
        team:         'Code Green',
        title:        'Amoeba Prime',
        description:  'A bold, adaptable mascot that represents the YSA community.',
        fileLink:     'https://drive.google.com/file/d/test',
        process:      'Drawn in Procreate, vectorized in Illustrator.',
        heard:        'YSA website',
        confirmNoAI:  'Yes',
        confirmScale: 'Yes'
      })
    }
  };
  doPost(fakePayload);
  Logger.log('Test complete — check your Sheet.');
}
