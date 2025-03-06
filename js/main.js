document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const headerNav = document.querySelector('header nav');
    
    // 创建专用遮罩层（如果不存在）
    if (!document.querySelector('.menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99; opacity:1;';
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', function() {
            headerNav.classList.remove('active');
            this.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    
    // 为菜单按钮添加点击事件
    if (mobileMenuButton && headerNav) {
        // 清除可能存在的旧事件监听器
        const newButton = mobileMenuButton.cloneNode(true);
        mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);
        
        // 添加新的事件处理
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const overlay = document.querySelector('.menu-overlay');
            
            if (headerNav.classList.contains('active')) {
                headerNav.classList.remove('active');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            } else {
                headerNav.classList.add('active');
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // 处理窗口大小变化
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // 桌面视图中重置菜单状态
            if (headerNav) headerNav.classList.remove('active');
            const overlay = document.querySelector('.menu-overlay');
            if (overlay) overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // 平滑滚动功能
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 图片延迟加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // 回退方案
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
    
    // 添加导航关闭按钮
    addNavCloseButton();
});

// 添加导航关闭按钮
function addNavCloseButton() {
    const nav = document.querySelector('header nav');
    
    // 如果已存在关闭按钮，不再添加
    if (document.querySelector('.nav-close-button')) {
        return;
    }
    
    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'nav-close-button';
    closeButton.innerHTML = '✕';
    closeButton.setAttribute('aria-label', '关闭菜单');
    
    // 添加到导航菜单
    nav.appendChild(closeButton);
    
    // 添加点击事件
    closeButton.addEventListener('click', function() {
        const overlay = document.querySelector('.overlay');
        
        if (overlay) overlay.style.opacity = '0';
        
        // 短暂延迟后移除类
        setTimeout(() => {
            nav.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }, 280);
    });
} 