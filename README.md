# ASA SERVER WIKI V2.1

GitHub Pages `/Asa/` deployment hotfix.

## 핵심 수정
- CSS와 JavaScript를 `index.html` 내부에 포함하여 이전 `assets/` 파일 캐시/덮어쓰기 문제를 제거했습니다.
- 메인 페이지는 외부 로컬 CSS/JS 경로에 의존하지 않습니다.

## 적용
저장소 최상위에 `index.html`, `.nojekyll`, `README.md`를 업로드하고 기존 파일을 덮어쓰세요.
