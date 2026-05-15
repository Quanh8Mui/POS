const inventory = [
    { id: 1, name: "Gạo ST25", price: 185000, category: "Thực phẩm", stock: 15, image: "img/gao.jpg" },
    { id: 2, name: "Trứng(10 quả)", price: 35000, category: "Thực phẩm", stock: 40, image: "img/trung.jpg" },
    { id: 3, name: "Coca-cola", price: 10000, category: "Đồ uống", stock: 100, image: "img/coca.jpg" },
    { id: 4, name: "Tiger bạc", price: 25000, category: "Đồ uống", stock: 72, image: "img/tiger.jpg" },
    { id: 5, name: "Chảo chống dính", price: 250000, category: "Gia dụng", stock: 5, image: "img/chao.jpg" },
    { id: 6, name: "Dầu gội", price: 150000, category: "Mỹ phẩm", stock: 12, image: "img/daugoi.jpg" },
    { id: 7, name: "Kem đánh răng", price: 38000, category: "Mỹ phẩm", stock: 20, image: "img/kem.jpg" },
    { id: 8, name: "bánh Oreo", price: 28000, category: "Thực phẩm", stock: 120, image: "img/oreo.jpg" }
];

let currentCart = [];
let discountPercent = 0;
function checkAuth() {

    const savedUser = JSON.parse(localStorage.getItem('currentUser'));

    const authBtns = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-text');
const userPointsDisplay = document.getElementById('user-points'); 

    if (savedUser) {
        if (userNameDisplay) userNameDisplay.innerText = savedUser.name;
        if (userPointsDisplay) userPointsDisplay.innerText = savedUser.points || 0;
    }
    if (savedUser) {
        authBtns.classList.add('d-none');
        userMenu.classList.remove('d-none');

        if (userNameDisplay) {
            userNameDisplay.innerText = savedUser.name;
        }
    } else {
        authBtns.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}
checkAuth();
function logout() {
    localStorage.removeItem('currentUser');
    alert("Đã đăng xuất!");
    window.location.reload();
}

function xuLyDoiMatKhau() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    if (oldPass === currentUser.pass) {
        allUsers = allUsers.map(u => {
            if (u.phone === currentUser.phone) {
                u.pass = newPass;
            }
            return u;
        });
        currentUser.pass = newPass;
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert("Đổi mật khẩu thành công!");
        location.reload();
    } else {
        alert("Mật khẩu cũ không đúng!");
    }
}
function showHistory() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const historyBody = document.getElementById('history-content');

    if (!historyBody) return;

    if (!savedUser) {
        historyBody.innerHTML = '<tr><td colspan="3" class="text-center">Vui lòng đăng nhập để xem lịch sử!</td></tr>';
        return;
    }

    const historyKey = 'history_' + savedUser.phone;
    const userHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

    if (userHistory.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="3" class="text-center">Bạn chưa có đơn hàng nào.</td></tr>';
        return;
    }

    historyBody.innerHTML = userHistory.map(h => `
        <tr>
            <td style="font-size: 0.85rem">${h.date}</td>
            <td>${h.items}</td>
            <td class="text-primary fw-bold text-end">${h.total}</td>
        </tr>
    `).join('');
}
function renderProducts(data = inventory) {
    const display = document.getElementById('product-display');
    if (data.length === 0) {
        display.innerHTML = '<div class="col-12 text-center mt-5 text-muted">Không tìm thấy sản phẩm nào!</div>';
        return;
    }

    display.innerHTML = data.map(item => `
        <div class="col-md-4 mb-4">
            <div class="card product-card p-2 h-100" onclick="addItem(${item.id})">
                <img src="${item.image}" class="card-img-top p-2" alt="${item.name}" style="height: 150px; object-fit: contain;">
                
                <div class="card-body p-2 text-center">
                    <span class="badge bg-light text-dark mb-2 small border">${item.category}</span>
                    <h6 class="fw-bold mb-1" style="font-size: 0.9rem;">${item.name}</h6>
                    <div class="text-primary fw-bold mb-2">${item.price.toLocaleString()}đ</div>
                    <small class="text-muted">Kho: ${item.stock}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function searchProduct() {
    const keyword = document.getElementById('search-box').value.toLowerCase();
    const filtered = inventory.filter(p => p.name.toLowerCase().includes(keyword));
    renderProducts(filtered);
}

function filterData(category, element) {
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const filtered = category === 'Tất cả' ? inventory : inventory.filter(i => i.category === category);
    renderProducts(filtered);
}

function addItem(id) {
    const product = inventory.find(i => i.id === id);
    if (product.stock > 0) {
        currentCart.push({ ...product });
        product.stock--;
        const currentCategory = document.querySelector('.category-item.active').innerText;
        renderProducts(currentCategory === 'Tất cả sản phẩm' ? inventory : inventory.filter(i => i.category === currentCategory));

        updateCartUI();
    } else {
        alert("Sản phẩm này đã hết hàng!");
    }
}

function ApplyDiscount() {
    const code = document.getElementById('discount-code').value.toUpperCase();
    const discountRow = document.getElementById('discount-row');

    if (code == "GIAM10") {
        discountPercent = 0.1;
        discountRow.classList.replace('d-none', 'd-flex');
        alert("Đã áp dụng mã giảm giá 10%!");
    } else {
        discountPercent = 0;
        discountRow.classList.replace('d-flex', 'd-none');
        alert("Mã không hợp lệ!");
    }
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-list');

    if (currentCart.length === 0) {
        cartList.innerHTML = '<p class="text-center text-muted mt-5">Giỏ hàng trống!</p>';
        document.getElementById('sub-total').innerText = '0đ';
        document.getElementById('total-price').innerText = '0đ';
        return;
    }
    cartList.innerHTML = currentCart.map(item => `
        <div class="d-flex justify-content-between border-bottom py-2 small">
            <span>${item.name}</span>
            <span class="fw-bold">${item.price.toLocaleString()}đ</span>
        </div>
    `).join('');
    const subTotal = currentCart.reduce((sum, item) => sum + item.price, 0);
    const moneyReduced = subTotal * discountPercent;
    const finalTotal = subTotal - moneyReduced;
    document.getElementById('sub-total').innerText = subTotal.toLocaleString() + 'đ';
    document.getElementById('discount-amount').innerText = '-' + moneyReduced.toLocaleString() + 'đ';
    document.getElementById('total-price').innerText = finalTotal.toLocaleString() + 'đ';
}

function processPay() {
    const phone = document.getElementById('cus-phone').value;
    if (currentCart.length === 0) return alert("Giỏ hàng đang trống!");

    const finalTotal = currentCart.reduce((sum, item) => sum + item.price, 0) * (1 - discountPercent);
    const points = Math.floor(finalTotal / 10000);

    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {    
        savedUser.points = (savedUser.points || 0) + points;
        localStorage.setItem('currentUser', JSON.stringify(savedUser));

        let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
        allUsers = allUsers.map(u => {
            if (u.phone === savedUser.phone) u.points = savedUser.points;
            return u;
        });
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        const tenSanPham = currentCart.map(item => item.name).join(", ");
        const newOrder = {
            date: new Date().toLocaleString('vi-VN'),
            items: tenSanPham,
            total: finalTotal.toLocaleString() + "đ"
        };
        const historyKey = 'history_' + savedUser.phone;
        let userHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        userHistory.unshift(newOrder);
        localStorage.setItem(historyKey, JSON.stringify(userHistory));
        const userPointsDisplay = document.getElementById('user-points');
        if (userPointsDisplay) userPointsDisplay.innerText = savedUser.points;
    }
    alert(`XÁC NHẬN THANH TOÁN
--------------------------
Khách hàng: ${phone || "Khách lẻ"}
Tổng tiền: ${finalTotal.toLocaleString()}đ
Điểm tích lũy: +${points} điểm
--------------------------
Giao dịch thành công!`);

    currentCart = [];
    discountPercent = 0;
    document.getElementById('discount-code').value = '';
    const discountRow = document.getElementById('discount-row');
    if(discountRow) discountRow.classList.replace('d-flex', 'd-none');
    
    updateCartUI();
    renderProducts();
}