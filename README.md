# YSA Platform

Young Scientist Academy's web apps, kept together in one repository.

| Folder | What it is | Tech |
|---|---|---|
| `home-site/` | The main YSA site: landing page, ambassador program, research, summit | Django templates |
| `lesson-library/` | TeachSTEM, the lesson database and teaching dashboard | Django REST API + React (Vite) |

The two apps are still deployed separately, but they are connected:

- **Shared navigation.** The home site's nav bar has a *Lesson Library* button, and the lesson library's nav bar has a *YSA Home* button.
- **One login.** Accounts live in the lesson library. When someone signs in on the home site, it checks their username and password with the lesson library (`home-site/accounts/backends.py`), so the same login works on both. "Register" on the home site sends people to the lesson library's sign-up page. The home site never stores passwords.

## Running locally

Run each app in its own terminal.

**Lesson library** (http://localhost:8000):

```bash
cd lesson-library
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DJANGO_DEBUG=True python manage.py migrate
DJANGO_DEBUG=True python manage.py runserver 8000
# React front end, in another terminal:
cd frontend && npm install && npm run dev
```

**Home site** (http://localhost:8001):

```bash
cd home-site
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
LESSON_LIBRARY_URL=http://localhost:8000 python manage.py runserver 8001
```

## Settings that connect the apps

| App | Setting | Default | Purpose |
|---|---|---|---|
| home-site | `LESSON_LIBRARY_URL` | `https://teachstem.onrender.com` | Where the Lesson Library button and the shared login point |
| home-site | `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS` | development-only values | Must be set when the home site is deployed |
| lesson-library | `VITE_YSA_HOME_URL` (build time) | `https://youngscientistacademy.org` | Where the YSA Home button points |

When the home site has its live address, set `VITE_YSA_HOME_URL` to it on Render and redeploy the lesson library.

## History

The full commit history of both apps is preserved. The original repositories were
`maddie-ysa/ysa-main` (now `home-site/`) and `annelaughry/TeachSTEM` (now `lesson-library/`).
