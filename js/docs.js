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
        if (!docPath) {
            docsContainer.innerHTML = '<div class="error-message">未指定文档路径</div>';
            return;
        }
        
        const filePath = `data/docs/${docPath}.md`;
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error('文档加载失败');
                return response.text();
            })
            .then(markdown => {
                try {
                    // 确保FCL的扩展处理先于marked执行
                    let processedMarkdown = markdown;
                    
                    // 首先处理自定义容器
                    if (window.fcl && typeof fcl.processCustomContainers === 'function') {
                        processedMarkdown = fcl.processCustomContainers(processedMarkdown);
                    }
                    
                    // 然后使用marked转换为HTML
                    let html = marked.parse(processedMarkdown);
                    
                    // 最后处理代码组
                    if (window.fcl && typeof fcl.processCodeGroups === 'function') {
                        html = fcl.processCodeGroups(html);
                    }
                    
                    // 更新文档容器
                    docsContainer.innerHTML = `<article class="docs-article">${html}</article>`;
                    
                    // 高亮代码块
                    if (window.hljs) {
                        document.querySelectorAll('.docs-article pre code').forEach(block => {
                            hljs.highlightElement(block);
                        });
                    }
                    
                    // 初始化代码组和可折叠容器
                    if (window.fcl) {
                        if (typeof fcl.initCodeGroups === 'function') {
                            fcl.initCodeGroups();
                        }
                        if (typeof fcl.initCollapsibleContainers === 'function') {
                            fcl.initCollapsibleContainers();
                        }
                    }
                    
                    // 更新标题
                    updateDocTitle(docPath);
                    
                    // 滚动到顶部
                    docsContainer.scrollTop = 0;
                    window.scrollTo(0, 0);
                } catch (error) {
                    console.error('解析Markdown时出错:', error);
                    docsContainer.innerHTML = `
                        <div class="error-message">
                            <h3>解析文档内容时出错</h3>
                            <p>${error.message}</p>
                            <p>请检查控制台以获取更多信息。</p>
                        </div>`;
                }
            })
            .catch(error => {
                console.error('加载文档时出错:', error);
                docsContainer.innerHTML = `
                    <div class="error-message">
                        <h3>无法加载文档</h3>
                        <p>${error.message}</p>
                        <p>请确保文档路径正确，并刷新页面重试。</p>
                    </div>`;
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
    
    // 修改处理响应式布局的函数
    function handleResponsiveLayout() {
        const mobileToggle = document.querySelector('.docs-nav-toggle');
        const docsNav = document.querySelector('.docs-nav');
        
        // 根据窗口宽度调整界面
        if (window.innerWidth <= 768) {
            // 移动视图 - 确保按钮显示
            if (mobileToggle) {
                mobileToggle.style.display = 'block';
            }
            
            // 初始化为关闭状态（除非已被用户打开）
            if (docsNav && !docsNav.classList.contains('active')) {
                docsNav.style.display = 'none';
            }
        } else {
            // 桌面视图 - 隐藏按钮，确保导航显示
            if (mobileToggle) {
                mobileToggle.style.display = 'none';
            }
            
            if (docsNav) {
                docsNav.style.display = 'block';
                // 移除可能的active类防止样式冲突
                docsNav.classList.remove('processed');
            }
        }
    }
    
    // 修改移动导航按钮添加函数
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
            
            // 更新显示状态
            if (docsNavElement.classList.contains('active')) {
                docsNavElement.style.display = 'block';
            } else {
                docsNavElement.style.display = 'none';
            }
            
            this.classList.toggle('active');
        });
        
        // 立即应用响应式布局
        handleResponsiveLayout();
    }
    
    // 初始加载文档数据
    loadDocsData();
    
    // 处理浏览器前进/后退按钮
    window.addEventListener('popstate', function() {
        currentDocPath = getDocPathFromUrl();
        loadDoc(currentDocPath);
        highlightActiveDoc(currentDocPath);
    });
    
    // 添加窗口大小调整监听器
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
    });

    // 确保在DOMContentLoaded事件中进行初始处理
    setTimeout(handleResponsiveLayout, 100);

    // 调试辅助函数 - 在控制台中查看处理过程
    window.debugFCLMarkdown = function(docPath) {
        fetch(`data/docs/${docPath}.md`)
            .then(response => response.text())
            .then(markdown => {
                console.group('FCL Markdown 调试');
                console.log("原始Markdown:");
                console.log(markdown);
                
                if (window.fcl) {
                    console.log("\n处理自定义容器:");
                    try {
                        const containers = fcl.processCustomContainers(markdown);
                        console.log(containers);
                        
                        console.log("\n处理代码组容器:");
                        const codeGroups = fcl.processCodeGroupContainers(containers);
                        console.log(codeGroups);
                        
                        console.log("\nMarked 转换后:");
                        const html = marked.parse(codeGroups);
                        console.log(html);
                        
                        console.log("\n代码组处理后:");
                        const processed = fcl.processCodeGroups(html);
                        console.log(processed);
                    } catch (e) {
                        console.error("处理过程中出错:", e);
                    }
                } else {
                    console.warn("FCL 扩展对象未定义");
                }
                console.groupEnd();
            })
            .catch(err => console.error("获取文档出错", err));
    };

    // 添加调试按钮
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const container = document.querySelector('.docs-content .container');
        if (container) {
            const debugBtn = document.createElement('button');
            debugBtn.textContent = '调试当前文档';
            debugBtn.className = 'debug-button';
            debugBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:1000;padding:10px;background:#f06292;color:white;border:none;border-radius:4px;cursor:pointer;';
            
            debugBtn.addEventListener('click', function() {
                const docPath = new URLSearchParams(window.location.search).get('doc') || 'getting-started/introduction';
                window.debugFCLMarkdown(docPath);
                alert(`正在调试文档: ${docPath}\n请查看控制台输出`);
            });
            
            document.body.appendChild(debugBtn);
        }
    }
}); 