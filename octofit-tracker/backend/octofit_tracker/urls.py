import os

from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    LeaderboardEntryViewSet,
    TeamViewSet,
    UserProfileViewSet,
    WorkoutViewSet,
    api_root,
)

codespace_name = os.environ.get('CODESPACE_NAME')
if codespace_name:
    base_url = f"https://{codespace_name}-8000.app.github.dev"
else:
    base_url = "http://localhost:8000"

router = DefaultRouter()
router.register('users', UserProfileViewSet)
router.register('teams', TeamViewSet)
router.register('activities', ActivityViewSet)
router.register('leaderboard', LeaderboardEntryViewSet)
router.register('workouts', WorkoutViewSet)

urlpatterns = [
    path('', api_root, name='root'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/', include(router.urls)),
]
