from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django import forms
from django.conf import settings
from .models import Profile


class ProfileEditForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('bio', 'team', 'country', 'role')
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Tell us about your research...'}),
            'team': forms.TextInput(attrs={'placeholder': 'e.g. Code Green'}),
            'country': forms.TextInput(attrs={'placeholder': 'e.g. United States'}),
        }


def register(request):
    """Accounts are created on the lesson library so one login works on both sites."""
    return redirect(settings.LESSON_LIBRARY_URL.rstrip('/') + '/register')


@login_required
def profile(request):
    profile_obj, _ = Profile.objects.get_or_create(user=request.user)
    saved = False

    if request.method == 'POST':
        form = ProfileEditForm(request.POST, instance=profile_obj)
        if form.is_valid():
            form.save()
            saved = True
    else:
        form = ProfileEditForm(instance=profile_obj)

    avatar_url = f'https://api.dicebear.com/7.x/avataaars/svg?seed={request.user.username}'
    return render(request, 'accounts/profile.html', {
        'form': form,
        'profile': profile_obj,
        'avatar_url': avatar_url,
        'saved': saved,
    })
