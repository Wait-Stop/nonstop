# AI 추천 API 연결 계약 초안

현재 추천 결과는 `frontend/src/data/mockData.ts`에서 반환됩니다.

## 추천 요청

`POST /api/recommendations`

```json
{
  "condition": {
    "age": "30대",
    "major": "공학계열",
    "job": "IT·개발",
    "salary": "3,600~4,500만원",
    "rent": "60~80만원",
    "transport": "자가용",
    "preferredRegions": ["청주시", "진천군"],
    "recommendRegion": false
  },
  "persist": false
}
```

`recommendRegion`이 `true`이면 `preferredRegions`는 빈 배열이어야 합니다. 특정 희망 지역을 선택하면 `recommendRegion`은 `false`이고 복수 지역을 전달할 수 있습니다.

## 추천 응답

```json
[
  {
    "id": "cheongju",
    "name": "청주시 오창읍",
    "area": "청주시",
    "score": 94,
    "type": "산업단지 직장인형",
    "reasons": ["IT·반도체 일자리 접근성"],
    "rent": 58,
    "commute": 28,
    "carNeed": "있으면 편리",
    "infrastructure": ["충북대병원"],
    "policyCount": 12
  }
]
```

추천 점수와 신청 가능 여부는 확정값처럼 표현하지 않고 추정 또는 추가 확인이 필요한 정보로 취급합니다.
