"""세 가지 대표 사용자 프로필로 추천 결과를 확인한다."""

from __future__ import annotations

try:
    from .policy_recommender import load_policies, recommend_policies
    from .region_recommender import load_regions, recommend_regions
except ImportError:  # `python ai/test_recommend.py`로 직접 실행하는 경우
    from policy_recommender import load_policies, recommend_policies
    from region_recommender import load_regions, recommend_regions


TEST_USERS = [
    ("청주 취업준비 월세형", {"age":26,"preferred_region":"청주시","housing_type":"월세","monthly_income":2500000,"is_house_owner":False,"employment_status":"취업준비중","startup_interest":False,"rural_interest":False,"newlywed":False,"has_loan":False,"transportation":"대중교통","interests":["주거","취업"]}),
    ("충주 신혼부부 전세형", {"age":31,"preferred_region":"충주시","housing_type":"전세","monthly_income":3500000,"is_house_owner":False,"employment_status":"재직중","startup_interest":False,"rural_interest":False,"newlywed":True,"has_loan":True,"transportation":"자가용","interests":["주거","금융"]}),
    ("괴산 농촌창업형", {"age":29,"preferred_region":"괴산군","housing_type":"월세","monthly_income":2000000,"is_house_owner":False,"employment_status":"창업준비중","startup_interest":True,"rural_interest":True,"newlywed":False,"has_loan":False,"transportation":"자가용","interests":["창업","농촌","주거"]}),
]


def main() -> None:
    """테스트 프로필별 정책 TOP 5와 지역 TOP 3을 출력한다."""
    policies, regions = load_policies(), load_regions()
    for name, profile in TEST_USERS:
        policy_results = recommend_policies(profile, policies, top_k=5)
        region_results = recommend_regions(profile, regions, policy_results, top_k=3)
        print(f"\n{'=' * 60}\n사용자: {name}\n\n[추천 정책 TOP 5]")
        for index, item in enumerate(policy_results, 1):
            print(f"{index}. {item['policy_name']} - {item['match_score']}점 ({item['match_level']})")
            print(f"   이유: {item['reason']}")
        print("\n[추천 지역 TOP 3]")
        for index, item in enumerate(region_results, 1):
            print(f"{index}. {item['region']} - {item['match_score']}점 ({item['match_level']})")
            print(f"   이유: {'; '.join(item['reasons'])}")


if __name__ == "__main__":
    main()
