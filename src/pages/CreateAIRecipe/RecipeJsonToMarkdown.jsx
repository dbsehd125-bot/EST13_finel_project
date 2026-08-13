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
      const tipText = step.tip ? `\n💡 **Tip:** ${step.tip}` : '';
      return `### Step ${step.step}. ${step.title}\n${step.description}\n${tipText}`;
    })
    .join('\n\n');

  // 부족한 재료 장보기 목록 마크다운 변환
  const shoppingListSection =
    recipe.shopping_list && recipe.shopping_list.length > 0
      ? `---\n\n### 🛍️ 부족한 재료 장보기 목록\n` +
        recipe.shopping_list
          .map((item) => (item.startsWith('☑️') || item.startsWith('☐') ? item : `☑️ ${item}`))
          .join('\n\n') +
        '\n\n'
      : '';

  // 태그 목록 마크다운 변환
  const tagsList = recipe.tags?.length > 0 ? `\n\n${recipe.tags.map((tag) => `#${tag}`).join(' ')}` : '';

  return `# 🍳 ${recipe.title}

> ${recipe.summary}

---

### 📌 기본 정보
- **음식 종류:** ${recipe.cuisine || '-'}
- **건강/식단:** ${recipe.diets || '-'}
- **조리 시간:** ${recipe.cooking_time || '-'}
- **난이도:** ${recipe.difficulty || '-'}
- **분량:** ${recipe.servings || '-'}

---

### 🥕 재료 목록
${ingredientsList || '- 등록된 재료가 없습니다.'}

---

### 🍳 상세 조리 순서
${stepsList || '등록된 조리 순서가 없습니다.'}

${shoppingListSection}---${tagsList}
`.trim();
}
