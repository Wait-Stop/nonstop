"""충북 정착 지역을 규칙 기반으로 추천하는 모듈."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_regions(path: str | Path | None = None) -> list[dict[str, Any]]:
    """JSON 파일에서 지역 목록을 불러온다."""
    data_path = Path(path) if path else Path(__file__).with_name("region_data.json")
    try:
        with data_path.open(encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"지역 데이터를 불러올 수 없습니다: {data_path}") from exc
    if not isinstance(data, list):
        raise ValueError("지역 데이터는 JSON 배열이어야 합니다.")
    return data


def _level(score: int) -> str:
    return "높음" if score >= 80 else "중간" if score >= 50 else "낮음"


def recommend_regions(
    user_profile: dict[str, Any], regions: list[dict[str, Any]],
    recommended_policies: list[dict[str, Any]], top_k: int = 3,
) -> list[dict[str, Any]]:
    """사용자 선호와 정책 추천 결과를 조합해 상위 지역을 반환한다."""
    if top_k <= 0:
        return []
    results = []
    interests = user_profile.get("interests", [])
    job_focused = user_profile.get("employment_status") in {"취업준비중", "미취업", "구직중"} or "취업" in interests
    housing_focused = user_profile.get("housing_type") in {"월세", "전세"} or "주거" in interests
    for region in regions:
        name = region.get("region", "")
        reasons = []
        job = region.get("job_score", 0) / 100 * 25 if job_focused else 12.5
        housing = region.get("housing_cost_score", 0) / 100 * 20 if housing_focused else 10

        applicable = [p for p in recommended_policies if p.get("region") in {"충청북도", name}]
        local = [p for p in applicable if p.get("region") == name]
        policy_score = min(25, sum(p.get("match_score", 0) for p in applicable) / max(1, len(recommended_policies)) * 0.25 + len(local) * 3)

        if user_profile.get("transportation") == "대중교통":
            infra = region.get("transport_score", 0) / 100 * 15
        else:
            infra = region.get("life_infra_score", 0) / 100 * 15

        preference = 0.0
        if user_profile.get("rural_interest"):
            preference += region.get("rural_score", 0) / 100 * 7.5
        else:
            preference += region.get("life_infra_score", 0) / 100 * 7.5
        if user_profile.get("startup_interest"):
            preference += region.get("startup_score", 0) / 100 * 7.5
        else:
            preference += 3.75
        if user_profile.get("preferred_region") == name:
            preference += 12
            reasons.append("희망 지역과 일치함")
        if user_profile.get("newlywed") and name == "충주시":
            preference += 4
            reasons.append("신혼부부 관련 지역 정책과 연결 가능함")

        if job_focused and region.get("job_score", 0) >= 75:
            reasons.append("일자리 접근성이 사용자 상황과 잘 맞음")
        if housing_focused and region.get("housing_cost_score", 0) >= 70:
            reasons.append("상대적으로 주거비 부담을 줄이려는 선호와 맞음")
        if user_profile.get("transportation") == "대중교통" and region.get("transport_score", 0) >= 70:
            reasons.append("대중교통 선호와 비교적 잘 맞음")
        if user_profile.get("rural_interest") and region.get("rural_score", 0) >= 70:
            reasons.append("농촌 정착 및 자연환경 선호와 잘 맞음")
        if user_profile.get("startup_interest") and region.get("startup_score", 0) >= 70:
            reasons.append("창업 및 지역 정착 관심과 관련성이 높음")
        if applicable:
            reasons.append("추천된 청년 정책과 함께 검토할 수 있음")

        score = min(100, round(job + housing + policy_score + infra + preference))
        results.append({
            "region": name, "match_score": score, "match_level": _level(score),
            "region_type": region.get("region_type", ""), "reasons": reasons[:4],
            "recommended_policy_names": [p.get("policy_name", "") for p in applicable[:5]],
            "caution": "지역 추천 점수는 정책·생활 조건 기반의 참고용 결과임",
        })
    results.sort(key=lambda item: (-item["match_score"], item["region"]))
    return results[:top_k]
