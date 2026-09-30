# YSA Platform — ysalive
## CLAUDE.md — Full Project Context

**Project:** YSA Platform (internal codename: ysalive / Pippit)
**Builder:** Maddie Woodhouse — Youth Programs & Technology Lead, Young Scientist Academy
**Role:** App manager + ambassador mentor. Building the full YSA digital platform as an internship project.
**Org:** Young Scientist Academy (youngscientistacademy.org), Wilmington NC
**Email:** gsachair@youngscientistacademy.org
**GitHub:** github.com/maddi3sky/ysa-platform

---

## What This Project Is

A Django-based multi-app platform serving as the central hub for the Young Scientist Academy. Public-facing landing page + internal ambassador tools. Built from scratch by Maddie.

**Live public site (old):** ysalive.netlify.app
**Local dev:** `localhost:8000` (run `python3 manage.py runserver` with venv activated)

---

## How to Run Locally

```bash
cd ~/Documents/ysalive
source venv/bin/activate
python3 manage.py migrate        # first time only
python3 manage.py runserver
```

If Django not found in venv:
```bash
pip3 install django --break-system-packages
```

For Code Green embed at /research/code-green/ — run in a second terminal:
```bash
cd ~/Desktop/codegreen && python3 -m http.server 8080
```

---

## Project Structure

```
ysalive/
├── ysa_platform/           # Django project config
│   ├── settings.py         # INSTALLED_APPS, LOGIN_URL, TEMPLATES
│   └── urls.py             # Root URL routing
├── home/                   # Public landing page app
│   ├── templates/home/index.html   # Main page — extends base.html
│   └── urls.py
├── accounts/               # Auth app — login, register, profile
│   ├── models.py           # Profile (OneToOne to User)
│   ├── views.py            # register(), profile() + Django LoginView/LogoutView
│   └── templates/accounts/ # login.html, register.html, profile.html
├── ambassadors/            # Ambassador program app
│   ├── models.py           # Team, Ambassador, PointEntry
│   ├── views.py            # dashboard, teams, leaderboard, quiz, quiz_result
│   └── templates/ambassadors/
├── research/               # Research hub app
│   ├── views.py            # hub, code_green (iframe), hydroterra (redirect)
│   └── templates/research/
├── templates/
│   └── base.html           # Shared layout — all apps extend this
├── logos/                  # Team logo files
├── photos/                 # Summit photos (used in home page ticker)
├── db.sqlite3              # Local dev database (gitignored)
├── manage.py
└── .gitignore
```

**Also in this repo root (separate, older project — see "Related Projects" below):** a full static HTML site (`index.html`, `agenda.html`, `rsvp.html`, `messages.html`, `checkin.html`, `photos.html`, `balloon.html`, `hydroterra.html`, `saturday-workshop.html`, `ambassador-certificate.html`, `qr_poster.html`, plus `Code.gs` / `SummitPassScript.gs`, team logo assets, summit photos, PDFs). This is the **YSA Youth STEM Summit 2026** event site (Firebase + Google Apps Script backed, no Django involvement) — do not confuse its files with the Django app's templates. None of those static pages implement a dark/light theme toggle, so the theme bug described below does not apply to them.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Django 5.2 |
| Database | SQLite (dev) |
| Auth | Django built-in auth + accounts app |
| Templates | Django templates, APP_DIRS: True |
| Fonts | Inter + Playfair Display (Google Fonts CDN) |
| CSS | Inline styles, CSS custom properties — no Bootstrap, no Tailwind |
| JS | Vanilla JS — no build step |
| Avatars | DiceBear API (avataaars style, seeded by username) |

---

## URL Structure

| URL | App | View |
|-----|-----|------|
| `/` | home | Landing page (5 tabs: Home/About/Programs/Media/Donate) |
| `/accounts/login/` | accounts | Login |
| `/accounts/logout/` | accounts | Logout |
| `/accounts/register/` | accounts | Register |
| `/accounts/profile/` | accounts | Profile (login required) |
| `/ambassadors/` | ambassadors | Dashboard (login required) |
| `/ambassadors/teams/` | ambassadors | All teams grid |
| `/ambassadors/leaderboard/` | ambassadors | Points leaderboard |
| `/ambassadors/quiz/` | ambassadors | Team selector quiz |
| `/ambassadors/quiz/result/` | ambassadors | Quiz result |
| `/research/` | research | Research hub |
| `/research/code-green/` | research | Code Green embed (iframe localhost:8080) |
| `/research/hydroterra/` | research | Redirect → water-moldova.onrender.com |
| `/admin/` | django admin | Admin panel |

---

## Brand Colors & Design System

```css
--teal:     #3cbbb1   /* primary accent */
--lavender: #bbbdf6   /* secondary accent */
--pink:     #ee4266   /* CTA / highlight */
--dark:     #0a0f0d   /* page background */
--gold:     #f1b643   /* warning / explorer teams */
--amber:    #c4903a   /* secondary gold */
--off-white:#f5f5f0   /* body text */
--card-bg:  #111a15   /* card backgrounds */
--border:   rgba(245,245,240,0.08)

/* Light mode: body.light swaps --dark/--off-white/--card-bg/--border (see Theme System below) */
/* Colorblind mode (deuteranopia): teal→#0077bb, pink→#cc3311, gold→#ee7733, lavender→#33bbee, amber→#ee3377 */
```

Fonts: Inter (body), Playfair Display (headings/hero)
Nav height: 64px (`--nav-h: 64px`)
All templates: inline `<style>` blocks — no separate CSS files

---

## Theme System (dark/light/accent/font-size/colorblind)

**Shared mechanics live in `templates/base.html`** so every page — not just the home page — respects the user's saved settings:

- `base.html`'s `<style>` `:root` defines the default (dark) values for `--teal`, `--lavender`, `--pink`, `--dark`, `--gold`, `--amber`, `--off-white`, `--card-bg`, `--border`.
- `body.light` (also in `base.html`) redefines `--dark`, `--card-bg`, `--off-white`, `--border` to light-mode values. Because everything downstream references these variables, the whole page flips automatically.
- `body.colorblind` (also in `base.html`) redefines the accent colors for deuteranopia-friendly alternatives.
- `body.font-lg` / `body.font-sm` (also in `base.html`) adjust base font size.
- A small inline `<script>` at the very top of `<body>` in `base.html` reads `localStorage` (`ysa-theme`, `ysa-accent-hex`, `ysa-font-size`, `ysa-colorblind`) on every page load and applies the `light`/`colorblind`/`font-*` body classes + the `--teal` accent override. This runs before the nav renders to avoid a flash of the wrong theme.
- The **settings panel UI itself** (⚙️ gear, theme buttons, accent swatches, TTS controls, reduced motion toggle) only exists on the home page (`home/templates/home/index.html`) — the gear icon everywhere else links to `/?settings=1` to get there. Its JS (`setTheme`, `setAccent`, `setFontSize`, `toggleColorblind`, `toggleReducedMotion`, `resetSettings`) writes to the same `localStorage` keys base.html's script reads, plus does extra UI-only work (button active-states, TTS controls) that only makes sense on that page.
- Default theme: **dark**. If localStorage has stale 'light', clear with:
```javascript
localStorage.removeItem('ysa-theme'); location.reload();
```

### ⚠️ Critical rule: never hardcode `--off-white` / `--dark` / `--card-bg` as literal values

**Bug fixed 2026-08 (worth re-reading before touching any template's CSS):** Nearly every template had text/background colors written as literal `rgba(245,245,240,X)` or `#f5f5f0` / `#0a0f0d` / `#111a15` instead of referencing the CSS variables. This "worked" for months because light mode was only ever toggled on the home page — but the moment theme persistence was extended platform-wide (so login/profile/dashboard/teams/leaderboard/quiz/hub/code_green would also respect a saved light-mode preference), those hardcoded values stopped flipping and text became invisible (near-white text on a near-white background, or dark-on-dark).

**The fix, applied across `home/index.html`, `accounts/{login,register,profile}.html`, `ambassadors/{dashboard,teams,leaderboard,quiz,quiz_result}.html`, and `research/{hub,code_green}.html`:**
- Any translucent off-white color (`rgba(245,245,240, X)`) → `color-mix(in srgb, var(--off-white) X%, transparent)` (X = opacity × 100). This preserves the exact look in dark mode but automatically resolves to a dark, readable tone once `--off-white` flips in light mode.
- Any full-opacity literal (`#f5f5f0`, `#0a0f0d`, `#111a15`) used as an actual color/background (as opposed to inside a `:root`/`body.light` variable *definition*, which must keep its literal value) → `var(--off-white)` / `var(--dark)` / `var(--card-bg)` respectively.
- **When adding new CSS to any template, always reach for `var(--off-white)`, `var(--dark)`, `var(--card-bg)`, `var(--border)` (or a `color-mix(...)` built from them) — never the literal hex/rgba.** Brand accent colors (`--teal`, `--lavender`, `--pink`, `--gold`, `--amber`) are the exception: those are meant to stay constant across dark/light and are literals by design (they only shift under colorblind mode).
- The nav bar and bottom app-switcher strip (in `base.html`) intentionally keep a fixed dark background (`rgba(10,15,13,0.92)` / `rgba(10,15,13,0.97)`) regardless of theme — this is a deliberate "always-dark toolbar" look, not a bug, so their light-gray text (`rgba(245,245,240,X)`) is correct to stay hardcoded there.

---

## Django Settings (key bits)

```python
INSTALLED_APPS = ['home', 'accounts', 'ambassadors', 'research', ...]
TEMPLATES DIRS = [BASE_DIR / 'templates']   # for shared base.html
LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/ambassadors/'
LOGOUT_REDIRECT_URL = '/'
```

---

## base.html (shared layout)

`templates/base.html` — all apps extend this. Provides:
- A settings/theme-persistence init script at the top of `<body>` (see Theme System above) — runs on every page.
- Sticky top nav (64px): YSA logo → `/`, nav links, settings gear (⚙️ → `/?settings=1`), login/profile button
- `{% block extra_css %}` in `<head>`
- `{% block content %}` for page body
- `{% block extra_js %}` before `</body>`
- Fixed bottom app-switcher strip for logged-in users (🏠 Home | 🌐 Ambassador App | 🌿 Code Green | 💧 HydroTerra)
- Mobile hamburger menu

**To create a new page:** extend base.html and fill the blocks:
```html
{% extends 'base.html' %}
{% block content %}
  <!-- your content -->
{% endblock %}
```

---

## Accounts App

**Profile model fields:** bio, team (CharField), country, role (ambassador/teacher/staff/admin), avatar_config (JSONField)

Signal auto-creates Profile on User creation (`post_save`).

Avatar URL pattern: `https://api.dicebear.com/7.x/avataaars/svg?seed={{ user.username }}`

Login redirects to `/ambassadors/`. Logout redirects to `/`.

---

## Ambassadors App

**Models:** Team, Ambassador (OneToOne to User), PointEntry

**Status levels** (based on Ambassador.points):
- 0–49: Observer
- 50–149: Hypothesis
- 150–349: Experimenter
- 350–699: Analyst
- 700–1199: Researcher
- 1200+: Principal Investigator

**Teams (hardcoded in views.py as GSA_TEAMS + EXPLORER_TEAMS):**

GSA Teams (Global STEM Ambassadors):
- Code Green 🇺🇸 — urban greenspace/heat islands, Wilmington NC
- Lab Rats 🇺🇸 — Martian ecology
- Forța 🇺🇸 — jellyfish/ocean warming
- Dive Deep 🇺🇸 — marine biodiversity
- Stealth 🇾🇪 — weather balloon engineering
- Supernovas 🇺🇸 — atmospheric science
- Codrii Minds 🇲🇩 — Codrii Reserve biodiversity
- Noroc Science 🇲🇩 — air quality
- 20dm³ 🇲🇩 — chemistry/materials
- HydroTerra 🇲🇩 — water quality

Explorer Teams:
- Şacal 🇲🇩 — wildlife/forest ecology
- Capybara 🇲🇩 — wetlands
- Ice Bee 🇲🇩 — pollinators
- Gravity Goats 🇸🇾 — physics experiments

**Leaderboard:** `?view=individual` (default) or `?view=team`

**Quiz:** 5-question JS flow — scores answers — POST → redirects to `/ambassadors/quiz/result/?team=<slug>`

---

## Home App (Public Landing Page)

Single page with 5 tabs switched by JS `showSection()`:
- **Home** — hero, stats (350+ youth/week, 4 countries, founded 2017, 5th summit), feature cards, photo ticker
- **About** — mission, founding story (Dr. Rob Condon, 2017), MD partnership (2023)
- **Programs** — sub-tabs: Overview / Calendar / Sign-Ups
- **Media** — photo gallery, summit highlights
- **Donate** — donation CTA + partner logos

**Photo ticker:** CSS animation (`photoScroll`), 36s loop, mask-image fade on edges, pauses on hover. Photos are in `/photos/` folder.

**Settings panel** (⚙️ gear) — lives only on this page (see Theme System above for how it persists elsewhere):
- Theme: dark/light toggle
- Accent color: 5 swatches (teal/lavender/pink/gold/amber)
- Font size: S/M/XL
- Accessibility: colorblind mode (deuteranopia), text-to-speech, reduced motion (`body.reduced-motion` kills all CSS animations/transitions)
- All persisted to localStorage (`ysa-theme`, `ysa-accent-name`, `ysa-accent-hex`, `ysa-font-size`, `ysa-colorblind`, `ysa-tts`, `ysa-reduced-motion`)
- Opens via `?settings=1` URL param (used by base.html gear link)

---

## Research App

**hub.html** — cards for all 14 team research projects. Code Green → `/research/code-green/`, HydroTerra → `/research/hydroterra/`, others → "Presentation coming soon"

**code_green.html** — full-screen iframe pointing to `http://localhost:8080` (user must run `python3 -m http.server 8080` in `~/Desktop/codegreen`). Shows yellow banner if server not running.

**hydroterra view** — `redirect('https://water-moldova.onrender.com')` — Render cold-start is handled on the hydroterra.html side.

---

## Related Projects

**~/Desktop/codegreen/** — Code Green greenspace tracker. Standalone single-file web app (`greenspace_map.html` is the actual main file, `index.html` is a copy). Leaflet.js map, Firebase Auth/Firestore, Sentinel-2 satellite data. Has its own CLAUDE.md with full context. Run with `python3 -m http.server 8080`.

**ysalive repo root (static site)** — The older **YSA Youth STEM Summit 2026** event site: `index.html` (summit hub), `agenda.html` (5-day agenda + balloon easter egg), `rsvp.html` (multilingual RSVP), `messages.html` (Firebase chat), `checkin.html` (staff check-in), `photos.html`, `balloon.html`, `hydroterra.html`, `saturday-workshop.html`, `ambassador-certificate.html`, `qr_poster.html`. Backed by Firebase Realtime DB/Auth + Google Apps Script (`Code.gs`, `SummitPassScript.gs`), not Django. Still referenced live at `ysalive.netlify.app`. Teams/branding overlap with the Django app but it's a separate, unrelated codebase — don't assume fixes in one apply to the other. No dark/light theme toggle exists on any of these pages.

**water-moldova.onrender.com** — HydroTerra water quality app (separate project, hosted on Render free tier — has cold-start delay).

---

## Security Notes

- Passphrase for protected pages: `32KMPAYLOAD` (do NOT put this in public-facing code)
- No personal security-sensitive info (specific meeting times/locations for government meetings) in public pages
- Transnistria and Ukraine are completely off-limits topics for the platform

---

## Known Issues / TODO

- [x] ~~Theme/dark-light bug — invisible text in light mode~~ — fixed 2026-08 by converting hardcoded off-white/dark colors to CSS-variable-based `color-mix()`/`var()` across all templates; theme/accent/font-size/colorblind now persist platform-wide via `base.html` (see Theme System above)
- [ ] Point awarding UI — no admin way to give ambassadors points yet (use Django admin for now)
- [ ] Create superuser: `python3 manage.py createsuperuser` — access `/admin/`
- [ ] Deploy to Render (connect GitHub repo maddi3sky/ysa-platform)
- [ ] Static files for deployment: add whitenoise, run `collectstatic`
- [ ] Add team logos to teams page (files exist in `/logos/` folder)
- [ ] Firestore for Code Green comments (currently falls back to localStorage)

## Future Features

- [ ] Points shop / reward system
- [ ] Sign-up system with waitlist + reservation emails
- [ ] Country flags on ambassador cards
- [ ] Neighborhood-level Code Green breakdown
- [ ] Equity overlay on Code Green map (Census income/demographic data)
- [ ] Real-time 2026 greenspace data integration
- [ ] Connect Code Green as Django `greenspace` app (replace Firebase)
- [ ] HYP social layer
- [ ] Extend the home-page settings panel UI (not just its persisted effects) to other pages, if users end up wanting to change theme without navigating back to `/`

---

## Deployment (Render)

When ready to deploy:
1. Add `whitenoise` to requirements: `pip3 install whitenoise --break-system-packages`
2. Add to `MIDDLEWARE` (after SecurityMiddleware): `'whitenoise.middleware.WhiteNoiseMiddleware'`
3. Set `STATIC_ROOT = BASE_DIR / 'staticfiles'`
4. Run `python3 manage.py collectstatic`
5. Add `requirements.txt`: `pip3 freeze > requirements.txt`
6. On Render: New Web Service → connect maddi3sky/ysa-platform → build command: `pip install -r requirements.txt && python manage.py migrate` → start command: `gunicorn ysa_platform.wsgi`
7. Add env var: `DJANGO_SECRET_KEY` (generate a new one for prod)

---

## Update: combined repository

This app now lives in `home-site/` of the combined YSA Platform repository, next to the
lesson library (`lesson-library/`, formerly TeachSTEM). Logins are shared: the home site
authenticates against the lesson library's `/api/auth/login/` (see `accounts/backends.py`),
and registration happens on the lesson library. See the root `README.md`.
