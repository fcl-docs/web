/**
 * FCL文档 - Markdown扩展功能
 * 实现类似VitePress的Markdown增强功能
 */

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
    console.log("开始处理Markdown扩展");
    
    // 首先预处理markdown，规范化容器标记
    let normalizedMd = markdown.replace(/^:::(\w+)[ ]*(.*)$/gm, "::: $1 $2");
    
    const lines = normalizedMd.split('\n');
    const result = [];
    
    let inContainer = false;
    let containerType = null;
    let containerTitle = '';
    let containerContent = [];
    
    let inCodeGroup = false;
    let codeBlocks = [];
    let currentBlock = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检查容器结束
      if (this.containers.codeEnd.test(line)) {
        if (inCodeGroup) {
          // 结束代码组
          if (currentBlock) {
            codeBlocks.push(currentBlock);
            currentBlock = null;
          }
          
          result.push(this.renderCodeGroup(codeBlocks));
          inCodeGroup = false;
          codeBlocks = [];
          continue;
        } else if (inContainer) {
          // 结束普通容器
          result.push(this.renderContainer(containerType, containerTitle, containerContent.join('\n')));
          inContainer = false;
          containerType = null;
          containerTitle = '';
          containerContent = [];
          continue;
        }
      }
      
      // 检查代码组容器开始
      if (this.containers.code.test(line)) {
        inCodeGroup = true;
        continue;
      }
      
      // 处理代码组内的代码块
      if (inCodeGroup && line.startsWith('```')) {
        if (currentBlock) {
          // 结束当前代码块
          currentBlock.content.push(line);
          codeBlocks.push(currentBlock);
          currentBlock = null;
        } else {
          // 开始新代码块
          let lang = '';
          if (line.length > 3) {
            lang = line.substring(3).trim();
          }
          
          currentBlock = {
            title: this.getLanguageName(lang),
            language: lang,
            content: [line]
          };
        }
        continue;
      }
      
      // 处理代码块内容
      if (currentBlock) {
        currentBlock.content.push(line);
        continue;
      }
      
      // 检查其他容器开始
      let containerFound = false;
      for (const [type, regex] of Object.entries(this.containers)) {
        if (type === 'code' || type === 'codeEnd') continue;
        
        const match = line.match(regex);
        if (match) {
          containerType = type;
          containerTitle = match[1] ? match[1].trim() : '';
          inContainer = true;
          containerContent = [];
          containerFound = true;
          break;
        }
      }
      
      if (containerFound) {
        continue;
      }
      
      // 处理常规行
      if (inContainer) {
        containerContent.push(line);
      } else if (!inCodeGroup) {
        result.push(line);
      }
    }
    
    // 关闭任何未关闭的容器
    if (inContainer) {
      result.push(this.renderContainer(containerType, containerTitle, containerContent.join('\n')));
    }
    
    return result.join('\n');
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
  }
}; 