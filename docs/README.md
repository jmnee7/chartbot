# NCT WISH 스트리밍 사이트 운영 안내

사이트 화면은 `docs/index.html`에서 시작하는 정적 파일로 구성됩니다. 별도 빌드 명령은 없습니다.

## 자주 바꾸는 내용

- 가이드 사진과 참여 링크: `js/site-content.js`
- 화면 메뉴와 문구: `index.html`
- 색상과 공통 반응형 레이아웃: `styles/redesign.css`
- 기존 화면별 스타일: `styles/main.css`
- 화면 이동과 홈 동작: `js/dashboard.js`
- 홈 배너와 캠페인 원본 사진: `styles/assets/home/figma-hero-*.png`, `styles/assets/home/ispy-promo.webp`
- 가이드 탭 동작: `js/guide.js`
- 서포트 화면 동작: `js/support.js`
- 원클릭 스트리밍 링크와 권장곡 표시: `js/streaming.js`

사진을 바꿀 때는 새 파일을 `styles/assets/guide/` 아래 알맞은 폴더에 저장하고, `js/site-content.js`의 해당 경로를 바꿉니다. 같은 파일명으로 덮어쓰면 브라우저 캐시 때문에 이전 사진이 보일 수 있으므로 새 파일명을 쓰는 편이 안전합니다. `downloadGuides.audio`는 음원, `downloadGuides.mv`는 뮤직비디오, `streamingGuides`는 스트리밍 가이드입니다.

스포티파이와 애플뮤직 메뉴는 남겨 두었습니다. 현재 저장소에는 두 서비스의 기존 가이드 이미지가 없어, `streamingGuides.spotify`와 `streamingGuides.apple`은 빈 배열입니다. 파일을 받으면 해당 배열에 경로를 추가하면 됩니다.

홈 배너 사진은 `index.html`의 `hero-slide` 이미지 경로를 바꿉니다. 캠페인 사진은 `home-campaign` 이미지 경로를 바꿉니다.

참여 링크는 `js/site-content.js`의 `participationLinks`에서 수정합니다. `idDonation`은 아이디 기부, `fundraising`은 모금, `gifticon`은 기프티콘 기부입니다.

원클릭 스트리밍 링크는 `js/site-content.js`의 `oneClickStreams`에서 수정합니다. 기기별 링크는 스트리밍 화면과 홈의 원클릭 목록에 함께 반영됩니다. `recommendedTracks`는 스트리밍 화면의 권장곡 목록입니다.

## 로컬 확인

프로젝트 루트에서 다음 명령을 실행한 뒤 `http://127.0.0.1:8000/`을 엽니다.

```sh
python3 -m http.server 8000 --directory docs
```

사진을 바꾼 뒤에는 해당 메뉴를 열어 이미지가 보이는지 확인합니다. 링크를 바꾼 뒤에는 버튼이 원하는 주소로 열리는지 확인합니다.
