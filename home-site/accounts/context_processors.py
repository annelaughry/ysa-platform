from django.conf import settings


def ysa_links(request):
    """Makes the lesson library address available to every template."""
    base = settings.LESSON_LIBRARY_URL.rstrip('/')
    return {
        'LESSON_LIBRARY_URL': base + '/',
        'LESSON_LIBRARY_REGISTER_URL': base + '/register',
    }
