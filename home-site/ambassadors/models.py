from django.db import models
from django.contrib.auth.models import User


class Team(models.Model):
    PROGRAM_CHOICES = [
        ('gsa', 'Global STEM Ambassador'),
        ('explorer', 'STEM Explorer'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    flag_emoji = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=7, default='#3cbbb1', help_text='Hex color code')
    description = models.TextField(blank=True)
    program = models.CharField(max_length=10, choices=PROGRAM_CHOICES, default='gsa')
    country = models.CharField(max_length=100, blank=True)
    logo_url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Ambassador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ambassador')
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='ambassadors')
    points = models.IntegerField(default=0)
    joined = models.DateField(auto_now_add=True)

    STATUS_LEVELS = [
        (0,    49,   'Observer',               '#bbbdf6'),
        (50,   149,  'Hypothesis',              '#3cbbb1'),
        (150,  349,  'Experimenter',            '#3cbbb1'),
        (350,  699,  'Analyst',                 '#f1b643'),
        (700,  1199, 'Researcher',              '#ee4266'),
        (1200, None, 'Principal Investigator',  '#f1b643'),
    ]

    @property
    def status_level(self):
        for low, high, label, _ in self.STATUS_LEVELS:
            if high is None or self.points <= high:
                if self.points >= low:
                    return label
        return 'Observer'

    @property
    def status_color(self):
        for low, high, _, color in self.STATUS_LEVELS:
            if high is None or self.points <= high:
                if self.points >= low:
                    return color
        return '#bbbdf6'

    @property
    def next_level_points(self):
        """Points needed to reach the next level, or None if at max."""
        for low, high, label, _ in self.STATUS_LEVELS:
            if high is None or self.points <= high:
                if self.points >= low:
                    return high  # None means max level
        return None

    @property
    def progress_to_next(self):
        """Percent progress to next level (0-100)."""
        for low, high, label, _ in self.STATUS_LEVELS:
            if high is None or self.points <= high:
                if self.points >= low:
                    if high is None:
                        return 100
                    span = high - low + 1
                    earned = self.points - low
                    return min(100, int((earned / span) * 100))
        return 0

    def __str__(self):
        return f'{self.user.username} ({self.points} pts)'

    class Meta:
        ordering = ['-points']


class PointEntry(models.Model):
    ambassador = models.ForeignKey(Ambassador, on_delete=models.CASCADE, related_name='point_entries')
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.ambassador.user.username} +{self.points} — {self.reason}'

    class Meta:
        ordering = ['-created']
