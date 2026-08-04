import re

def process_file(filepath, global_classes):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change import
    content = re.sub(r"import '\./(.*?)\.css';", r"import styles from './\1.module.css';", content)
    
    def replacer(match):
        classes = match.group(1).split()
        new_classes = []
        has_dynamic = False
        for c in classes:
            if c in global_classes:
                new_classes.append(c)
            elif '{' in c or '}' in c or '$' in c:
                new_classes.append(c)
                has_dynamic = True
            else:
                new_classes.append("${styles['" + c + "']}")
        
        if len(new_classes) == 1 and new_classes[0].startswith('${') and not has_dynamic:
            # single local class
            return "className={styles['" + classes[0] + "']}"
        elif all(c in global_classes for c in classes):
            # all global
            return 'className="' + match.group(1) + '"'
        else:
            return "className={`" + " ".join(new_classes) + "`}"
            
    content = re.sub(r'className="([^"]+)"', replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

global_classes = {'font-display', 'dtext-2xl', 'text-m', 'text-lg', 'text-sm', 'text-button', 'text-s', 'dtext-xl'}
process_file('src/pages/MyPage.jsx', global_classes)
process_file('src/pages/RecipeList.jsx', global_classes)

# dynamic template literals fixes
with open('src/pages/MyPage.jsx', 'r', encoding='utf-8') as f: content = f.read()
content = content.replace(
    "className={`text-button tab-item ${activeTab === tab ? 'active' : ''}`}", 
    "className={`text-button ${styles['tab-item']} ${activeTab === tab ? styles['active'] : ''}`}"
)
content = content.replace(
    "className={`text-s privacy-badge ${recipe.isPublic ? 'public' : 'private'}`}", 
    "className={`text-s ${styles['privacy-badge']} ${recipe.isPublic ? styles['public'] : styles['private']}`}"
)
with open('src/pages/MyPage.jsx', 'w', encoding='utf-8') as f: f.write(content)

# RecipeList dynamic template literals fixes
with open('src/pages/RecipeList.jsx', 'r', encoding='utf-8') as f: content = f.read()
content = content.replace(
    "className={`text-button tab-item ${activeTab === tab ? 'active' : ''}`}", 
    "className={`text-button ${styles['tab-item']} ${activeTab === tab ? styles['active'] : ''}`}"
)
with open('src/pages/RecipeList.jsx', 'w', encoding='utf-8') as f: f.write(content)
