"""지역 추천 순위와 반환 구조를 검증하는 회귀 테스트."""

from __future__ import annotations

import unittest

from ai.policy_recommender import load_policies, recommend_policies
from ai.region_recommender import load_regions, recommend_regions
from ai.test_recommend import TEST_USERS


class RegionRecommenderTest(unittest.TestCase):
    """대표 사용자별 희망 지역이 합리적으로 추천되는지 검사한다."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.policies = load_policies()
        cls.regions = load_regions()

    def recommend(self, index: int) -> list[dict]:
        """정책 추천을 포함한 지역 추천 결과를 반환한다."""
        profile = TEST_USERS[index][1]
        policies = recommend_policies(profile, self.policies)
        return recommend_regions(profile, self.regions, policies)

    def test_expected_regions_rank_first(self) -> None:
        expected = ["청주시", "충주시", "괴산군"]
        for index, region in enumerate(expected):
            with self.subTest(profile=TEST_USERS[index][0]):
                self.assertEqual(self.recommend(index)[0]["region"], region)

    def test_result_contract(self) -> None:
        required = {
            "region", "match_score", "match_level", "region_type", "reasons",
            "recommended_policy_names", "caution",
        }
        for index in range(len(TEST_USERS)):
            for item in self.recommend(index):
                self.assertTrue(required.issubset(item))
                self.assertGreaterEqual(item["match_score"], 0)
                self.assertLessEqual(item["match_score"], 100)


if __name__ == "__main__":
    unittest.main()
