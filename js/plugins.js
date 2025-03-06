document.addEventListener('DOMContentLoaded', function() {
    const pluginsContainer = document.getElementById('plugins-container');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('plugin-search');
    const loadMoreBtn = document.getElementById('load-more');
    
    let pluginsData = [];
    let displayedPlugins = 6;
    const pluginsPerPage = 6;
    
    // 从JSON文件加载插件数据
    fetch('data/plugins.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            // 保存数据
            pluginsData = data.plugins;
            
            // 初始化分类选项
            initCategories(data.categories);
            
            // 初始渲染插件
            renderPlugins(pluginsData);
        })
        .catch(error => {
            console.error('获取插件数据时出错:', error);
            pluginsContainer.innerHTML = '<div class="error-message">加载插件数据失败，请刷新页面重试</div>';
        });
    
    // 初始化分类选项
    function initCategories(categories) {
        if (!categories || !categoryFilter) return;
        
        categoryFilter.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
    
    // 渲染插件卡片
    function renderPlugins(plugins) {
        pluginsContainer.innerHTML = '';
        
        if (plugins.length === 0) {
            pluginsContainer.innerHTML = '<div class="no-results">没有找到匹配的插件</div>';
            return;
        }
        
        plugins.slice(0, displayedPlugins).forEach(plugin => {
            const pluginCard = document.createElement('div');
            pluginCard.className = 'plugin-card';
            
            pluginCard.innerHTML = `
                <div class="plugin-image">
                    <img src="${plugin.image || 'images/plugins/default.jpg'}" alt="${plugin.title}">
                </div>
                <div class="plugin-info">
                    <div class="plugin-title">${plugin.title}</div>
                    <div class="plugin-description">${plugin.description}</div>
                    <div class="plugin-meta">
                        <span class="plugin-version">版本: ${plugin.version}</span>
                        <span class="plugin-type">类型: ${plugin.type}</span>
                    </div>
                    <div class="plugin-download">
                        <span class="plugin-download-count">下载量: ${plugin.downloads.toLocaleString()}</span>
                        <a href="${plugin.directDownloadUrl}" class="btn btn-secondary btn-sm" download>下载</a>
                        <a href="${plugin.alternativeDownloadUrl}" class="btn btn-secondary btn-sm">123云盘</a>
                    </div>
                </div>
            `;
            
            pluginsContainer.appendChild(pluginCard);
        });
        
        // 是否显示"加载更多"按钮
        if (plugins.length <= displayedPlugins) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }
    
    // 过滤插件
    function filterPlugins() {
        const category = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        return pluginsData.filter(plugin => {
            const categoryMatch = category === 'all' || plugin.category === category;
            const searchMatch = plugin.title.toLowerCase().includes(searchTerm) || 
                               plugin.description.toLowerCase().includes(searchTerm);
            
            return categoryMatch && searchMatch;
        });
    }
    
    // 更新显示的插件
    function updatePlugins() {
        const filteredPlugins = filterPlugins();
        renderPlugins(filteredPlugins);
    }
    
    // 添加事件监听器
    categoryFilter.addEventListener('change', updatePlugins);
    searchInput.addEventListener('input', updatePlugins);
    
    // 加载更多按钮
    loadMoreBtn.addEventListener('click', function() {
        displayedPlugins += pluginsPerPage;
        updatePlugins();
    });
}); 