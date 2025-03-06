document.addEventListener('DOMContentLoaded', function() {
    const versionContentsContainer = document.getElementById('version-contents');
    const tabsContainer = document.querySelector('.version-tabs');
    const downloadSourceSelect = document.getElementById('download-source');
    const downloadLink = document.getElementById('download-link');
    
    let activeVersion = 'all'; // 默认选中的版本
    
    // 从JSON文件加载下载数据
    fetch('data/downloads.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            // 保存数据到变量
            window.downloadData = data;
            
            // 初始化版本标签
            initVersionTabs(data);
            
            // 初始化版本内容
            initVersionContents(data);
            
            // 初始化下载源选项
            initDownloadSources(data);
            
            // 初始化更新日志
            initChangelog(data);
            
            // 初始化下载链接
            updateDownloadLink();
        })
        .catch(error => {
            console.error('获取下载数据时出错:', error);
            showError(versionContentsContainer, '加载下载数据失败，请刷新页面重试');
        });
    
    // 初始化版本标签
    function initVersionTabs(data) {
        tabsContainer.innerHTML = '';
        
        // 创建版本标签
        Object.entries(data.versions).forEach(([versionKey, versionInfo], index) => {
            const tab = document.createElement('button');
            tab.className = `version-tab ${versionKey === activeVersion ? 'active' : ''}`;
            tab.setAttribute('data-version', versionKey);
            tab.textContent = versionInfo.title;
            
            tab.addEventListener('click', () => {
                // 移除所有tab的active类
                document.querySelectorAll('.version-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // 添加当前点击的tab的active类
                tab.classList.add('active');
                
                // 更新激活的版本
                activeVersion = versionKey;
                
                // 更新版本内容显示
                updateVersionContentDisplay();
                
                // 更新下载链接
                updateDownloadLink();
            });
            
            tabsContainer.appendChild(tab);
        });
    }
    
    // 初始化版本内容
    function initVersionContents(data) {
        versionContentsContainer.innerHTML = '';
        
        // 创建版本内容
        Object.entries(data.versions).forEach(([versionKey, versionInfo]) => {
            const contentDiv = document.createElement('div');
            contentDiv.className = `version-content ${versionKey === activeVersion ? 'active' : ''}`;
            contentDiv.id = `${versionKey}-version`;
            
            contentDiv.innerHTML = `
                <div class="version-info">
                    <h3>${versionInfo.title} (${versionInfo.description})</h3>
                    <p>当前版本：${versionInfo.version}</p>
                    <p>发布日期：${versionInfo.date}</p>
                    <p>文件大小：${versionInfo.size}</p>
                    <p>适用于：${versionInfo.compatibility}</p>
                </div>
            `;
            
            versionContentsContainer.appendChild(contentDiv);
        });
    }
    
    // 更新版本内容显示
    function updateVersionContentDisplay() {
        // 隐藏所有内容
        document.querySelectorAll('.version-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 显示当前选中的版本内容
        const activeContent = document.getElementById(`${activeVersion}-version`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }
    
    // 初始化下载源选项
    function initDownloadSources(data) {
        downloadSourceSelect.innerHTML = '';
        for (const [sourceKey, sourceInfo] of Object.entries(data.sources)) {
            const option = document.createElement('option');
            option.value = sourceKey;
            option.textContent = sourceInfo.name;
            downloadSourceSelect.appendChild(option);
        }
    }
    
    // 初始化更新日志
    function initChangelog(data) {
        const changelogList = document.querySelector('.changelog-list');
        if (changelogList && data.changelog) {
            changelogList.innerHTML = '';
            data.changelog.forEach(release => {
                const changelogItem = document.createElement('div');
                changelogItem.className = 'changelog-item';
                
                let changesHtml = '';
                release.changes.forEach(change => {
                    changesHtml += `<li>${change}</li>`;
                });
                
                changelogItem.innerHTML = `
                    <div class="version">${release.version}</div>
                    <div class="date">${release.date}</div>
                    <ul>${changesHtml}</ul>
                `;
                
                changelogList.appendChild(changelogItem);
            });
        }
    }
    
    // 更新下载链接
    function updateDownloadLink() {
        if (!window.downloadData) return;
        
        const source = downloadSourceSelect.value;
        
        // 设置下载链接
        const sourceData = window.downloadData.sources[source];
        if (sourceData && sourceData.urls[activeVersion]) {
            downloadLink.href = sourceData.urls[activeVersion];
        }
    }
    
    // 当下载源改变时更新下载链接
    downloadSourceSelect.addEventListener('change', updateDownloadLink);
    
    // 错误显示函数
    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (element) {
            element.innerHTML = '';
            element.appendChild(errorDiv);
        } else {
            console.error(message);
        }
    }
}); 