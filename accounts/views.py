from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import Profile


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=False, help_text='Optional — used for account recovery.')

    class Meta(UserCreationForm.Meta):
        fields = ('username', 'email', 'password1', 'password2')


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
    if request.user.is_authenticated:
        return redirect('/ambassadors/')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            if form.cleaned_data.get('email'):
                user.email = form.cleaned_data['email']
                user.save()
            # authenticate then log in
            raw_password = form.cleaned_data['password1']
            user = authenticate(username=user.username, password=raw_password)
            login(request, user)
            return redirect('/ambassadors/')
    else:
        form = RegisterForm()

    return render(request, 'accounts/register.html', {'form': form})


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
