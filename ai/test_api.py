"""FastAPI 추천 서비스의 계약을 검증한다."""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from ai.api import app
from ai.test_recommend import TEST_USERS


class RecommendationApiTest(unittest.TestCase):
    """상태 확인, 추천 응답, 입력 검증을 검사한다."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.client_context = TestClient(app)
        cls.client = cls.client_context.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client_context.__exit__(None, None, None)

    def test_health(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "policy_count": 20, "region_count": 5},
        )

    def test_recommendation_contract(self) -> None:
        response = self.client.post("/recommend", json=TEST_USERS[1][1])
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(len(body["policies"]), 5)
        self.assertEqual(len(body["regions"]), 3)
        self.assertEqual(
            body["policies"][0]["policy_name"],
            "충주시 청년 신혼부부 주거자금 대출이자 지원",
        )
        self.assertEqual(body["regions"][0]["region"], "충주시")
        self.assertIn("공식 공고문", body["caution"])

    def test_invalid_input_returns_422(self) -> None:
        response = self.client.post(
            "/recommend",
            json={"age": -1, "housing_type": "호텔", "monthly_income": -100},
        )
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
