const ALAN_CLIENT_IDS = (import.meta.env.VITE_ALAN_CLIENT_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

let currentKeyIndex = 0;

/**
 * 현재 활성화된 Alan Client ID를 반환합니다.
 */
export function getCurrentAlanClientId() {
  if (ALAN_CLIENT_IDS.length === 0) {
    console.error('[Alan API Error] VITE_ALAN_CLIENT_IDS가 .env.local에 설정되지 않았습니다.');
    return '';
  }
  return ALAN_CLIENT_IDS[currentKeyIndex];
}

/**
 * 401 또는 500 등 에러 발생 시 다음 Client ID로 전환하고 반환합니다.
 * 더 이상 전환할 키가 없으면 null을 반환합니다.
 */
export function getNextAlanClientId() {
  if (ALAN_CLIENT_IDS.length === 0) return '';

  currentKeyIndex++;

  if (currentKeyIndex >= ALAN_CLIENT_IDS.length) {
    console.warn('[Alan API] 준비된 모든 Client ID가 소진되었습니다.');
    return null;
  }

  console.log(`[Alan API] 다음 Client ID로 전환되었습니다. (${currentKeyIndex + 1}/${ALAN_CLIENT_IDS.length})`);
  return ALAN_CLIENT_IDS[currentKeyIndex];
}

/**
 * HTTP Status 코드가 401 또는 500 에러에 해당하는지 체크합니다.
 */
export function isFailoverError(status) {
  return status === 401 || status === 500;
}

/**
 * 필요 시 키 인덱스를 1번째로 초기화
 */
export function resetAlanClientIdIndex() {
  currentKeyIndex = 0;
}