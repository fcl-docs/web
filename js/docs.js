document.addEventListener('DOMContentLoaded', function() {
    const docsNav = document.getElementById('docs-nav');
    const docsContainer = document.getElementById('docs-container');
    const searchInput = document.getElementById('docs-search-input');
    
    let docsData = null;
    let currentDocPath = '';
    
    // 配置 marked 选项
    marked.setOptions({
        headerIds: true,     // 启用标题ID
        gfm: true,           // 启用GitHub风格Markdown
        breaks: false,       // 不将换行符转换为<br>
        pedantic: false,     // 非严格模式
        mangle: false,       // 不转义HTML
        sanitize: false,     // 不净化HTML输入
        smartLists: true,    // 使用智能列表
        smartypants: false,  // 不使用智能标点
        xhtml: false,        // 不使用XHTML
        highlight: function(code, lang) {
            // 代码高亮
            if (window.hljs && lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {}
            }
            return code; 
        }
    });
    
    // 从URL获取文档路径，简化版本
    function getDocPathFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('doc') || '';  // 如果没有查询参数，返回空字符串
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
            .then(response => response.json())
            .then(data => {
                docsData = data;
                renderDocsNav(data);
                
                // 默认文档路径 - 硬编码为安装指南
                const defaultDocPath = 'getting-started/installation';
                
                // 获取URL中的文档路径，如果没有则使用默认值
                currentDocPath = getDocPathFromUrl() || defaultDocPath;
                
                // 确保URL包含文档路径
                if (!window.location.search) {
                    history.replaceState(null, '', `docs.html?doc=${defaultDocPath}`);
                }
                
                // 立即加载文档内容
                loadDoc(currentDocPath);
                highlightActiveDoc(currentDocPath);
            })
            .catch(error => {
                console.error('加载文档数据时出错:', error);
                docsContainer.innerHTML = '<div class="error-message"><h2>加载文档失败</h2><p>请检查您的网络连接或稍后再试。</p></div>';
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
        
        console.log(`加载文档: ${docPath}`);
        const filePath = `data/docs/${docPath}.md`;
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error('文档加载失败');
                return response.text();
            })
            .then(markdown => {
                try {
                    console.log(`文档 ${docPath} 加载成功，内容长度: ${markdown.length}`);
                    
                    // 保存原始Markdown用于调试
                    window.currentDocMarkdown = markdown;
                    
                    let html;
                    
                    try {
                        // 使用fcl处理管道
                        if (window.fcl && typeof fcl.processMarkdown === 'function') {
                            console.log('使用FCL处理管道渲染Markdown');
                            html = fcl.processMarkdown(markdown);
                        } else {
                            console.warn('FCL处理管道不可用，使用基本marked处理');
                            html = marked.parse(markdown);
                        }
                        
                        // 显示处理结果
                        console.log('Markdown处理结果长度:', html.length);
                    } catch (processError) {
                        console.error('处理Markdown时出错:', processError);
                        html = `<div class="error-message">
                            <h3>处理Markdown时出错</h3>
                            <p>${processError.message}</p>
                        </div>`;
                    }
                    
                    // 更新DOM
                    docsContainer.innerHTML = `${html}`;
                    console.log('DOM已更新');
                    
                    // 高亮代码块
                    if (window.hljs) {
                        document.querySelectorAll('.docs-article pre code').forEach(block => {
                            hljs.highlightElement(block);
                        });
                        console.log('代码高亮处理完成');
                    }
                    
                    // 初始化交互元素
                    if (window.fcl) {
                        if (typeof fcl.initCodeGroups === 'function') {
                            console.log('初始化代码组交互');
                            fcl.initCodeGroups();
                        }
                        if (typeof fcl.initCollapsibleContainers === 'function') {
                            console.log('初始化折叠容器');
                            fcl.initCollapsibleContainers();
                        }
                    }
                    
                    // 页面状态更新
                    updateDocTitle(docPath);
                    docsContainer.scrollTop = 0;
                    window.scrollTo(0, 0);
                    
                } catch (error) {
                    console.error('处理文档时出错:', error);
                    docsContainer.innerHTML = `<div class="error-message">
                        <h3>处理文档内容时出错</h3>
                        <p>${error.message}</p>
                        <p>请检查控制台获取更多信息</p>
                    </div>`;
                }
            })
            .catch(error => {
                console.error('获取文档时出错:', error);
                docsContainer.innerHTML = `<div class="error-message">
                    <h3>无法加载文档</h3>
                    <p>${error.message}</p>
                    <p>请确保文档路径正确并刷新页面</p>
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
        
        // 输出调试信息
        console.log('处理响应式布局', {
            windowWidth: window.innerWidth,
            mobileToggleExists: !!mobileToggle,
            docsNavExists: !!docsNav
        });
        
        // 根据窗口宽度调整界面
        if (window.innerWidth <= 768) {
            // 移动视图 - 确保按钮显示
            if (mobileToggle) {
                mobileToggle.style.display = 'block';
            } else {
                // 如果按钮不存在，尝试重新添加
                setTimeout(addMobileNavToggle, 100);
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
                docsNav.classList.remove('active');
            }
        }
    }
    
    // 添加移动端导航切换按钮函数
    function addMobileNavToggle() {
        const docsNavContainer = document.querySelector('.docs-sidebar');
        const navToggleBtn = document.createElement('button');
        navToggleBtn.className = 'docs-nav-toggle';
        navToggleBtn.innerHTML = '文档目录 ';
        navToggleBtn.setAttribute('aria-label', '切换文档导航');
        
        navToggleBtn.addEventListener('click', function() {
            docsNav.classList.toggle('active');
            this.classList.toggle('active');
            const span = this.querySelector('span');
            if (span) {
                span.textContent = docsNav.classList.contains('active') ? '▲' : '▼';
            }
        });
        
        // 将按钮插入到导航之前
        docsNavContainer.insertBefore(navToggleBtn, docsNav);
    }
    
    // 修复移动菜单初始化函数
    function setupMobileMenuButton() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mainNav = document.querySelector('header nav');
        
        if (mobileMenuButton && mainNav) {
            console.log('找到移动菜单按钮和导航栏');
            
            // 确保在桌面视图中导航栏显示
            if (window.innerWidth > 768) {
                mainNav.style.display = 'block';
            } else {
                // 移动视图下默认隐藏导航
                mainNav.style.display = 'none';
            }
            
            // 添加点击事件
            mobileMenuButton.addEventListener('click', function() {
                console.log('菜单按钮被点击');
                
                // 切换导航显示状态
                if (mainNav.style.display === 'none' || !mainNav.classList.contains('active')) {
                    mainNav.style.display = 'block';
                    mainNav.classList.add('active');
                    this.classList.add('active');
                } else {
                    mainNav.style.display = 'none';
                    mainNav.classList.remove('active');
                    this.classList.remove('active');
                }
            });
            
            console.log('移动菜单按钮事件已绑定');
        } else {
            console.warn('未找到移动菜单按钮或导航栏元素');
        }
    }
    
    // 初始加载文档数据
    loadDocsData();
    
    // 设置移动菜单按钮
    setupMobileMenuButton();
    
    // 处理浏览器前进/后退按钮
    window.addEventListener('popstate', function() {
        currentDocPath = getDocPathFromUrl();
        loadDoc(currentDocPath);
        highlightActiveDoc(currentDocPath);
    });
    
    // 确保在DOMContentLoaded事件中进行初始处理
    setTimeout(handleResponsiveLayout, 100);
    
    // 在window.load事件后再次处理
    window.addEventListener('load', handleResponsiveLayout);
    
    // 确保窗口调整大小时能够正确响应
    let resizeTimeout;
    window.addEventListener('resize', function() {
        // 使用防抖动处理
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResponsiveLayout, 100);
    });
}); 