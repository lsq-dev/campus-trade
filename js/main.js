// main.js - 原生 JavaScript 核心逻辑

/**
 * 1. 路径处理工具
 * 识别当前是在根目录 (index.html) 还是在 pages/ 目录下，
 * 从而返回正确的资源引用前缀。
 */
const getPathPrefix = () => {
    // 检查 URL 是否包含 '/pages/'
    return window.location.pathname.includes('/pages/') ? '../' : './';
};

// 数据文件路径
const DATA_URL = getPathPrefix() + 'data.json';

/**
 * 2. 动态渲染 Header 和 Footer
 * 确保所有页面导航栏一致，且高亮当前页面。
 */
function initLayout() {
    const prefix = getPathPrefix();
    const user = JSON.parse(localStorage.getItem('campus_user'));

    // 渲染 Header
    const headerEl = document.querySelector('header');
    if (headerEl) {
        headerEl.innerHTML = `
        <div class="container nav-content">
            <a href="${prefix}index.html" class="logo">
                <div class="logo-icon">🛒</div>
                <span>校园二手</span>
            </a>
            <nav class="nav">
                <a href="${prefix}index.html">首页</a>
                <a href="${prefix}pages/list.html">二手市场</a>
                <a href="${prefix}pages/publish.html" onclick="return checkLogin()">发布商品</a>

            </nav>

            <div class="auth-buttons">
                ${user ?
                `<span>Hi, ${user.name}</span>
                     <button onclick="logout()" style="color:red;font-size:14px;">退出</button>` :
                `<a href="${prefix}pages/login.html" class="btn-login">登录</a>
                     <a href="${prefix}pages/register.html" class="btn-register">注册</a>`
            }
            </div>
        </div>
        `;

        // 高亮当前菜单
        const currentPath = window.location.pathname;
        const links = headerEl.querySelectorAll('.nav a');
        links.forEach(link => {
            const href = link.getAttribute('href').replace('../', '').replace('./', '');
            // 简单匹配：如果当前 URL 包含链接的 href 文件名
            if (href && currentPath.includes(href)) {
                link.classList.add('active');
            } else if (currentPath.endsWith('/') && href === 'index.html') {
                // 处理根路径情况
                link.classList.add('active');
            }
        });
    }

    // 渲染 Footer
    const footerEl = document.querySelector('footer');
    if (footerEl) {
        footerEl.innerHTML = `
        <div class="container">
            <p>© 2025 校园二手交易平台. 专为高校学生打造的闲置交易平台。</p>
            <div style="margin-top: 10px; opacity: 0.7;">
                <a href="#">关于我们</a> | <a href="#">安全中心</a> | <a href="#">联系客服</a>
            </div>
        </div>
        `;
    }
}

/**
 * 3. 异步获取数据 (Fetch API)
 */
async function fetchProducts() {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Network error");

        // 原始商品（data.json）
        let data = await response.json();

        // ===== 新增：加载用户发布的商品 =====
        const userGoods = JSON.parse(localStorage.getItem('user_goods')) || [];
        data = data.concat(userGoods);

        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
}

/**
 * 4. 生成商品卡片 HTML
 */
function createProductCard(product) {
    const prefix = getPathPrefix();
    return `
    <div class="product-card" onclick="window.location.href='${prefix}pages/detail.html?id=${product.id}'">
        <div class="card-img-wrapper">
            <img src="${product.image}" class="card-img" alt="${product.title}">
            <span class="card-category">${product.category}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${product.title}</h3>
            <div class="card-price">¥${product.price} <span>¥${product.originalPrice}</span></div>
            <div class="card-footer">
                <div class="seller-info">
                    <img src="${product.sellerAvatar}" class="seller-avatar">
                    <span>${product.sellerName}</span>
                </div>
                <span>${product.condition}</span>
            </div>
        </div>
    </div>
    `;
}

/**
 * 5. 原生轮播图逻辑 (不使用任何插件)
 */
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 创建指示点
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateDots() {
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    // 按钮事件
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

    // 自动播放
    setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 5000);
}

/**
 * 6. 全局功能 (登录/退出)
 */
window.logout = function () {
    localStorage.removeItem('campus_user');
    window.location.reload();
};

/**
 * 7. 页面入口逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
    initLayout();

    // --- 首页逻辑 ---
    if (document.getElementById('home-page')) {
        initCarousel();
        const container = document.getElementById('featured-products');
        const products = await fetchProducts();
        // 取前 4 个展示
        container.innerHTML = products.slice(0, 4).map(createProductCard).join('');
    }

    // --- 列表页逻辑 ---
    // --- 列表页逻辑 ---
if (document.getElementById('list-page')) {
    const container = document.getElementById('product-list');
    const filterSelect = document.getElementById('category-filter');
    const conditionSelect = document.getElementById('condition-filter');
    const products = await fetchProducts();

    // URL 参数分类（从首页跳转）
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('cat');

    if (urlCat && filterSelect) {
        filterSelect.value = urlCat;
    }

    const render = () => {
        const cat = filterSelect
            ? filterSelect.value
            : (urlCat || 'all');

        const cond = conditionSelect
            ? conditionSelect.value
            : 'all';

        let filtered = products;

        // 分类筛选
        if (cat !== 'all') {
            filtered = filtered.filter(p => p.category === cat);
        }

        // 成色筛选
        if (cond !== 'all') {
            filtered = filtered.filter(p => p.condition === cond);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:50px;color:#999;">
                    暂无符合条件的商品
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(createProductCard).join('');
        }
    };

    render();
    if (filterSelect) filterSelect.addEventListener('change', render);
    if (conditionSelect) conditionSelect.addEventListener('change', render);
}


    // --- 详情页逻辑 ---
    if (document.getElementById('detail-page')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const products = await fetchProducts();
        const product = products.find(p => p.id === id);

        if (product) {
            document.getElementById('detail-img').src = product.image;
            document.getElementById('detail-title').innerText = product.title;
            document.getElementById('detail-price').innerHTML = `¥${product.price} <span style="font-size:20px;color:#999;text-decoration:line-through;font-weight:normal">¥${product.originalPrice}</span>`;
            document.getElementById('detail-desc').innerText = product.description;
            document.getElementById('detail-seller').innerText = product.sellerName;
            document.getElementById('detail-cat').innerText = product.category;
            document.getElementById('detail-avatar').src = product.sellerAvatar;
        } else {
            document.querySelector('.detail-wrapper').innerHTML = '<h2>未找到该商品</h2>';
        }
    }

    // --- 登录逻辑 ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            // 简单模拟登录
            localStorage.setItem('campus_user', JSON.stringify({ name: username || '同学' }));
            const prefix = getPathPrefix();
            window.location.href = prefix + 'index.html';
        });
    }
});
// ===== 留言板功能 =====

// 从 URL 中获取商品 id
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// 加载留言
function loadComments() {
    const productId = getProductId();
    const commentList = document.getElementById('comment-list');
    if (!commentList) return;

    const comments = JSON.parse(
        localStorage.getItem('comments_' + productId)
    ) || [];

    commentList.innerHTML = '';
    comments.forEach(text => {
        const li = document.createElement('li');
        li.style.padding = '8px 0';
        li.textContent = text;
        commentList.appendChild(li);
    });
}

// 添加留言
function addComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) {
        alert('留言不能为空');
        return;
    }

    const productId = getProductId();
    const key = 'comments_' + productId;
    const comments = JSON.parse(localStorage.getItem(key)) || [];

    comments.push(text);
    localStorage.setItem(key, JSON.stringify(comments));

    input.value = '';
    loadComments();
}

function checkLogin() {
    const user = JSON.parse(localStorage.getItem('campus_user'));
    if (!user) {
        alert('请先登录后再发布商品');
        const prefix = getPathPrefix();
        window.location.href = prefix + 'pages/login.html';
        return false;
    }
    return true;
}

// 页面加载完成后自动加载留言
document.addEventListener('DOMContentLoaded', loadComments);
