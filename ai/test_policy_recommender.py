"""정책 추천 점수와 대표 순위를 검증하는 회귀 테스트."""

from __future__ import annotations

import unittest

from ai.policy_recommender import _score_policy, load_policies, recommend_policies
from ai.test_recommend import TEST_USERS


class PolicyRecommenderTest(unittest.TestCase):
    """대표 사용자 추천이 요구사항에서 벗어나지 않는지 검사한다."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.policies = load_policies()

    def recommend(self, index: int, top_k: int = 20) -> list[dict]:
        """지정한 테스트 사용자의 추천 결과를 반환한다."""
        return recommend_policies(TEST_USERS[index][1], self.policies, top_k=top_k)

    def test_cheongju_profile_ranking(self) -> None:
        top_names = [item["policy_name"] for item in self.recommend(0, 5)]
        expected = {
            "청년월세 지원", "청주형 내일공감 일자리사업",
            "청년도전 지원사업", "충청북도 일자리지원센터 운영",
        }
        self.assertTrue(expected.issubset(top_names))

    def test_jeonse_profile_penalizes_rent_policies(self) -> None:
        results = {
            policy["policy_name"]: _score_policy(TEST_USERS[1][1], policy)
            for policy in self.policies
        }
        self.assertLess(results["청년월세 지원"]["match_score"], 60)
        self.assertLess(results["충주시 청년 신혼부부 월세 지원"]["match_score"], 60)
        self.assertIn("주거 형태 불일치(월세 정책)", results["청년월세 지원"]["unmatched_factors"])

    def test_goesan_profile_prioritizes_startup_and_rural(self) -> None:
        results = {item["policy_name"]: item for item in self.recommend(2)}
        general_housing = results["청년월세 지원"]["match_score"]
        preferred = [
            "괴산형 청년창업 지원사업", "청년 농촌보금자리 조성사업",
            "청년 소상공인 창업응원금 지원", "청년 창업지원자금 융자지원",
        ]
        self.assertTrue(all(results[name]["match_score"] > general_housing for name in preferred))

    def test_result_contract_and_score_range(self) -> None:
        required = {
            "policy_id", "match_score", "match_level", "reason", "matched_factors",
            "unmatched_factors", "missing_info", "score_limit_reason", "caution",
        }
        for index in range(len(TEST_USERS)):
            for item in self.recommend(index):
                self.assertTrue(required.issubset(item))
                self.assertGreaterEqual(item["match_score"], 0)
                self.assertLessEqual(item["match_score"], 100)
                self.assertIn("공고", item["caution"])

    def test_loan_intent_is_supported(self) -> None:
        profile = dict(TEST_USERS[1][1], has_loan=False, needs_housing_loan=True)
        results = {item["policy_name"]: item for item in recommend_policies(profile, self.policies, 20)}
        self.assertGreaterEqual(results["청년 전세자금 대출이자 지원"]["match_score"], 80)

    def test_empty_candidate_fallback(self) -> None:
        result = recommend_policies({}, self.policies, top_k=5)
        self.assertGreaterEqual(len(result), 1)


if __name__ == "__main__":
    unittest.main()
