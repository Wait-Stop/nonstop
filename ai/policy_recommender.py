"""충북 청년 정책을 규칙 기반으로 추천하는 모듈."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


CAUTION = "실제 신청 가능 여부는 신청 시점의 공식 공고문 확인 필요"


def load_policies(path: str | Path | None = None) -> list[dict[str, Any]]:
    """JSON 파일에서 정책 목록을 불러온다."""
    data_path = Path(path) if path else Path(__file__).with_name("policy_data.json")
    try:
        with data_path.open(encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"정책 데이터를 불러올 수 없습니다: {data_path}") from exc
    if not isinstance(data, list):
        raise ValueError("정책 데이터는 JSON 배열이어야 합니다.")
    return data


def _contains(policy: dict[str, Any], *words: str) -> bool:
    text = " ".join(
        [policy.get("policy_name", ""), policy.get("category", ""), policy.get("sub_category", "")]
        + policy.get("target_conditions", [])
        + policy.get("recommend_keywords", [])
    )
    return any(word in text for word in words)


def _match_level(score: int) -> str:
    if score >= 80:
        return "높음"
    if score >= 50:
        return "중간"
    return "낮음"


def _reason(policy: dict[str, Any], matched: list[str]) -> str:
    category = policy.get("category", "")
    if "농촌" in category:
        base = "농촌 정착 또는 귀농귀촌 관심과 관련되어 추천함."
    elif "창업" in category:
        base = "창업 관심 또는 로컬창업 조건과 관련되어 추천함."
    elif "취업" in category:
        base = "취업 준비 또는 일자리 탐색 상황과 관련성이 높아 추천함."
    elif "주거" in category or "금융" in category:
        base = "주거 조건과 사용자 상황이 유사하여 추천함."
    else:
        base = "사용자 상황 및 관심 분야와 관련되어 추천함."
    return base if not matched else f"{base[:-1]} ({', '.join(matched)})."


def _score_policy(user: dict[str, Any], policy: dict[str, Any]) -> dict[str, Any]:
    """정책의 핵심 조건을 평가하고 불일치 개수에 따라 점수 상한을 적용한다."""
    score = 0
    core_mismatches = 0
    matched: list[str] = []
    unmatched: list[str] = []
    missing: list[str] = []
    age = user.get("age")
    age_min, age_max = policy.get("age_min"), policy.get("age_max")
    if age is None:
        missing.append("정확한 나이 확인 필요")
        core_mismatches += 1
    elif (age_min is None or age >= age_min) and (age_max is None or age <= age_max):
        score += 15
        matched.append("나이 조건")
    else:
        core_mismatches += 1
        unmatched.append("나이 조건 불일치")

    preferred = user.get("preferred_region")
    region = policy.get("region")
    if region == preferred:
        score += 20
        matched.append("희망 지역과 일치")
    elif region == "충청북도":
        score += 12
        matched.append("충북 공통 정책")
    else:
        score += 3
        core_mismatches += 1
        unmatched.append("희망 지역 불일치")

    housing = user.get("housing_type", "")
    category = policy.get("category", "")
    housing_text = " ".join(
        [policy.get("sub_category", "")] + policy.get("recommend_keywords", [])
    )
    requires_rent = "월세" in housing_text
    requires_jeonse = "전세" in housing_text or "보증료" in housing_text
    housing_category = category in {"주거비 지원", "금융·대출"}
    if requires_rent or requires_jeonse:
        expected = "월세" if requires_rent else "전세"
        if housing == expected:
            score += 25
            matched.append("주거 형태")
        else:
            score -= 30
            core_mismatches += 1
            unmatched.append(f"주거 형태 불일치({expected} 정책)")
    elif housing_category:
        score += 15
    else:
        score += 10

    # 경제 조건은 카테고리별 핵심 항목만 평가한다.
    economic_points = 10
    if category == "주거비 지원" and _contains(policy, "무주택"):
        economic_points = 0
        if user.get("is_house_owner") is None:
            missing.append("무주택 여부 확인 필요")
            core_mismatches += 1
        elif user.get("is_house_owner") is False:
            economic_points += 10
            matched.append("무주택 조건")
        else:
            core_mismatches += 1
            unmatched.append("무주택 조건 불일치")
        if _contains(policy, "소득"):
            if user.get("monthly_income") is None:
                missing.append("정확한 월소득 확인 필요")
            else:
                economic_points += 5
                matched.append("소득 정보 입력")
    elif category == "금융·대출":
        economic_points = 0
        loan_relevant = user.get("has_loan") is True or user.get("needs_housing_loan") is True
        if user.get("has_loan") is None and user.get("needs_housing_loan") is None:
            missing.append("대출 보유 또는 이용 예정 여부 확인 필요")
            core_mismatches += 1
        elif loan_relevant:
            economic_points += 15
            matched.append("대출 보유·이용 예정 조건")
        else:
            core_mismatches += 1
            unmatched.append("대출 보유·이용 예정 조건 불일치")
    score += min(economic_points, 15)

    status_points = 10
    employment = user.get("employment_status", "")
    if category == "취업·일자리":
        status_points = 25 if employment in {"취업준비중", "미취업", "구직중"} else 0
        if status_points:
            matched.append("취업 상태")
        else:
            core_mismatches += 1
            unmatched.append("취업 상태 불일치")
    elif category == "창업·소상공인":
        status_points = 25 if user.get("startup_interest") is True else 0
        if status_points:
            matched.append("창업 관심")
        else:
            core_mismatches += 1
            unmatched.append("창업 관심 조건 불일치")
    elif category == "농촌·귀농귀촌":
        status_points = 25 if user.get("rural_interest") is True else 0
        if status_points:
            matched.append("농촌 정착 관심")
        else:
            core_mismatches += 1
            unmatched.append("농촌 정착 관심 조건 불일치")
    if _contains(policy, "신혼부부"):
        if user.get("newlywed") is None:
            missing.append("신혼부부 여부 확인 필요")
            status_points = 0
            core_mismatches += 1
        elif user.get("newlywed") is True:
            status_points = 20
            matched.append("신혼부부 조건")
        else:
            status_points = -20
            core_mismatches += 1
            unmatched.append("신혼부부 조건 불일치")
    # 데이터의 대상 조건을 이용해 취업자·농업인 전용 성격을 판별한다.
    target_conditions = set(policy.get("target_conditions", []))
    if {"취업", "농업"}.issubset(target_conditions):
        if employment != "재직중" and user.get("rural_interest") is not True:
            status_points = 0
            core_mismatches += 1
            unmatched.append("취업자·청년농업인 조건 불일치")
    score += status_points

    interest_map = {
        "주거비 지원": "주거", "금융·대출": "금융", "취업·일자리": "취업",
        "창업·소상공인": "창업", "농촌·귀농귀촌": "농촌",
    }
    if interest_map.get(policy.get("category")) in user.get("interests", []):
        score += 10
        matched.append("관심 분야")
    if user.get("startup_interest") and user.get("rural_interest") and category == "주거비 지원":
        score -= 10

    result = {key: policy.get(key) for key in (
        "policy_id", "policy_name", "category", "sub_category", "region"
    )}
    # 핵심 조건이 빠진 정책은 관심 점수만으로 상위권에 오를 수 없다.
    ceiling = 98 if core_mismatches == 0 else 88 if core_mismatches == 1 else 75
    score = max(0, min(round(score), ceiling))
    limit_reason = "" if core_mismatches == 0 else (
        f"핵심 조건 {core_mismatches}개 불일치로 최대 {ceiling}점 적용"
    )
    result.update({
        "match_score": score,
        "match_level": _match_level(score),
        "reason": _reason(policy, matched),
        "matched_factors": matched,
        "unmatched_factors": list(dict.fromkeys(unmatched)),
        "missing_info": list(dict.fromkeys(missing)),
        "score_limit_reason": limit_reason,
        "support_summary": policy.get("support_summary", ""),
        "caution": policy.get("caution") or CAUTION,
        "source_name": policy.get("source_name", ""),
        "source_url": policy.get("source_url", ""),
        "_sort_priority": (
            (3 if policy.get("region") == preferred else 0)
            + (1 if housing and housing in housing_text else 0)
            + (1 if interest_map.get(policy.get("category")) in user.get("interests", []) else 0)
        ),
    })
    return result


def recommend_policies(
    user_profile: dict[str, Any], policies: list[dict[str, Any]], top_k: int = 5
) -> list[dict[str, Any]]:
    """사용자 프로필과 정책 조건을 비교해 상위 정책을 반환한다."""
    if not isinstance(user_profile, dict) or not isinstance(policies, list):
        raise TypeError("user_profile은 dict, policies는 list여야 합니다.")
    if top_k <= 0:
        return []
    results = [_score_policy(user_profile, policy) for policy in policies]
    results.sort(key=lambda item: (-item["match_score"], -item["_sort_priority"], item["policy_id"] or ""))
    eligible = [item for item in results if item["match_score"] >= 40]
    selected = eligible[:top_k] if eligible else results[:1]
    for item in results:
        item.pop("_sort_priority", None)
    return selected
