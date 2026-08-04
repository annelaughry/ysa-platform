import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(unique=True)),
                ('flag_emoji', models.CharField(blank=True, max_length=10)),
                ('color', models.CharField(default='#3cbbb1', help_text='Hex color code', max_length=7)),
                ('description', models.TextField(blank=True)),
                ('program', models.CharField(
                    choices=[('gsa', 'Global STEM Ambassador'), ('explorer', 'STEM Explorer')],
                    default='gsa',
                    max_length=10,
                )),
                ('country', models.CharField(blank=True, max_length=100)),
                ('logo_url', models.CharField(blank=True, max_length=500)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Ambassador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.IntegerField(default=0)),
                ('joined', models.DateField(auto_now_add=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ambassador',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('team', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='ambassadors',
                    to='ambassadors.team',
                )),
            ],
            options={
                'ordering': ['-points'],
            },
        ),
        migrations.CreateModel(
            name='PointEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.IntegerField()),
                ('reason', models.CharField(max_length=255)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('ambassador', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='point_entries',
                    to='ambassadors.ambassador',
                )),
            ],
            options={
                'ordering': ['-created'],
            },
        ),
    ]
