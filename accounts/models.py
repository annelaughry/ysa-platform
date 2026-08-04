from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    ROLE_CHOICES = [
        ('ambassador', 'Ambassador'),
        ('teacher', 'Teacher'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    team = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ambassador')
    avatar_config = models.JSONField(default=dict)

    def __str__(self):
        return f'{self.user.username} — {self.get_role_display()}'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
