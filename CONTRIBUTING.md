# 기여 가이드

N-Styler에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 시작하기

### 1. 이슈 확인
- [Issues](../../issues) 탭에서 열린 이슈를 확인하세요
- 새로운 기능이나 버그를 발견했다면 이슈를 생성해주세요

### 2. 포크 및 클론
```bash
# 저장소를 포크하고 클론
git clone https://github.com/your-username/N-Styler.git
cd N-Styler
```

### 3. 브랜치 생성
```bash
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/your-bug-fix
```

## 개발 환경 설정

### 필요사항
- Chrome 브라우저 (최신 버전)
- 텍스트 에디터 (VS Code 권장)

### 로컬 테스트
1. `chrome://extensions` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `src` 폴더 선택

## 코드 스타일

### 기본 규칙
- **언어**: 코드는 영어, 주석은 영어로 작성
- **포매팅**: 2칸 들여쓰기
- **명명**: camelCase for functions/variables, PascalCase for classes
- **주석**: 복잡한 로직에는 설명 주석 추가

### 예시
```javascript
// ✅ Good
function getUserData(userId) {
  // Fetch user data from storage
  const data = chrome.storage.local.get(userId);
  return data;
}

// ❌ Bad
function gUD(id){
let d=chrome.storage.local.get(id);return d;}
```

## 커밋 메시지 규칙

```
type(scope): subject

feat(popup): add dark theme toggle
fix(content): resolve CSS injection timing issue
docs(readme): update installation guide
style(manifest): format json file
refactor(storage): simplify data structure
test(background): add unit tests
chore(deps): update dependencies
```

## Pull Request 프로세스

1. **브랜치 업데이트**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **테스트**
   - 모든 기능이 정상 작동하는지 확인
   - 다양한 웹사이트에서 테스트

3. **변경사항 요약**
   - PR 제목: 명확하고 간결하게
   - PR 설명: 변경사항, 이유, 관련 이슈 번호 포함
   ```markdown
   ## 변경사항
   - Added dark theme support

   ## 관련 이슈
   Closes #123

   ## 테스트 방법
   1. 확장 프로그램 로드
   2. 팝업 열기
   3. 다크 테마 토글 확인
   ```

4. **리뷰 대기**
   - 유지보수자가 리뷰하고 피드백 제공
   - 요청사항이 있으면 커밋 추가

5. **병합**
   - 모든 체크가 통과하면 병합됨

## 버그 리포트 작성

버그를 발견했을 때는 다음 정보를 포함해주세요:

- **브라우저/OS**: Chrome 버전, Windows/Mac/Linux
- **재현 방법**: 단계별 설명
- **예상 동작**: 어떻게 되어야 하는가
- **실제 동작**: 실제로 어떻게 되었는가
- **스크린샷/로그**: 가능하면 첨부

## 기능 제안

새로운 기능을 제안할 때는:

- **목표**: 이 기능의 목적
- **사용 사례**: 어떤 상황에서 유용한가
- **예상 구현**: 어떻게 구현할 수 있을까
- **대안**: 다른 해결 방법이 있는가

## 질문이 있으신가요?

- Issues에서 `question` 레이블로 질문해주세요
- 혹은 토론 탭을 이용해주세요

감사합니다! 🎉
