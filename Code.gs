const CONFIG = {
  NAME_FIELD:         "Full Name",
  EMAIL_FIELD:        "Email address (for your summit pass)",
  CONTACT_FIELD:      "Best contact to reach out to (email, phone, etc.)",
  GUESTS_FIELD:       "How many additional guests will you be bringing?",
  GUEST_NAMES_FIELD:  "Guest name(s)",
  ROLE_FIELD:         "What is your role?",
  DAYS_FIELD:         "Which day(s) will you attend?",
  ATTEND_FIELD:       "Do you plan to attend the summit?",
  REPLY_TO:           "gsachair@youngscientistacademy.org",
  ORG_NAME:           "Young Scientist Academy",
  SUMMIT_URL:         "https://ysalive.netlify.app",
  LOGO_URL:           "https://www.youngscientistacademy.org/uploads/4/4/0/9/44094069/published/ysa-primarybrandmark-transparent.png",
  SHEET_ID:           "1nTP7F71B-klsDmjhKipMwYl_RxrqgrLlRr9yKn_CU0I",
};

function _openSheet() {
  return SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheets()[0];
}

function _ensureCol(sheet, headers, label) {
  let idx = headers.indexOf(label);
  if (idx === -1) {
    idx = headers.length;
    sheet.getRange(1, idx + 1).setValue(label);
    headers.push(label);
  }
  return idx + 1;
}

// ============================================================
// FORM SUBMIT (main RSVP Google Form trigger)
// ============================================================
function onFormSubmit(e) {
  const responses = e.namedValues;
  const timestamp = e.values[0];
  const email = responses[CONFIG.EMAIL_FIELD]?.[0]?.trim();
  if (!email) { Logger.log("No email found."); return; }
  const attending = responses[CONFIG.ATTEND_FIELD]?.[0]?.trim().toLowerCase();
  if (!attending || attending.includes("no") || attending.includes("not")) { Logger.log("Not attending."); return; }

  const name           = responses[CONFIG.NAME_FIELD]?.[0]?.trim() || "Attendee";
  const firstName      = name.split(" ")[0];
  const role           = responses[CONFIG.ROLE_FIELD]?.[0]?.trim() || "";
  const guestCount     = parseInt(responses[CONFIG.GUESTS_FIELD]?.[0]?.trim()) || 0;
  const totalAttendees = 1 + guestCount;
  const daysAnswer     = responses[CONFIG.DAYS_FIELD]?.[0] || "";
  const day1 = daysAnswer.includes("July 13") || daysAnswer.includes("Day 1");
  const day2 = daysAnswer.includes("July 14") || daysAnswer.includes("Day 2");

  let summitDate, summitLocation, locationDetails;
  if (day1 && day2) {
    summitDate = "July 13 & 14, 2026"; summitLocation = "Lozova & Scoreni, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#555;margin:8px 0 2px;"><strong>Day 1, July 13, Lozova</strong></p>
      <p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p>
      <p style="font-size:12px;color:#777;margin:0 0 10px;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>
      <p style="font-size:12px;color:#555;margin:0 0 2px;"><strong>Day 2, July 14, Scoreni</strong></p>
      <p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Liceul Teoretic Universul</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  } else if (day1) {
    summitDate = "July 13, 2026"; summitLocation = "Lozova, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>`;
  } else {
    summitDate = "July 14, 2026"; summitLocation = "Scoreni, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Liceul Teoretic Universul</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  }

  const confirmNum = "YSA-" + Math.abs(new Date(timestamp).getTime()).toString(36).toUpperCase().slice(-6);
  const logoSrc    = getLogoBase64();
  const subject    = "You're RSVPed! Summit Pass - " + confirmNum;
  const htmlBody   = buildEmailHTML(firstName, name, confirmNum, guestCount, totalAttendees, summitDate, summitLocation, locationDetails, role, logoSrc);

  GmailApp.sendEmail(email, subject, "", { htmlBody, replyTo: CONFIG.REPLY_TO, name: CONFIG.ORG_NAME });
  Logger.log("Sent pass to " + email + " - Conf# " + confirmNum);
  writeConfirmationToSheet(email, confirmNum, day1, day2);
}

function getLogoBase64() {
  try {
    const response = UrlFetchApp.fetch(CONFIG.LOGO_URL);
    return "data:image/png;base64," + Utilities.base64Encode(response.getBlob().getBytes());
  } catch (err) { return CONFIG.LOGO_URL; }
}

function writeConfirmationToSheet(email, confirmNum, day1, day2) {
  try {
    const sheet   = _openSheet();
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const confCol  = _ensureCol(sheet, headers, "Confirmation #");
    const d1CiCol  = _ensureCol(sheet, headers, "Day 1 Checked In");
    _ensureCol(sheet, headers, "Day 1 Check In Time");
    const d2CiCol  = _ensureCol(sheet, headers, "Day 2 Checked In");
    _ensureCol(sheet, headers, "Day 2 Check In Time");
    _ensureCol(sheet, headers, "Deleted");
    const emailIdx = headers.indexOf(CONFIG.EMAIL_FIELD);
    for (let i = 1; i < data.length; i++) {
      if ((data[i][emailIdx] || "").toString().trim().toLowerCase() === email.toLowerCase()) {
        sheet.getRange(i + 1, confCol).setValue(confirmNum);
        if (day1) sheet.getRange(i + 1, d1CiCol).setValue("No");
        if (day2) sheet.getRange(i + 1, d2CiCol).setValue("No");
        break;
      }
    }
  } catch (err) { Logger.log("Sheet write error: " + err); }
}

// ============================================================
// WEB APP (doGet serves checkin.html, doPost handles
// standalone Saturday Workshop public signup form)
// ============================================================
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("checkin")
    .setTitle("YSA Summit Check-In")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const params = e.parameter;
    let result;
    if (params.source === "rsvp-form") {
      result = handleRsvpFormSignup(params);
    } else if (params.formType === "saturday_workshop") {
      result = handleSaturdayWorkshopSignup(params);
    } else {
      result = { success: false, error: "Unknown form type" };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles direct AJAX submissions from rsvp.html (source=rsvp-form).
function handleRsvpFormSignup(params) {
  const sheet   = _openSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  function ensureIdx(label) {
    let idx = headers.indexOf(label);
    if (idx === -1) { idx = headers.length; sheet.getRange(1, idx + 1).setValue(label); headers.push(label); }
    return idx;
  }

  const nameIdx       = ensureIdx(CONFIG.NAME_FIELD);
  const emailIdx      = ensureIdx(CONFIG.EMAIL_FIELD);
  const contactIdx    = ensureIdx(CONFIG.CONTACT_FIELD);
  const guestsIdx     = ensureIdx(CONFIG.GUESTS_FIELD);
  const guestNamesIdx = ensureIdx(CONFIG.GUEST_NAMES_FIELD);
  const roleIdx       = ensureIdx(CONFIG.ROLE_FIELD);
  const daysIdx       = ensureIdx(CONFIG.DAYS_FIELD);
  const attendIdx     = ensureIdx(CONFIG.ATTEND_FIELD);
  const confIdx       = ensureIdx("Confirmation #");
  const d1CiIdx       = ensureIdx("Day 1 Checked In");
  ensureIdx("Day 1 Check In Time");
  const d2CiIdx       = ensureIdx("Day 2 Checked In");
  ensureIdx("Day 2 Check In Time");
  ensureIdx("Deleted");
  const satIdx        = ensureIdx("Saturday Workshop RSVP");
  const commentsIdx   = ensureIdx("Comments");

  const name       = (params.name || "").trim();
  const email      = (params.email || "").trim();
  const role       = (params.role || "").trim();
  const contact    = (params.contact || "").trim();
  const daysAnswer = (params.days || "").trim();
  const guestCount = parseInt(params.guestCount) || 0;

  if (!name || !email) {
    return { success: false, error: "Name and email are required." };
  }

  const day1 = daysAnswer.includes("July 13");
  const day2 = daysAnswer.includes("July 14");
  const totalAttendees = 1 + guestCount;

  let summitDate, summitLocation, locationDetails;
  if (day1 && day2) {
    summitDate = "July 13 & 14, 2026"; summitLocation = "Lozova & Scoreni, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#555;margin:8px 0 2px;"><strong>Day 1, July 13, Lozova</strong></p>
      <p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p>
      <p style="font-size:12px;color:#777;margin:0 0 10px;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>
      <p style="font-size:12px;color:#555;margin:0 0 2px;"><strong>Day 2, July 14, Scoreni</strong></p>
      <p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Liceul Teoretic Universul</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  } else if (day1) {
    summitDate = "July 13, 2026"; summitLocation = "Lozova, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>`;
  } else {
    summitDate = "July 14, 2026"; summitLocation = "Scoreni, Moldova";
    locationDetails = `
      <p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Liceul Teoretic Universul</p>
      <p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  }

  const confirmNum = "YSA-" + Date.now().toString(36).toUpperCase().slice(-6);
  const newRow     = new Array(headers.length).fill("");
  newRow[0]             = new Date().toLocaleString();
  newRow[nameIdx]       = name;
  newRow[emailIdx]      = email;
  newRow[roleIdx]       = role;
  newRow[contactIdx]    = contact;
  newRow[daysIdx]       = daysAnswer;
  newRow[guestsIdx]     = guestCount;
  newRow[guestNamesIdx] = (params.guestNames || "").trim();
  newRow[confIdx]       = confirmNum;
  newRow[satIdx]        = (params.saturday || "").trim();
  newRow[commentsIdx]   = (params.comments || "").trim();
  newRow[attendIdx]     = params.attending || "Yes";
  if (day1) newRow[d1CiIdx] = "No";
  if (day2) newRow[d2CiIdx] = "No";
  sheet.appendRow(newRow);

  try {
    const firstName = name.split(" ")[0];
    const logoSrc    = getLogoBase64();
    const isMaybe    = (params.attending || "").toLowerCase().includes("maybe");
    const subject    = isMaybe ? "RSVP received (Maybe) - " + confirmNum : "You're RSVPed! Summit Pass - " + confirmNum;
    const htmlBody   = buildEmailHTML(firstName, name, confirmNum, guestCount, totalAttendees, summitDate, summitLocation, locationDetails, role, logoSrc);
    GmailApp.sendEmail(email, subject, "", { htmlBody, replyTo: CONFIG.REPLY_TO, name: CONFIG.ORG_NAME });
    _notifyAdmin(name, email, confirmNum, role, daysAnswer, isMaybe);
  } catch (err) {
    Logger.log("RSVP email send error: " + err);
  }

  return { success: true, confirmNum: confirmNum };
}

function handleSaturdayWorkshopSignup(params) {
  const sheet   = _openSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  function ensureIdx(label) {
    let idx = headers.indexOf(label);
    if (idx === -1) { idx = headers.length; sheet.getRange(1, idx + 1).setValue(label); headers.push(label); }
    return idx;
  }

  const nameIdx        = ensureIdx(CONFIG.NAME_FIELD);
  const contactIdx     = ensureIdx(CONFIG.CONTACT_FIELD);
  const guestsIdx      = ensureIdx(CONFIG.GUESTS_FIELD);
  const guestNamesIdx  = ensureIdx(CONFIG.GUEST_NAMES_FIELD);
  const roleIdx        = ensureIdx(CONFIG.ROLE_FIELD);
  const daysIdx        = ensureIdx(CONFIG.DAYS_FIELD);
  const attendIdx      = ensureIdx(CONFIG.ATTEND_FIELD);
  const confIdx        = ensureIdx("Confirmation #");
  const workshopCiIdx  = ensureIdx("Workshop Checked In");
  ensureIdx("Workshop Check In Time");
  ensureIdx("Deleted");

  const name       = (params.name || "").trim();
  const contact    = (params.contact || "").trim();
  const guestCount = parseInt(params.guestCount) || 0;

  if (!name || !contact) {
    return { success: false, error: "Name and contact are required." };
  }

  const confirmNum = "YSA-SAT" + Date.now().toString(36).toUpperCase().slice(-5);
  const newRow     = new Array(headers.length).fill("");

  newRow[0]             = new Date().toLocaleString();
  newRow[nameIdx]       = name;
  newRow[contactIdx]    = contact;
  newRow[guestsIdx]     = guestCount;
  newRow[guestNamesIdx] = (params.guestNames || "").trim();
  newRow[roleIdx]       = "Community Workshop Guest";
  newRow[daysIdx]       = "Saturday, July 11 (Community STEM Field Workshop)";
  newRow[attendIdx]     = "Yes";
  newRow[confIdx]       = confirmNum;
  newRow[workshopCiIdx] = "No";

  sheet.appendRow(newRow);
  return { success: true, confirmNum: confirmNum };
}

// ============================================================
// CHECK-IN DASHBOARD DATA FUNCTIONS
// ============================================================
function _readAttendees(filter) {
  const sheet   = _openSheet();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const col = (label) => headers.indexOf(label);

  const nameCol        = col(CONFIG.NAME_FIELD);
  const contactCol     = col(CONFIG.CONTACT_FIELD);
  const roleCol        = col(CONFIG.ROLE_FIELD);
  const guestsCol      = col(CONFIG.GUESTS_FIELD);
  const guestNamesCol  = col(CONFIG.GUEST_NAMES_FIELD);
  const daysCol        = col(CONFIG.DAYS_FIELD);
  const attendCol      = col(CONFIG.ATTEND_FIELD);
  const confCol        = col("Confirmation #");
  const d1CiCol        = col("Day 1 Checked In");
  const d2CiCol        = col("Day 2 Checked In");
  const workshopCiCol  = col("Workshop Checked In");
  const deletedCol     = col("Deleted");
  const emailCol       = col(CONFIG.EMAIL_FIELD);
  const commentsCol    = col("Comments");
  // "Saturday Workshop RSVP" is populated by the main RSVP form for attendees who
  // also signed up for the Jul 11 community workshop. We use it to include them
  // in the Workshop tab even though their DAYS_FIELD only lists Jul 13/14.
  const satRsvpCol     = col("Saturday Workshop RSVP");

  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[nameCol]) continue;
    if (deletedCol >= 0 && (row[deletedCol] || "").toString() === "Yes") continue;
    const attend = (row[attendCol] || "").toString().toLowerCase();
    if (attend.includes("no") || attend.includes("not")) continue;
    if (filter && !filter(row, headers)) continue;

    const days       = (row[daysCol] || "").toString();
    const guestCount = parseInt(row[guestsCol]) || 0;
    const satRsvpVal = satRsvpCol >= 0 ? (row[satRsvpCol] || "").toString().toLowerCase() : "";

    results.push({
      rowIndex:          i + 1,
      name:              (row[nameCol] || "").toString(),
      contact:           contactCol    >= 0 ? (row[contactCol]    || "").toString() : "",
      email:             emailCol      >= 0 ? (row[emailCol]      || "").toString() : "",
      comments:          commentsCol   >= 0 ? (row[commentsCol]   || "").toString() : "",
      role:              roleCol       >= 0 ? (row[roleCol]       || "").toString() : "",
      guests:            guestCount,
      guestNames:        guestNamesCol >= 0 ? (row[guestNamesCol] || "").toString() : "",
      totalParty:        1 + guestCount,
      days:              days,
      attendingStatus:   attend,
      attendsDay1:       days.includes("July 13") || days.includes("Day 1"),
      attendsDay2:       days.includes("July 14") || days.includes("Day 2"),
      // Workshop: match by days field OR by the Saturday Workshop RSVP column
      attendsWorkshop:   days.toLowerCase().includes("saturday") ||
                         days.toLowerCase().includes("workshop") ||
                         satRsvpVal.includes("yes"),
      confirmNum:        confCol        >= 0 ? (row[confCol]        || "").toString() : "",
      day1CheckedIn:     d1CiCol        >= 0 ? (row[d1CiCol]        || "No").toString() : "No",
      day2CheckedIn:     d2CiCol        >= 0 ? (row[d2CiCol]        || "No").toString() : "No",
      workshopCheckedIn: workshopCiCol  >= 0 ? (row[workshopCiCol]  || "No").toString() : "No",
    });
  }
  return results;
}

function getAllAttendees() { return _readAttendees(null); }

function _notifyAdmin(name, recipientEmail, confirmNum, role, days, isMaybe) {
  try {
    const label   = isMaybe ? "Maybe RSVP received" : "RSVP confirmed";
    const emoji   = isMaybe ? "⚠️" : "✅";
    const subject = emoji + " " + label + " — " + name + " (" + confirmNum + ")";
    const body    = label + "\n\n"
      + "Name:     " + name + "\n"
      + "Email:    " + recipientEmail + "\n"
      + "Conf #:   " + confirmNum + "\n"
      + "Role:     " + (role || "—") + "\n"
      + "Days:     " + (days || "—") + "\n"
      + "Sent at:  " + new Date().toLocaleString() + "\n\n"
      + "Pass delivered successfully to " + recipientEmail + ".";
    GmailApp.sendEmail(CONFIG.REPLY_TO, subject, body);
  } catch (err) { Logger.log("Admin notify failed: " + err); }
}

// One-shot scan-to-check-in: finds attendee by conf# and checks in for the given day.
function quickCheckIn(confNum, day) {
  const results = searchAttendee((confNum || "").trim().toUpperCase());
  if (!results || results.length === 0) {
    return { success: false, error: "No attendee found for: " + confNum };
  }
  const a = results[0];
  if (day === "day1"     && !a.attendsDay1)     return { success: false, error: a.name + " is not registered for Day 1" };
  if (day === "day2"     && !a.attendsDay2)     return { success: false, error: a.name + " is not registered for Day 2" };
  if (day === "workshop" && !a.attendsWorkshop) return { success: false, error: a.name + " is not registered for the Workshop" };
  const alreadyCi = day === "day1" ? a.day1CheckedIn === "Yes"
                  : day === "day2" ? a.day2CheckedIn === "Yes"
                  :                  a.workshopCheckedIn === "Yes";
  if (!alreadyCi) checkInAttendee(a.rowIndex, day);
  return { success: true, alreadyCheckedIn: alreadyCi, name: a.name, confirmNum: a.confirmNum };
}

function resendAllConfirmationEmails() {
  const sheet   = _openSheet();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const col     = (label) => headers.indexOf(label);
  const logoSrc = getLogoBase64();
  let sent = 0, skipped = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[col(CONFIG.NAME_FIELD)]) continue;
    if ((row[col("Deleted")] || "").toString() === "Yes") continue;
    const attend = (row[col(CONFIG.ATTEND_FIELD)] || "").toString().toLowerCase();
    if (attend.includes("no") || attend.includes("not")) continue;
    const email = (row[col(CONFIG.EMAIL_FIELD)] || "").toString().trim();
    if (!email) { skipped++; continue; }

    try {
      const name           = (row[col(CONFIG.NAME_FIELD)] || "Attendee").toString();
      const firstName      = name.split(" ")[0];
      const role           = (row[col(CONFIG.ROLE_FIELD)] || "").toString();
      const guestCount     = parseInt(row[col(CONFIG.GUESTS_FIELD)]) || 0;
      const totalAttendees = 1 + guestCount;
      const days           = (row[col(CONFIG.DAYS_FIELD)] || "").toString();
      const confirmNum     = (row[col("Confirmation #")] || "").toString();
      const day1 = days.includes("July 13") || days.includes("Day 1");
      const day2 = days.includes("July 14") || days.includes("Day 2");

      let summitDate, summitLocation, locationDetails;
      if (day1 && day2) {
        summitDate = "July 13 & 14, 2026"; summitLocation = "Lozova & Scoreni, Moldova";
        locationDetails = `<p style="font-size:12px;color:#555;margin:8px 0 2px;"><strong>Day 1, July 13, Lozova</strong></p><p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p><p style="font-size:12px;color:#777;margin:0 0 10px;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p><p style="font-size:12px;color:#555;margin:0 0 2px;"><strong>Day 2, July 14, Scoreni</strong></p><p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Liceul Teoretic Universul</p><p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
      } else if (day1) {
        summitDate = "July 13, 2026"; summitLocation = "Lozova, Moldova";
        locationDetails = `<p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p><p style="font-size:12px;color:#777;margin:0;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>`;
      } else {
        summitDate = "July 14, 2026"; summitLocation = "Scoreni, Moldova";
        locationDetails = `<p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Liceul Teoretic Universul</p><p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
      }

      const subject = "Your Summit Pass - " + confirmNum;
      const htmlBody = buildEmailHTML(firstName, name, confirmNum, guestCount, totalAttendees, summitDate, summitLocation, locationDetails, role, logoSrc);
      GmailApp.sendEmail(email, subject, "", { htmlBody, replyTo: CONFIG.REPLY_TO, name: CONFIG.ORG_NAME });
      sent++;
    } catch(err) {
      Logger.log("Batch resend failed for row " + (i+1) + ": " + err);
      skipped++;
    }
  }
  try {
    GmailApp.sendEmail(CONFIG.REPLY_TO,
      "📧 Batch resend complete — " + sent + " passes sent",
      "Resend All completed.\n\nSent:    " + sent + "\nSkipped: " + skipped + " (no email on file)\nTime:    " + new Date().toLocaleString());
  } catch(err) { Logger.log("Batch summary notify failed: " + err); }

  return { success: true, sent, skipped };
}

function resendConfirmationEmail(rowIndex) {
  const sheet   = _openSheet();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const col     = (label) => headers.indexOf(label);
  const row     = data[rowIndex - 1];

  const email = (row[col(CONFIG.EMAIL_FIELD)] || "").toString().trim();
  if (!email) return { success: false, error: "No email on file" };

  const name           = (row[col(CONFIG.NAME_FIELD)] || "Attendee").toString();
  const firstName      = name.split(" ")[0];
  const role           = (row[col(CONFIG.ROLE_FIELD)] || "").toString();
  const guestCount     = parseInt(row[col(CONFIG.GUESTS_FIELD)]) || 0;
  const totalAttendees = 1 + guestCount;
  const days           = (row[col(CONFIG.DAYS_FIELD)] || "").toString();
  const confirmNum     = (row[col("Confirmation #")] || "").toString();
  const day1 = days.includes("July 13") || days.includes("Day 1");
  const day2 = days.includes("July 14") || days.includes("Day 2");

  let summitDate, summitLocation, locationDetails;
  if (day1 && day2) {
    summitDate = "July 13 & 14, 2026"; summitLocation = "Lozova & Scoreni, Moldova";
    locationDetails = `<p style="font-size:12px;color:#555;margin:8px 0 2px;"><strong>Day 1, July 13, Lozova</strong></p><p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p><p style="font-size:12px;color:#777;margin:0 0 10px;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p><p style="font-size:12px;color:#555;margin:0 0 2px;"><strong>Day 2, July 14, Scoreni</strong></p><p style="font-size:12px;color:#777;margin:0 0 2px;">&#8226; Liceul Teoretic Universul</p><p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  } else if (day1) {
    summitDate = "July 13, 2026"; summitLocation = "Lozova, Moldova";
    locationDetails = `<p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Muzeul Rezervatiei naturale Codrii</p><p style="font-size:12px;color:#777;margin:0;">&#8226; Liceul Teoretic Mitropolit Nestor Vornicescu</p>`;
  } else {
    summitDate = "July 14, 2026"; summitLocation = "Scoreni, Moldova";
    locationDetails = `<p style="font-size:12px;color:#777;margin:6px 0 2px;">&#8226; Liceul Teoretic Universul</p><p style="font-size:12px;color:#777;margin:0;">&#8226; World's Biggest Wine Barrel</p>`;
  }

  const logoSrc = getLogoBase64();
  const subject = "Your Summit Pass - " + confirmNum;
  const htmlBody = buildEmailHTML(firstName, name, confirmNum, guestCount, totalAttendees, summitDate, summitLocation, locationDetails, role, logoSrc);
  GmailApp.sendEmail(email, subject, "", { htmlBody, replyTo: CONFIG.REPLY_TO, name: CONFIG.ORG_NAME });
  return { success: true };
}

function getSaturdayWorkshopAttendees() {
  return _readAttendees(function (row, headers) {
    const daysIdx = headers.indexOf(CONFIG.DAYS_FIELD);
    const satIdx  = headers.indexOf("Saturday Workshop RSVP");
    const days    = (row[daysIdx] || "").toString().toLowerCase();
    const satRsvp = satIdx >= 0 ? (row[satIdx] || "").toString().toLowerCase() : "";
    return days.includes("saturday") || days.includes("workshop") || satRsvp.includes("yes");
  });
}

function searchAttendee(query) {
  const q = (query || "").trim().toLowerCase();
  return _readAttendees(function (row, headers) {
    const nameIdx = headers.indexOf(CONFIG.NAME_FIELD);
    const confIdx = headers.indexOf("Confirmation #");
    const name = (row[nameIdx] || "").toString().toLowerCase();
    const conf = (row[confIdx] || "").toString().toLowerCase();
    return name.includes(q) || conf.includes(q) || conf === q;
  });
}

function checkInAttendee(rowIndex, day) {
  const sheet     = _openSheet();
  const headers   = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colLabel  = day === "day1" ? "Day 1 Checked In"    : day === "day2" ? "Day 2 Checked In"    : "Workshop Checked In";
  const timeLabel = day === "day1" ? "Day 1 Check In Time" : day === "day2" ? "Day 2 Check In Time" : "Workshop Check In Time";
  const ciCol     = _ensureCol(sheet, headers, colLabel);
  const ciTimeCol = _ensureCol(sheet, headers, timeLabel);
  sheet.getRange(rowIndex, ciCol).setValue("Yes");
  sheet.getRange(rowIndex, ciTimeCol).setValue(new Date().toLocaleString());
  return { success: true };
}

function uncheckInAttendee(rowIndex, day) {
  const sheet     = _openSheet();
  const headers   = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colLabel  = day === "day1" ? "Day 1 Checked In"    : day === "day2" ? "Day 2 Checked In"    : "Workshop Checked In";
  const timeLabel = day === "day1" ? "Day 1 Check In Time" : day === "day2" ? "Day 2 Check In Time" : "Workshop Check In Time";
  const ciCol     = _ensureCol(sheet, headers, colLabel);
  const ciTimeCol = _ensureCol(sheet, headers, timeLabel);
  sheet.getRange(rowIndex, ciCol).setValue("No");
  sheet.getRange(rowIndex, ciTimeCol).setValue("");
  return { success: true };
}

function deleteAttendee(rowIndex) {
  const sheet   = _openSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = _ensureCol(sheet, headers, "Deleted");
  sheet.getRange(rowIndex, col).setValue("Yes");
  return { success: true };
}

function getDeletedAttendees() {
  const sheet   = _openSheet();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const delIdx  = headers.indexOf("Deleted");
  if (delIdx === -1) return [];
  const nameIdx = headers.indexOf(CONFIG.NAME_FIELD);
  const confIdx = headers.indexOf("Confirmation #");
  const roleIdx = headers.indexOf(CONFIG.ROLE_FIELD);
  const daysIdx = headers.indexOf(CONFIG.DAYS_FIELD);
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[delIdx] || "").toString() !== "Yes") continue;
    if (!row[nameIdx]) continue;
    results.push({
      rowIndex:   i + 1,
      name:       (row[nameIdx] || "").toString(),
      confirmNum: confIdx >= 0 ? (row[confIdx] || "").toString() : "",
      role:       roleIdx >= 0 ? (row[roleIdx] || "").toString() : "",
      days:       daysIdx >= 0 ? (row[daysIdx] || "").toString() : "",
    });
  }
  return results;
}

function restoreAttendee(rowIndex) {
  const sheet   = _openSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = _ensureCol(sheet, headers, "Deleted");
  sheet.getRange(rowIndex, col).setValue("");
  return { success: true };
}

function registerWalkin(data) {
  const sheet   = _openSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  function ensureIdx(label) {
    let idx = headers.indexOf(label);
    if (idx === -1) { idx = headers.length; sheet.getRange(1, idx + 1).setValue(label); headers.push(label); }
    return idx;
  }
  const nameIdx        = ensureIdx(CONFIG.NAME_FIELD);
  const emailIdx       = ensureIdx(CONFIG.EMAIL_FIELD);
  const contactIdx     = ensureIdx(CONFIG.CONTACT_FIELD);
  const guestsIdx      = ensureIdx(CONFIG.GUESTS_FIELD);
  const guestNamesIdx  = ensureIdx(CONFIG.GUEST_NAMES_FIELD);
  const roleIdx        = ensureIdx(CONFIG.ROLE_FIELD);
  const daysIdx        = ensureIdx(CONFIG.DAYS_FIELD);
  const attendIdx      = ensureIdx(CONFIG.ATTEND_FIELD);
  const confIdx        = ensureIdx("Confirmation #");
  const d1CiIdx        = ensureIdx("Day 1 Checked In");
  const d1TIdx         = ensureIdx("Day 1 Check In Time");
  const d2CiIdx        = ensureIdx("Day 2 Checked In");
  const d2TIdx         = ensureIdx("Day 2 Check In Time");
  const workshopCiIdx  = ensureIdx("Workshop Checked In");
  const workshopTIdx   = ensureIdx("Workshop Check In Time");
  ensureIdx("Deleted");

  const confirmNum = "YSA-W" + Date.now().toString(36).toUpperCase().slice(-5);
  const now        = new Date().toLocaleString();
  const newRow     = new Array(headers.length).fill("");

  const day1     = data.days.includes("July 13");
  const day2     = data.days.includes("July 14");
  const workshop = data.days.toLowerCase().includes("july 11") || data.days.toLowerCase().includes("saturday");

  newRow[0]             = now;
  newRow[nameIdx]       = data.name;
  newRow[emailIdx]      = data.email || "";
  newRow[roleIdx]       = data.role || "";
  newRow[daysIdx]       = data.days;
  newRow[attendIdx]     = "Yes";
  newRow[contactIdx]    = data.contact || "";
  newRow[guestsIdx]     = data.guestCount || 0;
  newRow[guestNamesIdx] = data.guestNames || "";
  newRow[confIdx]       = confirmNum;

  if (day1) {
    newRow[d1CiIdx] = data.checkInDay1 ? "Yes" : "No";
    if (data.checkInDay1) newRow[d1TIdx] = now;
  }
  if (day2) {
    newRow[d2CiIdx] = data.checkInDay2 ? "Yes" : "No";
    if (data.checkInDay2) newRow[d2TIdx] = now;
  }
  if (workshop) {
    newRow[workshopCiIdx] = data.checkInWorkshop ? "Yes" : "No";
    if (data.checkInWorkshop) newRow[workshopTIdx] = now;
  }

  sheet.appendRow(newRow);

  if (data.email) {
    try {
      let summitDate, summitLocation, locationDetails;
      if (day1 && day2) {
        summitDate = "July 13 & 14, 2026"; summitLocation = "Lozova & Scoreni, Moldova"; locationDetails = "";
      } else if (day1) {
        summitDate = "July 13, 2026"; summitLocation = "Lozova, Moldova"; locationDetails = "";
      } else if (day2) {
        summitDate = "July 14, 2026"; summitLocation = "Scoreni, Moldova"; locationDetails = "";
      } else {
        summitDate = "July 11, 2026"; summitLocation = "Community STEM Field Workshop"; locationDetails = "";
      }
      const firstName  = data.name.split(" ")[0];
      const guestCount = data.guestCount || 0;
      const logoSrc    = getLogoBase64();
      const htmlBody   = buildEmailHTML(firstName, data.name, confirmNum, guestCount, 1 + guestCount, summitDate, summitLocation, locationDetails, data.role || "", logoSrc);
      GmailApp.sendEmail(data.email, "You're registered! Summit Pass - " + confirmNum, "", { htmlBody, replyTo: CONFIG.REPLY_TO, name: CONFIG.ORG_NAME });
    } catch (err) { Logger.log("Walk-in email failed: " + err); }
  }

  return { success: true, confirmNum };
}

function buildEmailHTML(firstName, fullName, confirmNum, guestCount, totalAttendees, summitDate, summitLocation, locationDetails, role, logoSrc) {
  const guestLine = guestCount === 0 ? "No additional guests" : guestCount === 1 ? "1 guest" : guestCount + " guests";
  const checkinQrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=1a9e92&data=" + encodeURIComponent(confirmNum);
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrapper{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .header{background:linear-gradient(135deg,#2ec4b6 0%,#1a9e92 100%);padding:36px 32px 28px;text-align:center;}
  .header-eyebrow{color:rgba(255,255,255,0.8);font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
  .header h1{color:#fff;margin:0;font-size:26px;font-weight:800;line-height:1.2;}
  .header p{color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:15px;}
  .pass-card{margin:24px;border:2px solid #2ec4b6;border-radius:12px;overflow:hidden;}
  .pass-header{background:#f0fbfa;padding:14px 20px;border-bottom:2px dashed #c0ede9;}
  .pass-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a9e92;margin:0 0 3px;}
  .pass-title{font-size:16px;font-weight:800;color:#1a3c3a;margin:0;}
  .pass-status-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a9e92;margin:0 0 3px;}
  .pass-status-value{font-size:13px;font-weight:700;color:#1a3c3a;margin:0;}
  .pass-body{padding:20px;}
  .field-label{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin:0 0 3px;}
  .field-value{font-size:15px;font-weight:700;color:#1a3c3a;margin:0;}
  .conf-box{background:linear-gradient(135deg,#2ec4b6 0%,#1a9e92 100%);border-radius:8px;padding:16px 20px;text-align:center;margin-bottom:14px;}
  .conf-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.8);margin:0 0 8px;}
  .conf-number{font-size:28px;font-weight:900;color:#fff;letter-spacing:4px;font-family:'Courier New',monospace;margin:0;}
  .qr-box{border:1.5px solid #c0ede9;border-radius:10px;padding:16px 18px;text-align:center;}
  .qr-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a9e92;margin:0 0 10px;}
  .qr-sub{font-size:11px;color:#999;margin-top:8px;}
  .site-btn{display:inline-block;background:#1a9e92;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:6px;margin-top:14px;}
  .instructions{margin:0 24px 24px;background:#f8f9fb;border-radius:10px;padding:18px 20px;}
  .instructions h3{margin:0 0 12px;font-size:14px;color:#1a3c3a;font-weight:700;}
  .instructions ol{margin:0;padding-left:18px;}
  .instructions li{font-size:13px;color:#555;line-height:1.7;margin-bottom:4px;}
  .footer{text-align:center;padding:16px 24px 28px;border-top:1px solid #eef;}
  .footer p{font-size:12px;color:#aaa;margin:4px 0;}
  .footer a{color:#2ec4b6;text-decoration:none;}
</style></head><body><div class="wrapper">
  <div class="header">
    <div class="header-eyebrow">Young Scientist Academy</div>
    <h1>5th Annual Youth STEM Summit</h1>
    <p>You are officially registered, ${firstName}!</p>
  </div>
  <div class="pass-card">
    <div class="pass-header">
      <table style="width:100%;border-collapse:collapse;"><tr>
        <td style="vertical-align:top;"><p class="pass-label">Summit Pass</p><p class="pass-title">Youth STEM Summit 2026</p></td>
        <td style="vertical-align:top;text-align:right;white-space:nowrap;"><p class="pass-status-label">Status</p><p class="pass-status-value">&#10003; RSVP Confirmed</p></td>
      </tr></table>
    </div>
    <div class="pass-body">
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td style="width:50%;padding:6px 0;vertical-align:top;"><p class="field-label">Name</p><p class="field-value">${fullName}</p></td>
          <td style="width:50%;padding:6px 0;vertical-align:top;text-align:right;"><p class="field-label">Guests</p><p class="field-value">${guestLine}</p></td>
        </tr>
        <tr>
          <td style="width:50%;padding:14px 0 6px;vertical-align:top;"><p class="field-label">Role</p><p class="field-value">${role}</p></td>
          <td style="width:50%;padding:14px 0 6px;vertical-align:top;text-align:right;"><p class="field-label">Total in Party</p><p class="field-value">${totalAttendees} person${totalAttendees !== 1 ? "s" : ""}</p></td>
        </tr>
        <tr><td style="padding:14px 0 6px;vertical-align:top;"><p class="field-label">Date</p><p class="field-value">${summitDate}</p></td></tr>
        <tr><td colspan="2" style="padding:14px 0 6px;vertical-align:top;"><p class="field-label">Location</p><p class="field-value">${summitLocation}</p>${locationDetails}</td></tr>
      </table>
      <div class="conf-box"><p class="conf-label">Confirmation Number</p><p class="conf-number">${confirmNum}</p></div>
      <div class="qr-box">
        <p class="qr-label">Check-in QR code</p>
        <img src="${checkinQrSrc}" width="140" height="140" alt="Check-in QR code" style="display:block;margin:0 auto;">
        <p class="qr-sub">Show this at the check-in desk, staff will scan it</p>
        <a href="${CONFIG.SUMMIT_URL}" class="site-btn">Visit Summit Website</a>
      </div>
    </div>
  </div>
  <div class="instructions">
    <h3>Check-In Instructions</h3>
    <ol>
      <li><strong>Show this email's QR code</strong> (or your confirmation number above) at the check-in desk.</li>
      <li>Check in for yourself and all guests in your party.</li>
      <li>You will receive your badge and welcome materials at check-in.</li>
      <li>Arrive 10-15 minutes early to allow time for check-in.</li>
    </ol>
  </div>
  <div class="footer">
    <p>Questions? Reply to this email or contact us at <a href="mailto:${CONFIG.REPLY_TO}">${CONFIG.REPLY_TO}</a></p>
    <p style="margin-top:10px;color:#ccc;">Young Scientist Academy &bull; Youth STEM Summit 2026</p>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;text-align:left;">
      <p style="font-size:12px;color:#aaa;margin:0 0 2px;">--</p>
      <p style="font-size:13px;font-weight:700;color:#444;margin:0 0 2px;">Madeline "Maddie" Woodhouse</p>
      <p style="font-size:12px;color:#777;margin:0 0 12px;">Chair, Global STEM Ambassador</p>
      <a href="https://www.youngscientistacademy.org"><img src="${logoSrc}" alt="Young Scientist Academy" style="height:60px;width:auto;display:block;margin-bottom:6px;"></a>
      <a href="https://www.youngscientistacademy.org" style="font-size:12px;color:#2ec4b6;text-decoration:none;">www.youngscientistacademy.org</a>
    </div>
  </div>
</div></body></html>`;
}
