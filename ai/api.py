"""NestJS가 HTTP로 호출할 수 있는 FastAPI 추천 서비스."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .policy_recommender import load_policies, recommend_policies
from .region_recommender import load_regions, recommend_regions


SERVICE_CAUTION = (
    "추천 결과는 참고용이며 실제 신청 가능 여부는 신청 시점의 "
    "공식 공고문 확인이 필요합니다."
)

POLICIES: list[dict[str, Any]] = []
REGIONS: list[dict[str, Any]] = []


class RecommendationRequest(BaseModel):
    """추천 계산에 사용하는 사용자 입력값."""

    age: int | None = Field(default=None, ge=0, le=120)
    preferred_region: str | None = None
    housing_type: Literal["월세", "전세", "자가", "기타"] | None = None
    monthly_income: int | None = Field(default=None, ge=0)
    is_house_owner: bool | None = None
    employment_status: Literal[
        "취업준비중", "미취업", "구직중", "재직중", "창업준비중", "기타"
    ] | None = None
    startup_interest: bool | None = None
    rural_interest: bool | None = None
    newlywed: bool | None = None
    has_loan: bool | None = None
    needs_housing_loan: bool | None = None
    transportation: Literal["대중교통", "자가용", "기타"] | None = None
    interests: list[Literal["주거", "금융", "취업", "창업", "농촌"]] = Field(
        default_factory=list
    )


class PolicyRecommendation(BaseModel):
    """정책 추천 한 건의 응답 구조."""

    policy_id: str
    policy_name: str
    category: str
    sub_category: str
    region: str
    match_score: int = Field(ge=0, le=100)
    match_level: Literal["높음", "중간", "낮음"]
    reason: str
    matched_factors: list[str]
    unmatched_factors: list[str]
    missing_info: list[str]
    score_limit_reason: str
    support_summary: str
    caution: str
    source_name: str
    source_url: str


class RegionRecommendation(BaseModel):
    """지역 추천 한 건의 응답 구조."""

    region: str
    match_score: int = Field(ge=0, le=100)
    match_level: Literal["높음", "중간", "낮음"]
    region_type: str
    reasons: list[str]
    recommended_policy_names: list[str]
    caution: str


class RecommendationResponse(BaseModel):
    """정책과 지역 추천을 묶은 내부 API 응답."""

    policies: list[PolicyRecommendation]
    regions: list[RegionRecommendation]
    caution: str


@asynccontextmanager
async def lifespan(_: FastAPI):
    """서비스 시작 시 JSON 데이터를 한 번만 읽어 메모리에 보관한다."""
    POLICIES.clear()
    POLICIES.extend(load_policies())
    REGIONS.clear()
    REGIONS.extend(load_regions())
    yield


app = FastAPI(
    title="충북 정착 시뮬레이터 추천 API",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str | int]:
    """서비스와 추천 데이터의 로딩 상태를 반환한다."""
    return {
        "status": "ok",
        "policy_count": len(POLICIES),
        "region_count": len(REGIONS),
    }


@app.post("/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest) -> RecommendationResponse:
    """사용자 입력으로 정책 TOP 5와 지역 TOP 3을 계산한다."""
    user_profile = request.model_dump()
    policies = recommend_policies(user_profile, POLICIES, top_k=5)
    regions = recommend_regions(user_profile, REGIONS, policies, top_k=3)
    return RecommendationResponse(
        policies=policies,
        regions=regions,
        caution=SERVICE_CAUTION,
    )
