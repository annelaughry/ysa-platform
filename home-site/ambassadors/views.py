from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Avg
from .models import Ambassador, Team, PointEntry


GSA_TEAMS = [
    {'name': 'Code Green',    'slug': 'code-green',    'flag': '\U0001f1fa\U0001f1f8', 'color': '#3cbbb1', 'desc': 'Urban heat islands & green space mapping, Wilmington NC', 'country': 'United States'},
    {'name': 'Lab Rats',      'slug': 'lab-rats',      'flag': '\U0001f1fa\U0001f1f8', 'color': '#bbbdf6', 'desc': 'Mars habitat ecology & Martian soil science', 'country': 'United States'},
    {'name': 'Forța',         'slug': 'forta',         'flag': '\U0001f1fa\U0001f1f8', 'color': '#ee4266', 'desc': 'Jellyfish temperature tolerance & ocean warming', 'country': 'United States'},
    {'name': 'Dive Deep',     'slug': 'dive-deep',     'flag': '\U0001f1fa\U0001f1f8', 'color': '#3cbbb1', 'desc': 'Marine biodiversity & coastal ecosystem health', 'country': 'United States'},
    {'name': 'Stealth',       'slug': 'stealth',       'flag': '\U0001f1fe\U0001f1ea', 'color': '#f1b643', 'desc': 'High-altitude weather balloon payload engineering', 'country': 'Yemen'},
    {'name': 'Supernovas',    'slug': 'supernovas',    'flag': '\U0001f1fa\U0001f1f8', 'color': '#bbbdf6', 'desc': 'Atmospheric data & near-space science', 'country': 'United States'},
    {'name': 'Codrii Minds',  'slug': 'codrii-minds',  'flag': '\U0001f1f2\U0001f1e9', 'color': '#3cbbb1', 'desc': 'Biodiversity & ecosystem research, Codrii Reserve', 'country': 'Moldova'},
    {'name': 'Noroc Science', 'slug': 'noroc-science', 'flag': '\U0001f1f2\U0001f1e9', 'color': '#bbbdf6', 'desc': 'Air quality & environmental health monitoring', 'country': 'Moldova'},
    {'name': '20dm³',    'slug': '20dm3',         'flag': '\U0001f1f2\U0001f1e9', 'color': '#f1b643', 'desc': 'Chemistry & materials science research', 'country': 'Moldova'},
    {'name': 'HydroTerra',    'slug': 'hydroterra',    'flag': '\U0001f1f2\U0001f1e9', 'color': '#3cbbb1', 'desc': 'Water quality monitoring across Moldova', 'country': 'Moldova'},
]

EXPLORER_TEAMS = [
    {'name': 'Şacal',        'slug': 'sacal',         'flag': '\U0001f1f2\U0001f1e9', 'color': '#c4903a', 'desc': 'Wildlife tracking & forest ecology', 'country': 'Moldova'},
    {'name': 'Capybara',      'slug': 'capybara',      'flag': '\U0001f1f2\U0001f1e9', 'color': '#a07850', 'desc': 'Wetland ecosystems & water mammals', 'country': 'Moldova'},
    {'name': 'Ice Bee',       'slug': 'ice-bee',       'flag': '\U0001f1f2\U0001f1e9', 'color': '#7dd3fc', 'desc': 'Pollinator health & climate adaptation', 'country': 'Moldova'},
    {'name': 'Gravity Goats', 'slug': 'gravity-goats', 'flag': '\U0001f1f8\U0001f1fe', 'color': '#f0b429', 'desc': 'Physics experiments & gravity research', 'country': 'Syria'},
]

ALL_TEAMS_BY_SLUG = {t['slug']: t for t in GSA_TEAMS + EXPLORER_TEAMS}

# Quiz scoring: map answer keys to slugs they favor
QUIZ_SCORES = {
    'q1': {
        'a': ['stealth', 'supernovas', 'gravity-goats'],
        'b': ['codrii-minds', 'sacal', 'forta', 'dive-deep'],
        'c': ['code-green', 'hydroterra', 'noroc-science'],
        'd': ['20dm3', 'lab-rats'],
    },
    'q2': {
        'a': ['code-green', 'lab-rats', 'forta', 'dive-deep', 'stealth', 'supernovas'],
        'b': ['codrii-minds', 'noroc-science', '20dm3', 'hydroterra', 'sacal', 'capybara', 'ice-bee'],
        'c': ['stealth', 'gravity-goats'],
    },
    'q3': {
        'a': ['codrii-minds', 'sacal', 'code-green', 'forta', 'dive-deep'],
        'b': ['lab-rats', '20dm3', 'gravity-goats'],
        'c': ['stealth', 'supernovas'],
        'd': ['hydroterra', 'noroc-science', 'code-green'],
    },
    'q4': {
        'a': ['code-green', 'hydroterra', 'noroc-science', 'codrii-minds'],
        'b': ['stealth', 'supernovas', 'lab-rats'],
        'c': ['forta', 'dive-deep', 'sacal', 'capybara'],
        'd': ['20dm3', 'gravity-goats'],
    },
    'q5': {
        'a': ['stealth', 'code-green', 'hydroterra'],
        'b': ['codrii-minds', 'lab-rats', 'forta'],
        'c': ['supernovas', 'noroc-science', '20dm3'],
        'd': ['dive-deep', 'gravity-goats', 'sacal'],
    },
}


@login_required
def dashboard(request):
    try:
        amb = Ambassador.objects.select_related('team').prefetch_related('point_entries').get(user=request.user)
        recent_entries = amb.point_entries.all()[:10]
        has_profile = True
    except Ambassador.DoesNotExist:
        amb = None
        recent_entries = []
        has_profile = False

    return render(request, 'ambassadors/dashboard.html', {
        'amb': amb,
        'recent_entries': recent_entries,
        'has_profile': has_profile,
    })


def teams(request):
    # Annotate DB teams with member counts if available
    db_teams = {t.slug: t for t in Team.objects.annotate(member_count=Count('ambassadors'))}

    gsa = []
    for t in GSA_TEAMS:
        entry = dict(t)
        db = db_teams.get(t['slug'])
        entry['member_count'] = db.member_count if db else 0
        gsa.append(entry)

    explorer = []
    for t in EXPLORER_TEAMS:
        entry = dict(t)
        db = db_teams.get(t['slug'])
        entry['member_count'] = db.member_count if db else 0
        explorer.append(entry)

    return render(request, 'ambassadors/teams.html', {
        'gsa_teams': gsa,
        'explorer_teams': explorer,
    })


def leaderboard(request):
    view = request.GET.get('view', 'individual')

    if view == 'team':
        # Aggregate points per team
        team_rows = (
            Team.objects.annotate(
                total_points=Sum('ambassadors__points'),
                member_count=Count('ambassadors'),
                avg_points=Avg('ambassadors__points'),
            )
            .filter(member_count__gt=0)
            .order_by('-total_points')
        )
        return render(request, 'ambassadors/leaderboard.html', {
            'view': 'team',
            'team_rows': team_rows,
        })
    else:
        individuals = (
            Ambassador.objects.select_related('user', 'team')
            .order_by('-points')
        )
        return render(request, 'ambassadors/leaderboard.html', {
            'view': 'individual',
            'individuals': individuals,
        })


QUIZ_QUESTIONS = [
    {
        'id': 'q1',
        'text': 'What excites you most about science?',
        'options': [
            ('a', 'Building and engineering things'),
            ('b', 'Understanding living ecosystems'),
            ('c', 'Data, maps, and the environment'),
            ('d', 'Chemistry and materials'),
        ],
    },
    {
        'id': 'q2',
        'text': 'Where are you based?',
        'options': [
            ('a', 'North Carolina, USA'),
            ('b', 'Moldova'),
            ('c', 'Another country'),
        ],
    },
    {
        'id': 'q3',
        'text': 'Pick your vibe',
        'options': [
            ('a', 'Field research outdoors'),
            ('b', 'Lab experiments'),
            ('c', 'Engineering & tech builds'),
            ('d', 'Data analysis & dashboards'),
        ],
    },
    {
        'id': 'q4',
        'text': 'What matters most to you?',
        'options': [
            ('a', 'Climate & environment'),
            ('b', 'Space & atmosphere'),
            ('c', 'Ocean & wildlife'),
            ('d', 'Chemistry & innovation'),
        ],
    },
    {
        'id': 'q5',
        'text': 'How do you work best?',
        'options': [
            ('a', 'Solo deep focus'),
            ('b', 'Tight-knit team'),
            ('c', 'Big collaborative group'),
            ('d', 'Whatever gets results'),
        ],
    },
]


def quiz(request):
    if request.method == 'POST':
        scores = {}
        for q_id, slug_list in QUIZ_SCORES.items():
            answer = request.POST.get(q_id)
            if answer and answer in slug_list:
                for slug in slug_list[answer]:
                    scores[slug] = scores.get(slug, 0) + 1

        if scores:
            best_slug = max(scores, key=lambda s: scores[s])
        else:
            best_slug = 'code-green'

        return redirect(f'/ambassadors/quiz/result/?team={best_slug}')

    return render(request, 'ambassadors/quiz.html', {
        'questions': QUIZ_QUESTIONS,
    })


def quiz_result(request):
    slug = request.GET.get('team', 'code-green')
    team = ALL_TEAMS_BY_SLUG.get(slug, ALL_TEAMS_BY_SLUG['code-green'])
    return render(request, 'ambassadors/quiz_result.html', {
        'team': team,
    })
