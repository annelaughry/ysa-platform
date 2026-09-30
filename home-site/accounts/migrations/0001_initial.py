import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('bio', models.TextField(blank=True, default='')),
                ('team', models.CharField(blank=True, default='', max_length=100)),
                ('country', models.CharField(blank=True, default='', max_length=100)),
                (
                    'role',
                    models.CharField(
                        choices=[
                            ('ambassador', 'Ambassador'),
                            ('teacher', 'Teacher'),
                            ('staff', 'Staff'),
                            ('admin', 'Admin'),
                        ],
                        default='ambassador',
                        max_length=20,
                    ),
                ),
                ('avatar_config', models.JSONField(default=dict)),
                (
                    'user',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='profile',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
