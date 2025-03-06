document.addEventListener('DOMContentLoaded', function() {
    // 为移动设备添加菜单切换功能
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    
    // 仅在移动视图下添加菜单按钮
    if (window.innerWidth <= 768) {
        // 防止重复创建按钮
        if (!document.querySelector('.mobile-menu-button')) {
            // 创建移动菜单按钮
            const mobileMenuButton = document.createElement('button');
            mobileMenuButton.className = 'mobile-menu-button';
            mobileMenuButton.innerHTML = '☰';
            mobileMenuButton.setAttribute('aria-label', '菜单');
            
            // 将按钮插入到header容器的前部
            const headerContainer = header.querySelector('.container');
            headerContainer.insertBefore(mobileMenuButton, headerContainer.firstChild);
            
            // 创建遮罩层
            if (!document.querySelector('.overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                document.body.appendChild(overlay);
                
                // 点击遮罩层关闭菜单
                overlay.addEventListener('click', function() {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
            
            // 添加点击事件
            mobileMenuButton.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                nav.classList.toggle('active');
                document.querySelector('.overlay').classList.toggle('active');
                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            });
        }
    }
    
    // 当窗口大小改变时重新评估
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            // 移动视图 - 如果没有按钮，添加按钮
            if (!document.querySelector('.mobile-menu-button')) {
                const button = document.createElement('button');
                button.className = 'mobile-menu-button';
                button.innerHTML = '☰';
                button.setAttribute('aria-label', '菜单');
                
                const headerContainer = header.querySelector('.container');
                headerContainer.insertBefore(button, headerContainer.firstChild);
                
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    nav.classList.toggle('active');
                    document.querySelector('.overlay').classList.toggle('active');
                    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
                });
            }
        } else {
            // 桌面视图 - 移除按钮并重置导航
            const mobileButton = document.querySelector('.mobile-menu-button');
            if (mobileButton) {
                mobileButton.remove();
            }
            
            // 确保导航可见并重置状态
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
}); 