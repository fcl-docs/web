/**
 * FCL文档 - Markdown扩展功能
 * 实现类似VitePress的Markdown增强功能
 */

// 定义FCL命名空间以避免全局污染
window.fcl = window.fcl || {};

// 自定义标记扩展
const fcl = {
  // 自定义容器正则表达式
  containers: {
    tip: /^:::[ ]*tip[ ]*(.*?)$/,
    warning: /^:::[ ]*warning[ ]*(.*?)$/,
    danger: /^:::[ ]*danger[ ]*(.*?)$/,
    info: /^:::[ ]*info[ ]*(.*?)$/,
    details: /^:::[ ]*details[ ]*(.*?)$/,
    code: /^:::[ ]*code-group[ ]*$/,
    codeEnd: /^:::[ ]*$/
  },
  
  // 重写自定义容器处理函数
  processCustomContainers: function(markdown) {
    // 更精确的非贪婪匹配正则表达式
    const containerPattern = /^:::(\s*)(tip|warning|danger|info|details)(?:\s+(.+?))?(?:\s*)\n([\s\S]*?)(?:\n:::)(?:\s*)$/gm;
    
    // 修复容器嵌套问题 - 需要一个特殊的标记替换策略
    let lastMatchEnd = 0;
    let result = '';
    let match;
    
    // 首先保存所有匹配位置
    const matches = [];
    while ((match = containerPattern.exec(markdown)) !== null) {
        matches.push({
            index: match.index,
            end: match.index + match[0].length,
            type: match[2],
            title: match[3] || this.getDefaultTitle(match[2]),
            content: match[4]
        });
    }
    
    // 处理匹配，处理嵌套情况
    if (matches.length === 0) {
        return markdown;
    }
    
    // 处理匹配
    let lastIndex = 0;
    for (const m of matches) {
        // 添加当前匹配前的内容
        result += markdown.substring(lastIndex, m.index);
        
        // 对容器内容进行预处理
        // 关键修改：提前处理容器内容中的Markdown语法
        let processedContent = m.content;
        
        // 不再递归处理嵌套容器 - 只在最外层处理
        if (m.type === 'details') {
            result += `<details class="custom-container ${m.type}">
                <summary class="custom-container-title">${m.title}</summary>
                <div class="custom-container-content">${processedContent}</div>
            </details>`;
        } else {
            result += `<div class="custom-container ${m.type}">
                <p class="custom-container-title">${m.title}</p>
                <div class="custom-container-content">${processedContent}</div>
            </div>`;
        }
        
        lastIndex = m.end;
    }
    
    // 添加剩余内容
    result += markdown.substring(lastIndex);
    return result;
  },
  
  // 添加辅助方法
  getDefaultTitle: function(type) {
    switch (type) {
        case 'tip': return '提示';
        case 'warning': return '警告';
        case 'danger': return '危险';
        case 'info': return '信息';
        case 'details': return '详细信息';
        default: return '';
    }
  },
  
  // 渲染容器
  renderContainer: function(type, title, content) {
    console.log(`渲染${type}容器，标题: "${title}"`);
    
    if (type === 'details') {
      return `<details class="custom-container ${type}">
        <summary>${title || '详情'}</summary>
        <div class="custom-container-content">${content}</div>
      </details>`;
    }
    
    const titleHtml = title ? `<div class="custom-container-title">${title}</div>` : '';
    return `<div class="custom-container ${type}">
      ${titleHtml}
      <div class="custom-container-content">${content}</div>
    </div>`;
  },
  
  // 渲染代码组
  renderCodeGroup: function(codeBlocks) {
    console.log(`渲染代码组，共${codeBlocks.length}个代码块`);
    
    // 生成Tab按钮
    const tabs = codeBlocks.map((block, index) => {
      const isActive = index === 0 ? 'active' : '';
      return `<button class="code-group-tab ${isActive}" data-tab="${index}">${block.title}</button>`;
    }).join('');
    
    // 生成代码块内容
    const blocks = codeBlocks.map((block, index) => {
      const isActive = index === 0 ? 'active' : '';
      return `<div class="code-group-content ${isActive}" data-tab="${index}">${block.content.join('\n')}</div>`;
    }).join('');
    
    return `<div class="code-group">
      <div class="code-group-tabs">${tabs}</div>
      <div class="code-group-contents">${blocks}</div>
    </div>`;
  },
  
  // 获取语言名称
  getLanguageName: function(lang) {
    const languageMap = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'java': 'Java',
      'python': 'Python',
      'bash': 'Bash',
      'sh': 'Shell',
      'json': 'JSON',
      'md': 'Markdown'
    };
    
    return languageMap[lang] || lang || 'Text';
  },
  
  // 处理代码组的函数
  processCodeGroups: function(html) {
    const codeBlockPattern = /<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g;
    let match;
    let codeBlocks = [];
    let lastIndex = 0;
    
    // 收集所有代码块
    while ((match = codeBlockPattern.exec(html)) !== null) {
        codeBlocks.push({
            lang: match[1],
            content: match[2],
            start: match.index,
            end: match.index + match[0].length
        });
    }
    
    // 处理连续的代码块作为代码组
    let result = '';
    let i = 0;
    
    while (i < codeBlocks.length) {
        if (i + 1 < codeBlocks.length && 
            codeBlocks[i].end + 20 > codeBlocks[i+1].start) { // 允许适当的间隔
            
            // 这是一个代码组的开始
            let groupStart = i;
            let tabs = '';
            let contents = '';
            
            // 将HTML从上一个位置到当前代码组开始的部分添加到结果中
            result += html.substring(lastIndex, codeBlocks[groupStart].start);
            
            // 收集代码组中的所有代码块
            while (i < codeBlocks.length && 
                  (i === groupStart || codeBlocks[i-1].end + 20 > codeBlocks[i].start)) {
                const block = codeBlocks[i];
                const active = i === groupStart ? ' active' : '';
                
                tabs += `<button class="code-group-tab${active}" data-tab="${i - groupStart}">${block.lang}</button>`;
                contents += `<div class="code-group-content${active}" data-tab="${i - groupStart}"><pre><code class="language-${block.lang}">${block.content}</code></pre></div>`;
                
                i++;
            }
            
            // 生成代码组HTML
            result += `<div class="code-group">
                <div class="code-group-tabs">${tabs}</div>
                <div class="code-group-contents">${contents}</div>
            </div>`;
            
            // 更新lastIndex以跳过已处理的代码块
            lastIndex = codeBlocks[i-1].end;
        } else {
            // 单个代码块，保持不变
            result += html.substring(lastIndex, codeBlocks[i].end);
            lastIndex = codeBlocks[i].end;
            i++;
        }
    }
    
    // 添加剩余的HTML
    result += html.substring(lastIndex);
    
    return result;
  },
  
  // 初始化代码组事件处理
  initCodeGroups: function() {
    document.querySelectorAll('.code-group-tab').forEach(tab => {
        if (tab.getAttribute('data-initialized') === 'true') {
            return; // 避免重复初始化
        }
        
        tab.setAttribute('data-initialized', 'true');
        tab.addEventListener('click', function() {
            const group = this.closest('.code-group');
            const tabIndex = this.getAttribute('data-tab');
            
            // 更新标签状态
            group.querySelectorAll('.code-group-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // 更新内容状态
            group.querySelectorAll('.code-group-content').forEach(content => {
                content.classList.remove('active');
            });
            group.querySelector(`.code-group-content[data-tab="${tabIndex}"]`).classList.add('active');
        });
    });
  },
  
  // 完全重写代码组容器处理函数
  processCodeGroupContainers: function(markdown) {
    // 使用更精确的正则表达式
    const codeGroupPattern = /^:::code-group\s*$([\s\S]*?)^:::\s*$/gm;
    
    return markdown.replace(codeGroupPattern, function(match, content) {
        // 提取代码块
        const codeBlocks = [];
        const codeBlockRegex = /^```(\w+)(?:\s+(.+?))?\s*\n([\s\S]*?)```/gm;
        let codeMatch;
        
        while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
            codeBlocks.push({
                lang: codeMatch[1],
                title: codeMatch[2] || codeMatch[1],
                content: codeMatch[3]
            });
        }
        
        if (codeBlocks.length === 0) {
            return match; // 如果没有找到代码块，保持原样
        }
        
        // 构建HTML
        let tabs = '';
        let contents = '';
        
        codeBlocks.forEach((block, index) => {
            const activeClass = index === 0 ? ' active' : '';
            tabs += `<button class="code-group-tab${activeClass}" data-tab="${index}">${block.title}</button>`;
            contents += `<div class="code-group-content${activeClass}" data-tab="${index}">
                <pre><code class="language-${block.lang}">${block.content}</code></pre>
            </div>`;
        });
        
        return `<div class="code-group">
            <div class="code-group-tabs">${tabs}</div>
            <div class="code-group-contents">${contents}</div>
        </div>`;
    });
  },
  
  // 添加专门的代码组检测函数
  detectCodeGroups: function(markdown) {
    console.log("开始检测代码组...");
    
    // 检测代码组容器
    const containerPattern = /:::code-group[\s\S]*?\n([\s\S]*?)\n:::/g;
    const containerMatches = markdown.match(containerPattern);
    
    if (containerMatches) {
        console.log(`找到 ${containerMatches.length} 个代码组容器`);
        containerMatches.forEach((match, i) => {
            console.log(`代码组 ${i+1}:\n${match.substring(0, 100)}...`);
        });
    } else {
        console.log("未找到代码组容器");
    }
    
    // 检测连续的代码块（可能是代码组）
    const codeBlockPattern = /```(\w+)[\s\S]*?```\s*```(\w+)/g;
    const codeBlockMatches = markdown.match(codeBlockPattern);
    
    if (codeBlockMatches) {
        console.log(`找到 ${codeBlockMatches.length} 个可能的连续代码块组`);
        codeBlockMatches.forEach((match, i) => {
            console.log(`连续代码块 ${i+1}:\n${match.substring(0, 100)}...`);
        });
    } else {
        console.log("未找到连续代码块");
    }
    
    // 保存未处理的原始Markdown
    window.originalMarkdown = markdown;
    console.log("检测完成，原始Markdown已保存到window.originalMarkdown");
  },
  
  // 初始化可折叠容器
  initCollapsibleContainers: function() {
    // details 容器已经有原生折叠功能，无需添加JavaScript
    console.log('已初始化可折叠容器');
  },
  
  // 重构处理管道以确保标题正确渲染
  processMarkdown: function(markdown) {
    try {
        // 1. 先处理特殊容器
        let processedMarkdown = markdown;
        
        // 找出所有代码组并替换为占位符
        const codeGroups = [];
        processedMarkdown = processedMarkdown.replace(/^:::code-group\s*$([\s\S]*?)^:::\s*$/gm, 
            function(match, content) {
                const id = `CODE_GROUP_${codeGroups.length}`;
                codeGroups.push(match);
                return id;
            });
        
        // 找出所有自定义容器并替换为占位符
        const containers = [];
        processedMarkdown = processedMarkdown.replace(/^:::(\s*)(tip|warning|danger|info|details)(?:\s+(.+?))?(?:\s*)\n([\s\S]*?)(?:\n:::)(?:\s*)$/gm,
            function(match, spacing, type, title, content) {
                const id = `CONTAINER_${containers.length}`;
                containers.push({
                    match: match,
                    type: type,
                    title: title || this.getDefaultTitle(type),
                    content: content
                });
                return id;
            }.bind(this));
        
        // 2. 使用marked解析基本Markdown
        let html = marked.parse(processedMarkdown);
        
        // 3. 恢复容器并进行处理
        // 先处理代码组
        codeGroups.forEach((group, i) => {
            const id = `CODE_GROUP_${i}`;
            const processed = this.processCodeGroupContainers(group);
            html = html.replace(id, processed);
        });
        
        // 再处理自定义容器，关键改动：先处理容器内容
        containers.forEach((container, i) => {
            const id = `CONTAINER_${i}`;
            
            // 先用marked处理容器内容
            let processedContent = marked.parse(container.content);
            
            // 移除marked生成的外层<p>标签（如果有的话）
            processedContent = processedContent.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
            
            // 根据容器类型生成HTML
            let containerHtml;
            if (container.type === 'details') {
                containerHtml = `<details class="custom-container ${container.type}">
                    <summary class="custom-container-title">${container.title}</summary>
                    <div class="custom-container-content">${processedContent}</div>
                </details>`;
            } else {
                containerHtml = `<div class="custom-container ${container.type}">
                    <p class="custom-container-title">${container.title}</p>
                    <div class="custom-container-content">${processedContent}</div>
                </div>`;
            }
            
            html = html.replace(id, containerHtml);
        });
        
        // 4. 处理连续代码块
        html = this.processCodeGroups(html);
        
        return html;
    } catch (err) {
        console.error("处理Markdown时出错:", err);
        return `<div class="error-message">
            <h3>处理Markdown出错</h3>
            <p>${err.message}</p>
        </div>`;
    }
  },
  
  // 移除调试函数
  debugHeadings: function() {
    // ... 调试函数内容 ...
  },
  
  // 移除容器调试函数
  debugContainers: function(markdown) {
    // ... 调试函数内容 ...
  }
};

// 在DOMContentLoaded时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 注册全局初始化函数
    if (window.fcl) {
        // 初始化代码组事件处理
        fcl.initCodeGroups();
        
        // 初始化折叠容器
        fcl.initCollapsibleContainers();
        
        console.log('FCL Markdown扩展已初始化');
    }
}); 