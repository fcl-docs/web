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
  
  // 处理自定义容器
  processCustomContainers: function(markdown) {
    // 更准确的容器正则表达式 - 注意前后的换行匹配
    const containerPattern = /^:::(\s*)(tip|warning|danger|info|details)(?:\s+(.+?))?(?:\s*)\n([\s\S]*?)\n:::\s*$/gm;
    
    // 处理自定义容器，将其转换为HTML
    return markdown.replace(containerPattern, function(match, spacing, type, title, content) {
        console.log(`找到${type}容器，标题: "${title || '无'}", 内容长度: ${content.length}`);
        
        title = title || getDefaultTitle(type);
        
        let processedContent = content.trim();
        // 递归处理嵌套容器
        if (containerPattern.test(processedContent)) {
            containerPattern.lastIndex = 0; // 重置正则表达式索引
            processedContent = fcl.processCustomContainers(processedContent);
        }
        
        // 特殊处理details容器
        if (type === 'details') {
            return `<details class="custom-container ${type}">
                <summary class="custom-container-title">${title}</summary>
                <div class="custom-container-content">${processedContent}</div>
            </details>`;
        }
        
        // 其他容器
        return `<div class="custom-container ${type}">
            <p class="custom-container-title">${title}</p>
            <div class="custom-container-content">${processedContent}</div>
        </div>`;
    });
    
    // 为不同类型的容器提供默认标题
    function getDefaultTitle(type) {
        switch (type) {
            case 'tip': return '提示';
            case 'warning': return '警告';
            case 'danger': return '危险';
            case 'info': return '信息';
            case 'details': return '详细信息';
            default: return '';
        }
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
  
  // 添加特殊处理代码组容器的函数
  processCodeGroupContainers: function(markdown) {
    // 处理代码组容器
    const codeGroupPattern = /^:::code-group\s*\n([\s\S]*?)\n:::\s*$/gm;
    
    return markdown.replace(codeGroupPattern, function(match, content) {
        // 将内容转换为代码组HTML
        const codeBlocks = [];
        let codeBlockPattern = /^```(\w+)(.*?)\n([\s\S]*?)```\s*$/gm;
        let blockMatch;
        
        while ((blockMatch = codeBlockPattern.exec(content)) !== null) {
            codeBlocks.push({
                lang: blockMatch[1],
                title: blockMatch[2].trim() || blockMatch[1],
                content: blockMatch[3]
            });
        }
        
        if (codeBlocks.length === 0) {
            return match; // 如果没有找到代码块，保持原样
        }
        
        // 构建代码组HTML
        let tabs = '';
        let contents = '';
        
        codeBlocks.forEach((block, index) => {
            const active = index === 0 ? ' active' : '';
            tabs += `<button class="code-group-tab${active}" data-tab="${index}">${block.title}</button>`;
            contents += `<div class="code-group-content${active}" data-tab="${index}"><pre><code class="language-${block.lang}">${block.content}</code></pre></div>`;
        });
        
        return `<div class="code-group">
            <div class="code-group-tabs">${tabs}</div>
            <div class="code-group-contents">${contents}</div>
        </div>`;
    });
  },
  
  // 初始化可折叠容器
  initCollapsibleContainers: function() {
    // details 容器已经有原生折叠功能，无需添加JavaScript
    console.log('已初始化可折叠容器');
  },
  
  // 设置完整的处理管道
  processMarkdown: function(markdown) {
    // 1. 处理自定义容器
    let result = this.processCustomContainers(markdown);
    
    // 2. 处理代码组容器
    result = this.processCodeGroupContainers(result);
    
    // 3. 转换为HTML
    result = marked.parse(result);
    
    // 4. 处理代码组
    result = this.processCodeGroups(result);
    
    return result;
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