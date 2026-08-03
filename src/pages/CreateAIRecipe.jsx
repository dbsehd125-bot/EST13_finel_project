import React, { useState } from 'react';
import Layout from '../components/Layout';
import styles from './CreateAIRecipe.module.css';

export default function CreateAIRecipe() {
  const [tab, setTab] = useState('ingredient'); // 'ingredient' | 'url'
  const [ingredients, setIngredients] = useState('');
  const [url, setUrl] = useState('');
  const [cookingTime, setCookingTime] = useState('15분 이내');
  const [difficulty, setDifficulty] = useState('쉬움');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // 추후 Supabase / OpenAI API 연동 로직이 위치할 곳입니다.
    setTimeout(() => {
      setIsLoading(false);
      setResult({
        title: 'AI 추천 냉장고 파먹기 계란볶음밥',
        description: '남은 계란과 파로 빠르게 완성하는 고소한 볶음밥 레시피입니다.',
        time: cookingTime,
        difficulty: difficulty,
        steps: [
          '대파를 송송 쓸어 기름에 볶아 파기름을 냅니다.',
          '계란을 풀어 스크램블을 만든 후 밥을 넣고 함께 볶습니다.',
          '굴소스나 간장으로 간을 맞추어 완성합니다.',
        ],
      });
    }, 1500);
  };

  return (
    <Layout activeMenu="AI 레시피">
      <div className="container">
        {/* 헤더 섹션 */}
        <section className={styles.headerSection}>
          <span className={styles.badge}>✨ AI 셰프 추천</span>
          <h1 className="font-display dtext-4xl" style={{ marginTop: '8px', marginBottom: '12px' }}>
            1초 만에 완성하는 맞춤 AI 레시피
          </h1>
          <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
            냉장고 속 남은 재료를 입력하거나 유튜브 영상 URL을 넣으시면 AI가 레시피를 생성해 드립니다.
          </p>
        </section>

        <div className={styles.contentGrid}>
          {/* 입력 폼 영역 */}
          <form className={styles.formCard} onSubmit={handleGenerate}>
            {/* 탭 전환 */}
            <div className={styles.tabGroup}>
              <button
                type="button"
                className={`${styles.tabBtn} ${tab === 'ingredient' ? styles.activeTab : ''}`}
                onClick={() => setTab('ingredient')}
              >
                🥕 재료로 생성하기
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${tab === 'url' ? styles.activeTab : ''}`}
                onClick={() => setTab('url')}
              >
                🔗 유튜브 URL 붙여넣기
              </button>
            </div>

            {/* 입력 필드 */}
            {tab === 'ingredient' ? (
              <div className={styles.inputField}>
                <label className="text-lg" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  보유한 재료 입력
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="예: 계란, 대파, 찬밥, 굴소스 (쉼표로 구분해 보세요)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                />
              </div>
            ) : (
              <div className={styles.inputField}>
                <label className="text-lg" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  소셜/유튜브 URL
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* 조건 선택 옵션 */}
            <div className={styles.optionRow}>
              <div className={styles.optionGroup}>
                <label className="text-sm" style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  ⏱ 조리 시간
                </label>
                <select className={styles.select} value={cookingTime} onChange={(e) => setCookingTime(e.target.value)}>
                  <option>10분 이내</option>
                  <option>15분 이내</option>
                  <option>30분 이내</option>
                  <option>1시간 이내</option>
                </select>
              </div>

              <div className={styles.optionGroup}>
                <label className="text-sm" style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  🔥 난이도
                </label>
                <select className={styles.select} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>초간단</option>
                  <option>쉬움</option>
                  <option>보통</option>
                  <option>전문가</option>
                </select>
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || (tab === 'ingredient' && !ingredients.trim()) || (tab === 'url' && !url.trim())}
            >
              {isLoading ? '✨ AI 레시피 생성 중...' : '🚀 AI 레시피 생성하기'}
            </button>
          </form>

          {/* 결과 미리보기 영역 */}
          <div className={styles.resultCard}>
            {isLoading ? (
              <div className={styles.loadingBox}>
                <div className={styles.spinner} />
                <p className="text-m" style={{ color: 'var(--brand-brown)', marginTop: '16px' }}>
                  AI 셰프가 맛있는 레시피를 구상 중입니다...
                </p>
              </div>
            ) : result ? (
              <div className={styles.resultContent}>
                <span className={styles.resultBadge}>생성 완료</span>
                <h2 className="font-display dtext-2xl" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  {result.title}
                </h2>
                <p className="text-m" style={{ color: 'var(--brand-gray)', marginBottom: '16px' }}>
                  {result.description}
                </p>

                <div className={styles.tagGroup}>
                  <span className={styles.tag}>⏱ {result.time}</span>
                  <span className={styles.tag}>🔥 난이도: {result.difficulty}</span>
                </div>

                <div className={styles.stepsBox}>
                  <h3 className="text-lg" style={{ fontWeight: 600, marginBottom: '12px' }}>
                    🍳 조리 순서
                  </h3>
                  <ol className={styles.stepList}>
                    {result.steps.map((step, idx) => (
                      <li key={idx} className="text-m" style={{ marginBottom: '8px' }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className={styles.placeholderBox}>
                <div className={styles.placeholderIcon}>🥗</div>
                <p className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)', marginBottom: '4px' }}>
                  아직 생성된 레시피가 없습니다
                </p>
                <p className="text-sm" style={{ color: 'var(--brand-gray)' }}>
                  좌측에서 재료를 입력하고 AI 레시피를 생성해 보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
