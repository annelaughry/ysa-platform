# YSA Youth STEM Summit 2026 — Project Brief

**Owner:** Madeline "Maddie" Woodhouse (Code Green · GSA Chair)
**Email:** gsachair@youngscientistacademy.org
**Summit dates:** July 11–15, 2026
**Location:** Lozova & Codrii Nature Reserve, Moldova

This file gives full context for any new Claude session working on this project. Read it before touching any files.

---

## What This Is

A full-stack event website and operations system for the **YSA Youth STEM Summit 2026** — a joint Moldova/USA youth science summit. The site is the public-facing hub for 14 student research teams, an RSVP system, a live chat, a check-in system, and a full 5-day agenda.

The website lives at `/Users/maddi/Documents/teamlogos/` and is also referenced in screenshots as running on `localhost`.

---

## File Structure

```
/Users/maddi/Documents/teamlogos/
├── index.html          # Main summit hub — hero, countdown, teams, schedule, RSVP embed
├── agenda.html         # Full 5-day agenda (Jul 11–15) with day tabs + collapse
├── rsvp.html           # Standalone multilingual RSVP form (EN/RO/RU)
├── messages.html       # Summit chat (Firebase Realtime DB + Auth)
├── checkin.html        # Staff check-in dashboard (Firebase)
├── CLAUDE.md           # This file
│
├── logos/
│   ├── sacal.svg           # Şacal — front-facing wolf face, forest green bg
│   ├── codrii_minds.svg    # Codrii Minds — deer face, glowing teal eyes
│   ├── gravity_goats.svg   # Gravity Goats — flask head, goggle eyes, test tube horns
│   ├── hydroterra.svg
│   ├── codegreen_new.png
│   ├── labrats_new.png
│   ├── supernovas_new.png
│   ├── divedeep.png
│   ├── stealth.png
│   └── noroc.jpg
│
├── capybara.png
├── ice bees.png
├── forta-logo.svg
├── 20dmlogo.png
└── (other team assets)
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework |
| Fonts | Inter + Playfair Display (Google Fonts) |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Firebase Realtime Database |
| Backend | Google Apps Script (doGet/doPost) |
| Translation | Google Translate widget (parent page) + postMessage (iframe) |
| Hosting | localhost / TBD deployment |

### Firebase Config (in index.html and messages.html)
Look for `firebaseConfig` object — already wired up to the YSA project.

### Google Apps Script
- `Code.gs` — handles RSVP submissions, check-in events, Saturday workshop attendees
- Deployed as web app, URL embedded in rsvp.html and checkin.html
- Functions: `doGet`, `doPost`, `getSaturdayWorkshopAttendees`

---

## Design System

```css
--teal:      #3cbbb1   /* primary accent */
--lavender:  #bbbdf6   /* secondary accent */
--pink:      #ee4266   /* highlight / Explorer program */
--dark:      #0a0f0d   /* background */
--gold:      #f1b643   /* Ambassador program / warm accent */
--amber:     #c4903a   /* Şacal team color / warm secondary */
--off-white: #f5f5f0   /* body text */
```

Font: `'Inter', sans-serif` — weights 300–900
Display font: `'Playfair Display'` — used for hero headings (italic teal = emphasis)

Logo design pattern for SVG team logos:
- Circular clip (500×500 viewBox)
- Dark radial gradient background
- Front-facing animal face (not profile — reads better at logo size)
- Glowing teal eyes are the hero feature
- Team name text at bottom in Arial Black / Impact

---

## Teams

### 🌐 Global STEM Ambassador Program

| Key | Name | Flag | Color | Logo |
|---|---|---|---|---|
| codrii | Codrii Minds | 🇲🇩 | #3cbbb1 | logos/codrii_minds.svg |
| noroc | Noroc Science | 🇲🇩 | #bbbdf6 | logos/noroc.jpg |
| dm3 | 20dm³ | 🇲🇩 | #f1b643 | 20dmlogo.png |
| hydroterra | HydroTerra | 🇲🇩 | #3cbbb1 | logos/hydroterra.svg |
| codegreen | Code Green | 🇺🇸 | #3cbbb1 | logos/codegreen_new.png |
| labrats | Lab Rats | 🇺🇸 | #bbbdf6 | logos/labrats_new.png |
| forta | Forța | 🇺🇸 | #ee4266 | forta-logo.svg |
| divedeep | Dive Deep | 🇺🇸 | #3cbbb1 | logos/divedeep.png |
| stealth | Stealth | 🇾🇪 | #f1b643 | logos/stealth.png |
| supernovas | Supernovas | 🇺🇸 | #bbbdf6 | logos/supernovas_new.png |

### 🔬 STEM Explorer Program

| Key | Name | Flag | Color | Logo |
|---|---|---|---|---|
| sacal | Şacal | 🇲🇩 | #c4903a | logos/sacal.svg |
| capybara | Capybara | 🇲🇩 | #a07850 | capybara.png |
| icebee | Ice Bee | 🇲🇩 | #7dd3fc | ice bees.png |
| gravitygoats | Gravity Goats | 🇸🇾 | #f0b429 | logos/gravity_goats.svg |

### Key people
- **Finley Hidek** — Lab Rats (US) — co-leads Sat Jul 11 STEM workshop
- **Dana Zuev** — Codrii Minds (MD) — co-leads Sat Jul 11 STEM workshop
- **Akram Qasim** — Stealth (YE) — weather balloon engineering
- **Bessan Ayash** — Gravity Goats (SY) — team lead
- **Genevieve Banks** — Dive Deep (US)
- **Madeline Woodhouse** — Code Green (US) — GSA Chair, site owner

---

## RSVP System (rsvp.html)

- Standalone page, embedded in index.html via `<iframe src="rsvp.html">`
- Three languages: EN / RO / RU — toggled via URL param `?lang=ru` or `postMessage` from parent
- Language toggle buttons were **removed** from inside the iframe — Google Translate on parent handles it
- Maybe/Yes/No attendance options — Maybe shows full form + yellow note, No hides form
- Saturday section labeled **"Community STEM Field Workshop"** with "See full agenda →" link to agenda.html
- Submissions go to Google Apps Script `doPost` endpoint

### Translation object keys (all three must be updated together):
`sectionSat`, `sat`, `maybe`, `maybeNote`, `lbl-yes`, `lbl-no`, `lbl-maybe`, etc.

---

## Agenda (agenda.html)

- 5 day tabs: Sat Jul 11, Sun Jul 12, Mon Jul 13, Tue Jul 14, Wed Jul 15
- Sticky day tabs + floating "↑ Hide agenda" button appears after 280px scroll
- Collapse/expand per day — clicking Hide collapses timeline, adds "↓ Show full agenda" button in hero
- Switching tabs always auto-expands the new day
- Hash navigation: `agenda.html#d12` etc.
- **Easter egg:** 🎈 on Jul 12 (badge + LAUNCH title) — click to launch balloon animation

### Balloon easter egg (both index.html and agenda.html):
1. Click → inflate to 4.5× (spring easing, 0.5s)
2. Fly clone launches — starts at scale(2.4), rises over 5s ease-in
3. Clouds (☁️) drift left/right during lower half of climb
4. Stars (⭐✨🌟💫) appear in upper half
5. Toast: "🛰️ Payload at 32km — sensors nominal!" (Stealth + Supernovas)
6. Resets after 4s — can relaunch

---

## Check-in System (checkin.html)

Staff-only page. Tabs: Day 1 (Mon Jul 13), Day 2 (Tue Jul 14), Saturday Workshop (Jul 11).
- Reads signups from Firebase `signups/` node
- Marks attendance in Firebase `checkin/` node
- Stats panel: total checked in, maybe count, not-yet count
- `getSaturdayWorkshopAttendees()` in Code.gs pulls Saturday workshop registrants

**⚠️ PENDING:** Full Code.gs + checkin.html repaste with all current changes hasn't been done yet — this is a priority before July 11.

---

## Security — Current State & Planned

### Current (as of July 2026):
- Chat (messages.html): requires Firebase Auth (email/password or Google) — no guest access
- Main site (index.html, agenda.html): **fully public** — anyone with URL can view
- Check-in (checkin.html): no auth gate currently

### Planned improvements:
- **Passphrase wall** on sensitive sections (chat, check-in, exact locations) — single shared event code distributed in Summit Pass emails
- **Email verification** required before chat posting
- **2FA on admin accounts** (Maddie's Google/Firebase accounts) — do this NOW regardless of other decisions
- Manual approval flow rejected as too much overhead for guests

---

## Pending Tasks (as of July 6, 2026)

### 🔴 Must-have before July 11:
- [ ] Code.gs + checkin.html full repaste (Maybe badges, Saturday workshop, email field)
- [ ] QR code scanner check-in (#27)
- [ ] QR code display for keynote (#42)
- [ ] Saturday workshop public sign-up form (#40)
- [ ] Passphrase security wall (in progress discussion)

### 🟡 Good to have before summit:
- [ ] Ambassador profiles with tenure (#41)
- [ ] Weather balloon dedicated page (#32)
- [ ] Agenda page — revisit and refine (#20)

### 🟢 Post-summit / needs external input:
- [ ] Moldova culture section — waiting on Rob's photos (#25)
- [ ] Deer cam gallery (#29)
- [ ] Greenspace heat map (#33)
- [ ] HydroTerra water quality landing page (#35)
- [ ] Code Green greenspace dashboard (#23)
- [ ] More easter eggs (#50)
- [ ] Photos/videos in chat (#36)

---

## Key Decisions Made

- **Team layout:** Two program sections (Global STEM Ambassador + STEM Explorer) — not by country
- **RSVP:** Own rsvp.html instead of Google Forms iframe — Google Forms blocked by cookie restrictions on localhost
- **Logo style:** Front-facing animal faces work better than profiles at logo size
- **Maybe in RSVP:** Shows full form (captures info) + yellow note — vs No which hides everything
- **Language in iframe:** Parent Google Translate handles iframe — no duplicate toggle inside rsvp.html
- **Agenda collapse:** Floating "↑ Hide agenda" button after 280px scroll, not inline at bottom
- **Chat security:** Guest access removed — Firebase auth required

---

## Notes for New Sessions

- Always check this file first before asking questions about the project
- The teamData object in index.html is the source of truth for team info
- SVG logos use 500×500 viewBox — keep consistent
- When editing rsvp.html translations, update all three objects: `T.en`, `T.ro`, `T.ru`
- The `--tc` CSS custom property is used for team circle accent colors in team cards
- `object-fit: cover; padding: 0` for team circle images that should fill the circle
- Stealth flag is 🇾🇪 (Yemen — Akram's country), NOT 🇺🇸
- Gravity Goats flag is 🇸🇾 (Syria — Bessan's country)
