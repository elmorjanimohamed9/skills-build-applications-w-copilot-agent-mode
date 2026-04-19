from django.contrib import admin

from .models import Activity, LeaderboardEntry, Team, UserProfile, Workout


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "hero_universe", "fitness_level")
    search_fields = ("full_name", "email")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "league", "updated_at")
    search_fields = ("name", "league")


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "intensity", "duration_minutes")
    search_fields = ("name", "category", "intensity")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("user_email", "team_name", "workout_name", "calories_burned", "activity_date")
    search_fields = ("user_email", "team_name", "workout_name")


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ("user_email", "team_name", "score", "rank")
    search_fields = ("user_email", "team_name")
    ordering = ("rank", "-score")