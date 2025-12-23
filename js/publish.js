// ================= 图片预览 =================
const imageInput = document.getElementById('image');
const previewImg = document.getElementById('preview');

let imageBase64 = '';

if (imageInput) {
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            imageBase64 = e.target.result;
            previewImg.src = imageBase64;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

// ================= 发布商品 =================
function publish() {
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const condition = document.getElementById('condition').value;

    // 校验
    if (!title || !price || !contact || !desc) {
        alert('请填写完整商品信息');
        return;
    }

    if (!condition) {
        alert('请选择商品成色');
        return;
    }

    if (!imageBase64) {
        alert('请上传商品图片');
        return;
    }

    // 读取已有用户商品
    const goods = JSON.parse(localStorage.getItem('user_goods')) || [];

    // 新商品对象
    const newGoods = {
        id: 'u_' + Date.now(),
        title,
        price,
        originalPrice: price,
        description: desc,
        image: imageBase64,
        category: '用户发布',
        condition: condition,   // ⭐ 使用真实成色
        sellerName: '我发布的',
        sellerAvatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        contact: contact,
        createTime: Date.now()
    };

    goods.unshift(newGoods);

    localStorage.setItem('user_goods', JSON.stringify(goods));

    alert('发布成功！');
    window.location.href = '../index.html';
}
