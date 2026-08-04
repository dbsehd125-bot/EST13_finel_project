const fs = require('fs');

const globalClasses = new Set(['font-display', 'dtext-2xl', 'text-m', 'text-lg', 'text-sm', 'text-button', 'text-s', 'dtext-xl']);

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Change import
    content = content.replace(/import '\.\/(.*?)\.css';/g, "import styles from './$1.module.css';");
    
    content = content.replace(/className="([^"]+)"/g, (match, classesStr) => {
        const classes = classesStr.split(/\s+/);
        let newClasses = [];
        let hasDynamic = false;
        
        for (let c of classes) {
            if (globalClasses.has(c)) {
                newClasses.push(c);
            } else if (c.includes('{') || c.includes('}') || c.includes('$')) {
                newClasses.push(c);
                hasDynamic = true;
            } else {
                newClasses.push(`\${styles['${c}']}`);
            }
        }
        
        if (newClasses.length === 1 && newClasses[0].startsWith('${') && !hasDynamic) {
            return `className={styles['${classes[0]}']}`;
        } else if (classes.every(c => globalClasses.has(c))) {
            return match;
        } else {
            return `className={\`${newClasses.join(' ')}\`}`;
        }
    });

    fs.writeFileSync(filepath, content, 'utf-8');
}

processFile('src/pages/MyPage.jsx');
processFile('src/pages/RecipeList.jsx');

// dynamic template literals fixes for MyPage
let myPageContent = fs.readFileSync('src/pages/MyPage.jsx', 'utf-8');
myPageContent = myPageContent.replace(
    "className={`text-button tab-item ${activeTab === tab ? 'active' : ''}`}", 
    "className={`text-button ${styles['tab-item']} ${activeTab === tab ? styles['active'] : ''}`}"
);
myPageContent = myPageContent.replace(
    "className={`text-s privacy-badge ${recipe.isPublic ? 'public' : 'private'}`}", 
    "className={`text-s ${styles['privacy-badge']} ${recipe.isPublic ? styles['public'] : styles['private']}`}"
);
fs.writeFileSync('src/pages/MyPage.jsx', myPageContent, 'utf-8');

// RecipeList dynamic template literals fixes
let recipeListContent = fs.readFileSync('src/pages/RecipeList.jsx', 'utf-8');
recipeListContent = recipeListContent.replace(
    /className=\{\`filter-chip text-button\`\}/g,
    "className={`text-button ${styles['filter-chip']}`}"
);
recipeListContent = recipeListContent.replace(
    "className={`text-button tab-item ${activeTab === tab ? 'active' : ''}`}", 
    "className={`text-button ${styles['tab-item']} ${activeTab === tab ? styles['active'] : ''}`}"
);
recipeListContent = recipeListContent.replace(
    /className="page-btn active text-button"/g,
    "className={`text-button ${styles['page-btn']} ${styles['active']}`}"
);
recipeListContent = recipeListContent.replace(
    /className="page-btn text-button"/g,
    "className={`text-button ${styles['page-btn']}`}"
);
fs.writeFileSync('src/pages/RecipeList.jsx', recipeListContent, 'utf-8');
