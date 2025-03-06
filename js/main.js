document.addEventListener('DOMContentLoaded', function() {
    // 处理移动菜单交互
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    
    // 创建遮罩层（如果不存在）并添加到导航后面
    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        // 将遮罩层插入到导航之后
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(overlay, nav.nextSibling);
        } else {
            document.body.appendChild(overlay);
        }
        
        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', function() {
            this.style.opacity = '0';
            
            // 短暂延迟后移除类
            setTimeout(() => {
                nav.classList.remove('active');
                this.classList.remove('active');
                document.body.style.overflow = '';
            }, 280);
        });
    }
    
    // 菜单按钮点击事件
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const overlay = document.querySelector('.overlay');
            
            if (nav.classList.contains('active')) {
                // 关闭菜单 - 先淡出遮罩，同时收起菜单
                overlay.style.opacity = '0';
                
                // 短暂延迟后移除类
                setTimeout(() => {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }, 280); // 略短于过渡时间
                
            } else {
                // 打开菜单 - 先显示但透明
                overlay.classList.add('active');
                overlay.style.opacity = '0';
                document.body.style.overflow = 'hidden';
                
                // 添加微小延迟确保DOM更新
                setTimeout(() => {
                    nav.classList.add('active');
                    overlay.style.opacity = '1';
                }, 20);
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