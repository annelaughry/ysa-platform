"""
Shared login: the lesson library (TeachSTEM) owns every YSA account.

When someone logs in on the home site, this backend sends their username and
password to the lesson library's login API. If the lesson library accepts
them, we create (or refresh) a matching local user here and log them in.

That means:
  * People use ONE username + password for both sites.
  * New accounts are created on the lesson library (/register there).
  * Passwords are never stored on the home site.

Local Django superusers (created with `manage.py createsuperuser`) can still
log in to /admin/ via the normal ModelBackend listed after this one.
"""
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

logger = logging.getLogger(__name__)


class LessonLibraryBackend(BaseBackend):
    timeout_seconds = 10

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        url = settings.LESSON_LIBRARY_URL.rstrip('/') + '/api/auth/login/'
        body = json.dumps({'username': username, 'password': password}).encode()
        req = urllib.request.Request(
            url, data=body, method='POST',
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code not in (400, 401):
                logger.warning('Lesson library login returned HTTP %s', e.code)
            return None
        except (urllib.error.URLError, TimeoutError, ValueError) as e:
            logger.error('Could not reach lesson library for login: %s', e)
            return None

        remote = data.get('user') or {}
        remote_username = remote.get('username')
        if not remote_username:
            return None

        User = get_user_model()
        user, created = User.objects.get_or_create(username=remote_username)
        user.first_name = remote.get('first_name', '') or ''
        user.last_name = remote.get('last_name', '') or ''
        user.email = remote.get('email', '') or ''
        # Lesson-library admins are admins here too.
        user.is_staff = bool(remote.get('is_staff'))
        user.is_superuser = bool(remote.get('is_superuser'))
        if created or user.has_usable_password():
            # The lesson library is the only place passwords live.
            user.set_unusable_password()
        user.save()

        # Keep the home-site role roughly in line with the lesson library.
        profile = getattr(user, 'profile', None)
        if profile is not None and created:
            if remote.get('is_superuser'):
                profile.role = 'admin'
            elif remote.get('is_program_staff') or remote.get('is_staff'):
                profile.role = 'staff'
            elif remote.get('is_teacher'):
                profile.role = 'teacher'
            profile.save()

        return user if self.user_can_authenticate(user) else None

    def user_can_authenticate(self, user):
        return getattr(user, 'is_active', True)

    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
