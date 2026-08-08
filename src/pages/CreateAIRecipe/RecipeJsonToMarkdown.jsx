export function RecipeJsonToMarkdown(recipe) {
  if (!recipe) return '';

  // 재료 목록 마크다운 변환
  const ingredientsList = recipe.ingredients
    ?.map((item) => {
      const subText = item.isSubstitutable && item.substituteName ? ` *(대체: ${item.substituteName})*` : '';
      return `- ${item.name}${subText}`;
    })
    .join('\n');

  // 조리 단계 마크다운 변환
  const stepsList = recipe.steps
    ?.map((step) => {
      const tipText = step.tip ? `\n  > 💡 **Tip:** ${step.tip}` : '';
      return `### Step ${step.step}. ${step.title}\n${step.description}${tipText}`;
    })
    .join('\n\n');

  // 태그 목록 마크다운 변환
  const tagsList = recipe.tags?.length > 0 ? `\n\n**태그:** ${recipe.tags.map((tag) => `#${tag}`).join(' ')}` : '';

  return `
  # 🍳 ${recipe.title}

  > ${recipe.summary}

  ---

  ### 📌 기본 정보
  - **카테고리:** ${recipe.cuisine}
  - **조리시간:** ${recipe.cooking_time}
  - **난이도:** ${recipe.difficulty}
  - **인분:** ${recipe.servings}

  ---

  ### 🥕 재료 목록
  ${ingredientsList || '- 등록된 재료가 없습니다.'}

  ---

  ### 🍳 상세 조리 순서
  ${stepsList || '등록된 조리 순서가 없습니다.'}
  ${tagsList}
  `.trim();
}
