document.addEventListener('DOMContentLoaded', function() {
    const docsNav = document.getElementById('docs-nav');
    const docsContainer = document.getElementById('docs-container');
    const searchInput = document.getElementById('docs-search-input');
    
    let docsData = null;
    let currentDocPath = '';
    
    // 配置 marked 选项
    marked.setOptions({
        highlight: function(code, lang) {
            // 检查 hljs 是否已定义，避免错误
            if (lang && window.hljs && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {
                    console.error('高亮显示错误:', e);
                }
            }
            return code; // 如果无法高亮，返回原始代码
        },
        gfm: true,
        breaks: false,
        pedantic: false,
        headerIds: true
    });
    
    // 从URL获取文档路径
    function getDocPathFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('doc') || 'getting-started/introduction';
    }
    
    // 更新URL以反映当前文档
    function updateUrl(docPath) {
        const url = new URL(window.location);
        url.searchParams.set('doc', docPath);
        window.history.pushState({}, '', url);
    }
    
    // 加载文档数据
    function loadDocsData() {
        fetch('data/docs.json')
            .then(response => {
                if (!response.ok) throw new Error('网络响应不正常');
                return response.json();
            })
            .then(data => {
                docsData = data;
                renderDocsNav(data);
                
                // 添加移动端导航切换按钮
                addMobileNavToggle();
                
                // 获取URL中的文档路径或使用默认值
                currentDocPath = getDocPathFromUrl();
                loadDoc(currentDocPath);
                
                // 高亮当前文档链接
                highlightActiveDoc(currentDocPath);
            })
            .catch(error => {
                console.error('加载文档数据时出错:', error);
                docsContainer.innerHTML = `<div class="error-message">加载文档数据失败，请刷新页面重试</div>`;
            });
    }
    
    // 渲染文档导航
    function renderDocsNav(data) {
        docsNav.innerHTML = '';
        
        data.categories.forEach(category => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'docs-nav-section';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'docs-nav-title';
            titleDiv.textContent = category.title;
            
            const docsList = document.createElement('ul');
            
            category.docs.forEach(doc => {
                const docItem = document.createElement('li');
                const docLink = document.createElement('a');
                docLink.href = `#`;
                docLink.setAttribute('data-path', doc.path);
                docLink.textContent = doc.title;
                
                docLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentDocPath = doc.path;
                    loadDoc(doc.path);
                    updateUrl(doc.path);
                    highlightActiveDoc(doc.path);
                });
                
                docItem.appendChild(docLink);
                docsList.appendChild(docItem);
            });
            
            sectionDiv.appendChild(titleDiv);
            sectionDiv.appendChild(docsList);
            docsNav.appendChild(sectionDiv);
        });
    }
    
    // 高亮当前文档链接
    function highlightActiveDoc(docPath) {
        // 移除所有active类
        document.querySelectorAll('.docs-nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        // 添加active类到当前文档链接
        const activeLink = document.querySelector(`.docs-nav a[data-path="${docPath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // 展开包含当前文档的分类
            const parentSection = activeLink.closest('.docs-nav-section');
            if (parentSection) {
                parentSection.classList.add('expanded');
            }
        }
    }
    
    // 加载文档内容
    function loadDoc(docPath) {
        docsContainer.innerHTML = '<div class="loading">加载文档中...</div>';
        
        fetch(`data/docs/${docPath}.md`)
            .then(response => {
                if (!response.ok) throw new Error(`文档不存在：${docPath}`);
                return response.text();
            })
            .then(markdown => {
                try {
                    console.log("处理MD文件:", docPath);
                    
                    // 检查并修复常见格式问题
                    let processedMarkdown = markdown
                        // 确保tip和info等标签后有空格
                        .replace(/:::(tip|info|warning|danger|details)(\S)/g, ':::$1 $2')
                        // 确保代码块格式正确
                        .replace(/```(\w+)(\s*)\n/g, '```$1\n');
                    
                    // 处理自定义容器
                    if (typeof fcl !== 'undefined') {
                        processedMarkdown = fcl.processCustomContainers(processedMarkdown);
                        console.log("处理后长度:", processedMarkdown.length);
                    } else {
                        console.warn("FCL扩展未定义");
                    }
                    
                    // 使用带错误捕获的方式解析Markdown
                    const html = marked.parse(processedMarkdown);
                    
                    // 创建文档容器并更新页面标题
                    docsContainer.innerHTML = `<div class="docs-article">${html}</div>`;
                    updateDocTitle(docPath);
                    
                    // 处理文档中的内部链接
                    setTimeout(processDocLinks, 0);
                    
                    // 初始化代码组事件
                    setTimeout(initCodeGroups, 0);
                    
                    // 添加语言标识到代码块
                    setTimeout(addLanguageLabels, 0);
                    
                    // 滚动到页面顶部
                    window.scrollTo(0, 0);
                } catch (error) {
                    console.error('处理Markdown时出错:', error);
                    docsContainer.innerHTML = `
                        <div class="error-message">
                            <h3>处理文档失败</h3>
                            <p>无法处理文档: ${docPath}</p>
                            <p>错误: ${error.message}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('加载文档时出错:', error);
                docsContainer.innerHTML = `
                    <div class="error-message">
                        <h3>加载文档失败</h3>
                        <p>无法加载请求的文档: ${docPath}</p>
                        <p>错误: ${error.message}</p>
                    </div>
                `;
            });
    }
    
    // 更新文档标题
    function updateDocTitle(docPath) {
        if (!docsData) return;
        
        // 查找当前文档的标题
        let docTitle = '文档';
        docsData.categories.forEach(category => {
            const doc = category.docs.find(d => d.path === docPath);
            if (doc) {
                docTitle = doc.title;
            }
        });
        
        // 更新页面标题
        document.title = `${docTitle} - FCL文档`;
    }
    
    // 处理文档内链接
    function processDocLinks() {
        document.querySelectorAll('.docs-article a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http')) return;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 处理锚点链接
                if (href.startsWith('#')) {
                    const targetElement = document.getElementById(href.substring(1));
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                    return;
                }
                
                // 提取文档路径
                let docPath = href;
                
                // 处理相对路径
                if (href.startsWith('../')) {
                    const parts = currentDocPath.split('/');
                    parts.pop(); // 移除当前文件名
                    docPath = parts.join('/') + href.substring(2);
                }
                
                // 移除.md扩展名
                if (docPath.endsWith('.md')) {
                    docPath = docPath.substring(0, docPath.length - 3);
                }
                
                // 处理带有锚点的链接
                const hashIndex = docPath.indexOf('#');
                let hash = '';
                if (hashIndex !== -1) {
                    hash = docPath.substring(hashIndex);
                    docPath = docPath.substring(0, hashIndex);
                }
                
                // 加载新文档
                currentDocPath = docPath;
                loadDoc(docPath);
                updateUrl(docPath);
                highlightActiveDoc(docPath);
                
                // 处理锚点
                if (hash) {
                    setTimeout(() => {
                        const targetElement = document.getElementById(hash.substring(1));
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }
            });
        });
    }
    
    // 初始化代码组交互
    function initCodeGroups() {
        console.log("初始化代码组");
        document.querySelectorAll('.code-group-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                const parent = this.closest('.code-group');
                
                // 移除所有active类
                parent.querySelectorAll('.code-group-tab').forEach(t => t.classList.remove('active'));
                parent.querySelectorAll('.code-group-content').forEach(c => c.classList.remove('active'));
                
                // 添加active类到当前选中的tab和内容
                this.classList.add('active');
                parent.querySelector(`.code-group-content[data-tab="${tabId}"]`).classList.add('active');
            });
        });
    }
    
    // 添加语言标签到代码块
    function addLanguageLabels() {
        document.querySelectorAll('.docs-article pre code').forEach(codeBlock => {
            const parentPre = codeBlock.parentElement;
            const className = codeBlock.className;
            const languageMatch = className.match(/language-(\w+)/);
            
            if (languageMatch && languageMatch[1]) {
                parentPre.setAttribute('data-language', languageMatch[1]);
            }
        });
    }
    
    // 文档搜索功能
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (!docsData) return;
        
        if (searchTerm.length < 2) {
            // 重置所有文档链接
            document.querySelectorAll('.docs-nav a').forEach(link => {
                link.parentElement.style.display = 'block';
            });
            
            // 显示所有分类
            document.querySelectorAll('.docs-nav-section').forEach(section => {
                section.style.display = 'block';
            });
            
            return;
        }
        
        // 过滤文档链接
        docsData.categories.forEach(category => {
            const categorySection = document.querySelector(`.docs-nav-title:contains("${category.title}")`).closest('.docs-nav-section');
            let hasVisibleDocs = false;
            
            category.docs.forEach(doc => {
                const link = document.querySelector(`.docs-nav a[data-path="${doc.path}"]`);
                if (link) {
                    const matches = doc.title.toLowerCase().includes(searchTerm);
                    link.parentElement.style.display = matches ? 'block' : 'none';
                    if (matches) hasVisibleDocs = true;
                }
            });
            
            // 隐藏没有匹配文档的分类
            if (categorySection) {
                categorySection.style.display = hasVisibleDocs ? 'block' : 'none';
            }
        });
    });
    
    // 添加:contains选择器
    jQuery.expr[':'].contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
    
    // 添加移动端导航切换功能
    function addMobileNavToggle() {
        const sidebarElement = document.querySelector('.docs-sidebar');
        
        // 如果已经存在切换按钮，则不再添加
        if (document.querySelector('.docs-nav-toggle')) {
            return;
        }
        
        // 创建导航切换按钮
        const toggleButton = document.createElement('button');
        toggleButton.className = 'docs-nav-toggle';
        toggleButton.textContent = '文档导航';
        toggleButton.setAttribute('aria-label', '切换文档导航');
        
        // 将按钮插入到侧边栏的最前面
        sidebarElement.insertBefore(toggleButton, sidebarElement.firstChild);
        
        // 添加点击事件
        toggleButton.addEventListener('click', function() {
            const docsNavElement = document.querySelector('.docs-nav');
            docsNavElement.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // 添加响应式调整函数
    function handleResponsiveLayout() {
        const mobileToggle = document.querySelector('.docs-nav-toggle');
        const docsNav = document.querySelector('.docs-nav');
        
        if (window.innerWidth <= 768) {
            // 在移动视图中初始化为关闭状态
            if (docsNav && !docsNav.className.includes('processed')) {
                docsNav.classList.add('processed');
                docsNav.classList.remove('active');
            }
        } else {
            // 在桌面视图中始终显示
            if (docsNav) {
                docsNav.classList.add('active');
            }
        }
    }
    
    // 初始加载文档数据
    loadDocsData();
    
    // 处理浏览器前进/后退按钮
    window.addEventListener('popstate', function() {
        currentDocPath = getDocPathFromUrl();
        loadDoc(currentDocPath);
        highlightActiveDoc(currentDocPath);
    });
    
    // 在DOMContentLoaded事件中添加窗口调整监听
    window.addEventListener('resize', handleResponsiveLayout);
    document.addEventListener('DOMContentLoaded', handleResponsiveLayout);
}); 