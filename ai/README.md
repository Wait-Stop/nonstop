# 충북 정착 시뮬레이터 AI 추천 로직

이 폴더는 충북 청년 정착 시뮬레이터의 AI 추천 로직을 담고 있습니다. 현재 MVP 단계에서는 머신러닝이나 LLM API 대신 설명 가능한 규칙 기반 점수를 사용합니다.

## 구성

- `policy_data.json`: 조사된 MVP 정책 20개
- `region_data.json`: 청주·충주·진천·옥천·괴산 지역 특성
- `policy_recommender.py`: 정책 추천 및 데이터 로더
- `region_recommender.py`: 지역 추천 및 데이터 로더
- `test_recommend.py`: 대표 사용자 3명의 실행 예제
- `test_policy_recommender.py`: 정책 점수·순위 회귀 테스트
- `test_region_recommender.py`: 지역 순위·응답 구조 회귀 테스트

## 점수 기준

정책 추천은 나이 20점, 지역 20점, 주거 20점, 경제 조건 15점, 사용자 상태 15점, 관심 분야 10점을 기준으로 계산합니다. 정책과 무관한 조건은 기본 점수를 주어 과도하게 감점하지 않습니다. 80점 이상은 `높음`, 50점 이상은 `중간`, 그 미만은 `낮음`입니다.

지역 추천은 일자리 25점, 주거비 20점, 추천 정책 활용 가능성 25점, 생활 인프라·교통 15점, 사용자 선호 15점을 기본으로 계산합니다. 희망 지역 일치와 신혼부부 관련성은 소폭 가산합니다.

## 사용 방법

프로젝트 루트에서 다음 명령을 실행합니다.

```bash
python ai/test_recommend.py
```

자동 테스트는 다음 명령으로 실행합니다.

```bash
python -m unittest discover -s ai -p 'test_*recommender.py' -v
```

전세대출 정책은 기존 대출 보유 여부인 `has_loan`과 향후 대출 이용 의도인
`needs_housing_loan`을 함께 평가합니다. 기존 클라이언트는 `has_loan`만 전달해도
동작하며, 신규 화면에서는 두 값을 구분해 전달하는 것을 권장합니다.

백엔드에서는 다음처럼 호출할 수 있습니다.

```python
from ai.policy_recommender import load_policies, recommend_policies
from ai.region_recommender import load_regions, recommend_regions

policies = recommend_policies(user_profile, load_policies(), top_k=5)
regions = recommend_regions(user_profile, load_regions(), policies, top_k=3)
```

정책 결과에는 일치 조건인 `matched_factors`뿐 아니라 `unmatched_factors`,
`missing_info`, `score_limit_reason`도 포함되므로 추천 근거를 화면에 표시할 수
있습니다.

추천 점수는 조건상 관련성을 나타내는 참고값이며 신청 자격을 확정하지 않습니다. 실제 정책 신청 가능 여부와 최신 조건은 반드시 신청 시점의 공식 공고문에서 확인해야 합니다.
