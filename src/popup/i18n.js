/**
 * N-Styler Internationalization (i18n)
 * Supports: English (en), Japanese (ja), Korean (ko)
 */

const i18n = {
  en: {
    // Header
    appName: 'N-Styler',
    
    // Tabs
    tabCss: 'CSS',
    tabJs: 'JS',
    tabResources: 'Resources',
    tabList: 'List',
    
    // CSS Tab
    externalCssFiles: 'External CSS files (one per line):',
    cssCode: 'CSS Code:',
    cssPlaceholder: '/* Enter CSS code here */',
    cssFilePlaceholder: 'C:\\path\\to\\style.css',
    
    // JS Tab
    externalJsFiles: 'External JS files (one per line):',
    jsCode: 'JavaScript Code:',
    jsPlaceholder: '// Enter JavaScript code here',
    jsFilePlaceholder: 'C:\\path\\to\\script.js',
    
    // Buttons
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    refresh: 'Refresh',
    
    // Resources Tab
    cssFiles: 'CSS Files',
    noCssFiles: 'No CSS files found.',
    
    // Rules List Tab
    noRules: 'No saved rules.',
    files: 'files',
    editing: 'editing',
    
    // Status Messages
    cssSaved: 'CSS saved.',
    cssDeleted: 'CSS deleted.',
    jsSaved: 'JS saved.',
    jsDeleted: 'JS deleted.',
    ruleDeleted: 'Rule deleted.',
    cssEnabled: 'CSS enabled.',
    cssDisabled: 'CSS disabled.',
    
    // Errors
    cannotGetDomain: 'Cannot get domain',
    errorOccurred: 'Error occurred',
    loadingError: 'Error loading rules.',
    saveError: 'Error saving.',
    cannotGetTab: 'Cannot get tab info.',
    cannotGetResources: 'Cannot get resources.',
    pageNotSupported: 'This page is not supported.',
    checkPermissions: 'Cannot access this page. Extensions cannot run on chrome://, edge://, or store pages.',
    
    // Confirmations
    confirmDelete: 'Delete all rules for "{domain}"?',
    
    // Loading
    loading: 'Loading...'
  },
  
  ja: {
    // Header
    appName: 'N-Styler',
    
    // Tabs
    tabCss: 'CSS',
    tabJs: 'JS',
    tabResources: 'リソース',
    tabList: 'リスト',
    
    // CSS Tab
    externalCssFiles: '外部CSSファイル（1行に1つ）:',
    cssCode: 'CSSコード:',
    cssPlaceholder: '/* CSSコードをここに入力 */',
    cssFilePlaceholder: 'C:\\path\\to\\style.css',
    
    // JS Tab
    externalJsFiles: '外部JSファイル（1行に1つ）:',
    jsCode: 'JavaScriptコード:',
    jsPlaceholder: '// JavaScriptコードをここに入力',
    jsFilePlaceholder: 'C:\\path\\to\\script.js',
    
    // Buttons
    save: '保存',
    delete: '削除',
    edit: '編集',
    refresh: '更新',
    
    // Resources Tab
    cssFiles: 'CSSファイル',
    noCssFiles: 'CSSファイルがありません。',
    
    // Rules List Tab
    noRules: '保存されたルールがありません。',
    files: 'ファイル',
    editing: '編集中',
    
    // Status Messages
    cssSaved: 'CSSを保存しました。',
    cssDeleted: 'CSSを削除しました。',
    jsSaved: 'JSを保存しました。',
    jsDeleted: 'JSを削除しました。',
    ruleDeleted: 'ルールを削除しました。',
    cssEnabled: 'CSSを有効にしました。',
    cssDisabled: 'CSSを無効にしました。',
    
    // Errors
    cannotGetDomain: 'ドメインを取得できません',
    errorOccurred: 'エラーが発生しました',
    loadingError: 'ルールの読み込みエラー。',
    saveError: '保存エラー。',
    cannotGetTab: 'タブ情報を取得できません。',
    cannotGetResources: 'リソースを取得できません。',
    pageNotSupported: 'このページはサポートされていません。',
    checkPermissions: 'このページにアクセスできません。拡張機能はchrome://、edge://、ストアページでは実行できません。',
    
    // Confirmations
    confirmDelete: '"{domain}"のすべてのルールを削除しますか？',
    
    // Loading
    loading: '読み込み中...'
  },
  
  ko: {
    // Header
    appName: 'N-Styler',
    
    // Tabs
    tabCss: 'CSS',
    tabJs: 'JS',
    tabResources: '리소스',
    tabList: '목록',
    
    // CSS Tab
    externalCssFiles: '외부 CSS 파일 (한 줄에 하나씩):',
    cssCode: 'CSS 코드:',
    cssPlaceholder: '/* 여기에 CSS 코드를 입력하세요 */',
    cssFilePlaceholder: 'C:\\path\\to\\style.css',
    
    // JS Tab
    externalJsFiles: '외부 JS 파일 (한 줄에 하나씩):',
    jsCode: 'JavaScript 코드:',
    jsPlaceholder: '// 여기에 JavaScript 코드를 입력하세요',
    jsFilePlaceholder: 'C:\\path\\to\\script.js',
    
    // Buttons
    save: '저장',
    delete: '삭제',
    edit: '편집',
    refresh: '새로고침',
    
    // Resources Tab
    cssFiles: 'CSS 파일',
    noCssFiles: 'CSS 파일이 없습니다.',
    
    // Rules List Tab
    noRules: '저장된 규칙이 없습니다.',
    files: '파일',
    editing: '편집 중',
    
    // Status Messages
    cssSaved: 'CSS가 저장되었습니다.',
    cssDeleted: 'CSS가 삭제되었습니다.',
    jsSaved: 'JS가 저장되었습니다.',
    jsDeleted: 'JS가 삭제되었습니다.',
    ruleDeleted: '규칙이 삭제되었습니다.',
    cssEnabled: 'CSS가 활성화되었습니다.',
    cssDisabled: 'CSS가 비활성화되었습니다.',
    
    // Errors
    cannotGetDomain: '도메인을 가져올 수 없습니다',
    errorOccurred: '오류 발생',
    loadingError: '규칙을 불러오는 중 오류가 발생했습니다.',
    saveError: '저장 중 오류가 발생했습니다.',
    cannotGetTab: '탭 정보를 가져올 수 없습니다.',
    cannotGetResources: '리소스를 가져올 수 없습니다.',
    pageNotSupported: '이 페이지에서는 지원되지 않습니다.',
    checkPermissions: '이 페이지에 접근할 수 없습니다. 확장 프로그램은 chrome://, edge://, 스토어 페이지에서 실행할 수 없습니다.',
    
    // Confirmations
    confirmDelete: '"{domain}"의 모든 규칙을 삭제하시겠습니까?',
    
    // Loading
    loading: '로딩 중...'
  }
};

// Export for use in popup.js
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
