from datetime import date

from django.core.management.base import BaseCommand

from octofit_tracker.models import (
    Activity,
    LeaderboardEntry,
    Team,
    UserProfile,
    Workout,
)


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **options):
        # Use Django ORM for cleanup to satisfy project constraints.
        Activity.objects.all().delete()
        LeaderboardEntry.objects.all().delete()
        Workout.objects.all().delete()
        Team.objects.all().delete()
        UserProfile.objects.all().delete()

        teams = Team.objects.bulk_create(
            [
                Team(name='team marvel', league='Marvel', description='Earth mightiest heroes'),
                Team(name='team dc', league='DC', description='Justice heroes united'),
            ]
        )

        users = UserProfile.objects.bulk_create(
            [
                UserProfile(
                    full_name='Peter Parker',
                    email='spiderman@marvel.com',
                    hero_universe='Marvel',
                    fitness_level='Advanced',
                ),
                UserProfile(
                    full_name='Natasha Romanoff',
                    email='blackwidow@marvel.com',
                    hero_universe='Marvel',
                    fitness_level='Elite',
                ),
                UserProfile(
                    full_name='Bruce Wayne',
                    email='batman@dc.com',
                    hero_universe='DC',
                    fitness_level='Elite',
                ),
                UserProfile(
                    full_name='Diana Prince',
                    email='wonderwoman@dc.com',
                    hero_universe='DC',
                    fitness_level='Elite',
                ),
            ]
        )

        workouts = Workout.objects.bulk_create(
            [
                Workout(name='Web Sprint', category='Cardio', intensity='High', duration_minutes=30),
                Workout(name='Amazon Strength', category='Strength', intensity='High', duration_minutes=45),
                Workout(name='Bat HIIT', category='HIIT', intensity='Medium', duration_minutes=35),
                Workout(name='Shield Endurance', category='Endurance', intensity='Medium', duration_minutes=40),
            ]
        )

        Activity.objects.bulk_create(
            [
                Activity(
                    user_email='spiderman@marvel.com',
                    team_name='team marvel',
                    workout_name='Web Sprint',
                    calories_burned=420,
                    duration_minutes=30,
                    activity_date=date(2026, 4, 18),
                ),
                Activity(
                    user_email='blackwidow@marvel.com',
                    team_name='team marvel',
                    workout_name='Shield Endurance',
                    calories_burned=510,
                    duration_minutes=40,
                    activity_date=date(2026, 4, 18),
                ),
                Activity(
                    user_email='batman@dc.com',
                    team_name='team dc',
                    workout_name='Bat HIIT',
                    calories_burned=480,
                    duration_minutes=35,
                    activity_date=date(2026, 4, 18),
                ),
                Activity(
                    user_email='wonderwoman@dc.com',
                    team_name='team dc',
                    workout_name='Amazon Strength',
                    calories_burned=560,
                    duration_minutes=45,
                    activity_date=date(2026, 4, 18),
                ),
            ]
        )

        LeaderboardEntry.objects.bulk_create(
            [
                LeaderboardEntry(user_email='wonderwoman@dc.com', team_name='team dc', score=560, rank=1),
                LeaderboardEntry(user_email='blackwidow@marvel.com', team_name='team marvel', score=510, rank=2),
                LeaderboardEntry(user_email='batman@dc.com', team_name='team dc', score=480, rank=3),
                LeaderboardEntry(user_email='spiderman@marvel.com', team_name='team marvel', score=420, rank=4),
            ]
        )

        self.stdout.write(
            self.style.SUCCESS(
                'Populated octofit_db with test data: '
                f'{len(teams)} teams, {len(users)} users, {len(workouts)} workouts'
            )
        )
