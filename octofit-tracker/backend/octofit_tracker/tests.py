from rest_framework.test import APIRequestFactory, APITestCase

from .views import api_root


class ApiRoutingTests(APITestCase):
    def test_api_root_contains_expected_collections(self):
        request = APIRequestFactory().get("/")
        response = api_root(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("users", response.data)
        self.assertIn("teams", response.data)
        self.assertIn("activities", response.data)
        self.assertIn("leaderboard", response.data)
        self.assertIn("workouts", response.data)