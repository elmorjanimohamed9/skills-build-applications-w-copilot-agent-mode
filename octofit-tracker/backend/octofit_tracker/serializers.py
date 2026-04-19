from rest_framework import serializers

from .models import Activity, LeaderboardEntry, Team, UserProfile, Workout


class ObjectIdStringSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        return str(obj.pk)


class UserProfileSerializer(ObjectIdStringSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "id",
            "full_name",
            "email",
            "hero_universe",
            "fitness_level",
            "created_at",
            "updated_at",
        ]


class TeamSerializer(ObjectIdStringSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "league", "description", "created_at", "updated_at"]


class WorkoutSerializer(ObjectIdStringSerializer):
    class Meta:
        model = Workout
        fields = [
            "id",
            "name",
            "category",
            "intensity",
            "duration_minutes",
            "created_at",
            "updated_at",
        ]


class ActivitySerializer(ObjectIdStringSerializer):
    class Meta:
        model = Activity
        fields = [
            "id",
            "user_email",
            "team_name",
            "workout_name",
            "calories_burned",
            "duration_minutes",
            "activity_date",
            "created_at",
            "updated_at",
        ]


class LeaderboardEntrySerializer(ObjectIdStringSerializer):
    class Meta:
        model = LeaderboardEntry
        fields = [
            "id",
            "user_email",
            "team_name",
            "score",
            "rank",
            "created_at",
            "updated_at",
        ]