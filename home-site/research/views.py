from django.shortcuts import render, redirect


def hub(request):
    return render(request, 'research/hub.html')


def code_green(request):
    return render(request, 'research/code_green.html')


def hydroterra(request):
    return redirect('https://water-moldova.onrender.com')
