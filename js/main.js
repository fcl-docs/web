document.addEventListener('DOMContentLoaded', function() {
    // 处理移动菜单交互
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    
    // 修改遮罩层的创建和插入逻辑
    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        // 将遮罩层插入到body中，而不是导航之后
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭菜单，但不阻止事件冒泡
        overlay.addEventListener('click', function() {
            this.style.opacity = '0';
            
            // 关闭导航菜单
            const nav = document.querySelector('header nav');
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            
            // 短暂延迟后移除类
            setTimeout(() => {
                if (nav) nav.classList.remove('active');
                if (mobileMenuButton) mobileMenuButton.classList.remove('active');
                this.classList.remove('active');
                document.body.style.overflow = '';
            }, 280);
        });
    }
    
    // 修改菜单按钮点击事件
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const overlay = document.querySelector('.overlay');
            
            if (nav.classList.contains('active')) {
                // 关闭菜单 - 先淡出遮罩
                if (overlay) overlay.style.opacity = '0';
                
                // 短暂延迟后移除类
                setTimeout(() => {
                    nav.classList.remove('active');
                    this.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }, 280);
                
            } else {
                // 打开菜单 - 先添加活动类
                nav.classList.add('active');
                this.classList.add('active');
                
                // 然后激活遮罩层
                if (overlay) {
                    overlay.classList.add('active');
                    setTimeout(() => {
                        overlay.style.opacity = '1';
                    }, 20);
                }
                
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // 当窗口大小改变时处理导航状态
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // 在桌面视图中重置导航状态
            nav.classList.remove('active');
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.classList.remove('active');
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