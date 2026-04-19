from bson import ObjectId
from djongo import models


class BaseDocument(models.Model):
    id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(BaseDocument):
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    hero_universe = models.CharField(max_length=20)
    fitness_level = models.CharField(max_length=50)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.full_name} <{self.email}>"


class Team(BaseDocument):
    name = models.CharField(max_length=80, unique=True)
    league = models.CharField(max_length=20)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.name


class Workout(BaseDocument):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    intensity = models.CharField(max_length=30)
    duration_minutes = models.PositiveIntegerField()

    class Meta:
        db_table = "workouts"

    def __str__(self):
        return self.name


class Activity(BaseDocument):
    user_email = models.EmailField()
    team_name = models.CharField(max_length=80)
    workout_name = models.CharField(max_length=100)
    calories_burned = models.PositiveIntegerField()
    duration_minutes = models.PositiveIntegerField()
    activity_date = models.DateField()

    class Meta:
        db_table = "activities"

    def __str__(self):
        return f"{self.user_email} - {self.workout_name}"


class LeaderboardEntry(BaseDocument):
    user_email = models.EmailField()
    team_name = models.CharField(max_length=80)
    score = models.IntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "leaderboard"
        ordering = ["rank", "-score"]

    def __str__(self):
        return f"{self.user_email}: {self.score}"