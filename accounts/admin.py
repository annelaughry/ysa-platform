from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'team', 'country', 'role')
    list_filter = ('role', 'country')
    search_fields = ('user__username', 'user__email', 'team', 'country')
    raw_id_fields = ('user',)
