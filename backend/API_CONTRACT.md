# Backend API 연결 계약 초안

프론트엔드는 현재 `frontend/src/services/api.ts`의 Mock 구현만 사용합니다. 실제 서버가 준비되면 해당 파일의 함수 내부만 교체합니다.

## 인증

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/users/me`
- `PATCH /api/users/me`

비밀번호 및 인증 토큰은 `localStorage`에 저장하지 않습니다. 실제 인증 방식은 백엔드 확정 후 HttpOnly Cookie 방식으로 연결하는 것을 권장합니다.

## 지역과 정책

- `GET /api/regions`
- `GET /api/regions/{regionId}`
- `GET /api/policies`
- `GET /api/policies/{policyId}`
- `GET /api/users/me/saved-regions`
- `POST /api/users/me/saved-regions`

## 간편 추천 저장 정책

홈의 간편 추천은 로그인 여부와 관계없이 다음 요청 옵션을 사용합니다.

```json
{
  "persist": false
}
```

서버가 요청을 처리하더라도 사용자 추천 이력 또는 회원 DB에 결과를 저장하지 않아야 합니다.
