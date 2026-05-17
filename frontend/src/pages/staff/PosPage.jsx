import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const guestCustomer = { id: null, full_name: 'Khách vãng lai', phone: '' };
const quickCategories = [
  { key: 'all', label: 'Tất cả' },
  { key: 'beverages', label: 'Đồ uống' },
  { key: 'snacks', label: 'Snack' },
  { key: 'household', label: 'Gia dụng' },
];

const categoryMatchers = {
  beverages: ['beverage', 'water', 'soda', 'juice', 'tea', 'coffee'],
  snacks: ['snack', 'chips', 'noodle', 'cake', 'biscuit', 'cracker'],
  household: ['household', 'detergent', 'shampoo', 'soap', 'cleaner'],
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function PosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(guestCustomer);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderMessage, setOrderMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [pricingPolicy, setPricingPolicy] = useState(null);
  const [globalPromotions, setGlobalPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState('');

  useEffect(() => {
    const load = async () => {
      const [productsRes, customersRes, meRes, policyResult, promotionsResult] = await Promise.allSettled([
        api.get('/catalog/products/'),
        api.get('/customers/'),
        api.get('/accounts/me/'),
        api.get('/sales/pricing-policies/active/'),
        api.get('/sales/promotions/active/'),
      ]);

      setProducts(productsRes.status === 'fulfilled' ? productsRes.value.data : []);
      setCustomers(customersRes.status === 'fulfilled' ? customersRes.value.data : []);
      setCurrentBranch(meRes.status === 'fulfilled' ? meRes.value.data.branch || null : null);
      setPricingPolicy(policyResult.status === 'fulfilled' ? policyResult.value.data : null);
      setGlobalPromotions(promotionsResult.status === 'fulfilled' ? promotionsResult.value.data : []);
      setSelectedPromotionId(policyResult.status === 'fulfilled' ? policyResult.value.data?.global_promotion || '' : '');
    };

    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) => {
      const productText = `${product.name} ${product.sku} ${product.unit}`.toLowerCase();
      const matchQuery = productText.includes(q);
      const matchCategory =
        activeCategory === 'all' ||
        categoryMatchers[activeCategory]?.some((keyword) => productText.includes(keyword));
      return matchQuery && matchCategory;
    });
  }, [products, query, activeCategory]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.toLowerCase();
    return customers.filter((customer) => customer.full_name.toLowerCase().includes(q) || (customer.phone || '').toLowerCase().includes(q));
  }, [customers, customerQuery]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.sale_price) * item.qty, 0);
  const promotion = globalPromotions.find((item) => String(item.id) === String(selectedPromotionId)) || null;
  const promotionDiscount = promotion
    ? (promotion.type === 'percent' ? subtotal * (Number(promotion.value) / 100) : Number(promotion.value))
    : 0;
  const vatRate = Number(pricingPolicy?.vat_rate || 0);
  const taxBase = Math.max(subtotal - promotionDiscount - Number(discountAmount), 0);
  const taxComputed = taxBase * (vatRate / 100);
  const total = Math.max(taxBase + taxComputed + Number(taxAmount), 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);

  const resetOrder = () => {
    setCart([]);
    setDiscountAmount(0);
    setTaxAmount(0);
    setPaymentMethod('cash');
    setSelectedCustomer(guestCustomer);
    setCustomerQuery('');
    setSelectedPromotionId(pricingPolicy?.global_promotion || '');
    setOrderMessage('');
    setShowPreview(false);
  };

  const handleCheckout = async () => {
    setOrderMessage('Đang thanh toán...');
    try {
      const payload = {
        order_code: `OD-${Date.now()}`,
        branch_id: currentBranch?.id || user?.branch || 1,
        cashier_id: user?.id || 1,
        customer_id: selectedCustomer?.id || null,
        promotion_id: selectedPromotionId || null,
        vat_rate: vatRate,
        payment_method: paymentMethod,
        discount_amount: Number(discountAmount) + Number(promotionDiscount),
        tax_amount: Number(taxComputed) + Number(taxAmount),
        total_amount: total,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
          unit_price: item.sale_price,
          discount_amount: 0,
        })),
      };
      await api.post('/sales/orders/create_sale/', payload);
      setOrderMessage('Thanh toán thành công. Hóa đơn đã được lưu.');
      resetOrder();
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Thanh toán thất bại';
      setOrderMessage(detail);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>POS</h2>
        </div>
        <span className="pill">{currentBranch?.name || 'Branch'} · {user?.full_name || 'Cashier'}</span>
      </div>

      <div className="pos-grid-top">
        <div className="card section-card pos-products-card">
          <div className="toolbar pos-toolbar">
            <input className="input" placeholder="Tìm sản phẩm theo tên hoặc SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="pill-row pos-category-row">
            {quickCategories.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`pill ${activeCategory === category.key ? '' : 'muted'}`}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="product-list pos-product-list">
            {filteredProducts.map((product) => (
              <div className="product-row pos-product-row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.sku} · {product.unit}</p>
                  <p className="pos-product-meta">Còn lại: <strong>{product.quantity_on_hand ?? 'N/A'}</strong></p>
                </div>
                <div className="pos-product-actions">
                  <span className={`pill ${Number(product.quantity_on_hand) <= Number(product.reorder_level || 0) ? '' : 'muted'}`}>
                    {formatMoney(product.sale_price)} đ
                  </span>
                  <button type="button" className="button primary" onClick={() => addToCart(product)}>Thêm</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card section-card pos-customer-card-right">
          <h3 className="section-title">Khách hàng</h3>
          <div className="compact-box">
            <div className="compact-box-header">
              <div>
                <h4>Chọn khách hàng</h4>
                <p>Chọn khách để tích điểm và lưu lịch sử mua hàng.</p>
              </div>
              <span className="pill muted">{selectedCustomer.full_name}</span>
            </div>
            <input className="input compact-input" placeholder="Tìm theo tên hoặc số điện thoại" value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} />
            <div className="compact-customer-list">
              {filteredCustomers.slice(0, 6).map((customer) => (
                <button type="button" className="compact-list-item" key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                  <div>
                    <strong>{customer.full_name}</strong>
                    <p>{customer.phone || 'Không có số điện thoại'}</p>
                  </div>
                  <span className="pill muted">Chọn</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card section-card pos-bottom-full">
        <div className="pos-bottom-header">
          <div>
            <h3 className="section-title">Items đã chọn</h3>
            <p>{totalQuantity} sản phẩm trong giỏ</p>
          </div>
          <span className="pill muted">{formatMoney(subtotal)} đ</span>
        </div>

        <div className="grid pos-bottom-grid">
          <div className="compact-box pos-payment-box">
            <div className="compact-box-header">
              <div>
                <h4>Thanh toán</h4>
                <p>Tổng tiền và thao tác thanh toán.</p>
              </div>
              <span className="pill muted">{paymentMethod.toUpperCase()}</span>
            </div>

            <div className="grid compact-order-grid">
              <div>
                <label className="field-label">Phương thức thanh toán</label>
                <select className="input compact-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Tiền mặt</option>
                  <option value="card">Thẻ</option>
                  <option value="mixed">Kết hợp</option>
                </select>
              </div>
              <div>
                <label className="field-label">Khuyến mãi toàn chuỗi</label>
                <select className="input compact-input" value={selectedPromotionId} onChange={(e) => setSelectedPromotionId(e.target.value)}>
                  <option value="">Không áp dụng</option>
                  {globalPromotions.map((promotionItem) => (
                    <option key={promotionItem.id} value={promotionItem.id}>{promotionItem.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Giảm giá thêm</label>
                <input className="input compact-input" type="number" min="0" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
              </div>
              <div>
                <label className="field-label">VAT ({vatRate}%)</label>
                <input className="input compact-input" type="number" min="0" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
              </div>
            </div>

            <div className="summary pos-summary">
              <div><span>Khách hàng</span><strong>{selectedCustomer.full_name}</strong></div>
              <div><span>Tổng tạm tính</span><strong>{formatMoney(subtotal)} đ</strong></div>
              <div><span>Khuyến mãi</span><strong>{formatMoney(promotionDiscount)} đ</strong></div>
              <div><span>Giảm giá thêm</span><strong>{formatMoney(discountAmount)} đ</strong></div>
              <div><span>VAT</span><strong>{formatMoney(taxComputed + Number(taxAmount))} đ</strong></div>
              <div className="total-highlight"><span>Tổng thanh toán</span><strong>{formatMoney(total)} đ</strong></div>
            </div>

            <div className="grid pos-action-group">
              <button type="button" className="button primary full button-checkout" onClick={() => setShowPreview(true)} disabled={cart.length === 0}>
                Xem trước hóa đơn
              </button>
              <button type="button" className="button secondary full button-checkout" onClick={handleCheckout} disabled={cart.length === 0}>
                Thanh toán
              </button>
              <button type="button" className="button ghost full" onClick={resetOrder}>Hủy đơn</button>
            </div>
          </div>

          <div className="compact-box pos-selected-box">
            <div className="compact-box-header">
              <div>
                <h4>Items đã chọn</h4>
                <p>{totalQuantity} sản phẩm trong giỏ</p>
              </div>
              <span className="pill muted">{formatMoney(subtotal)} đ</span>
            </div>

            <div className="cart-list pos-cart-list pos-cart-fullwidth">
              {cart.length === 0 && <p>Chưa có sản phẩm nào trong giỏ.</p>}
              {cart.map((item) => (
                <div className="cart-row pos-cart-row horizontal-cart-row" key={item.id}>
                  <div className="cart-left">
                    <strong>{item.name}</strong>
                    <p>{item.qty} x {formatMoney(item.sale_price)} đ</p>
                  </div>
                  <div className="cart-right">
                    <span className="pill muted">{formatMoney(item.sale_price * item.qty)} đ</span>
                    <div className="pill-row">
                      <button type="button" className="button ghost" onClick={() => updateQty(item.id, -1)}>-</button>
                      <span className="pill muted">{item.qty}</span>
                      <button type="button" className="button ghost" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {orderMessage && <p style={{ marginTop: 12 }}>{orderMessage}</p>}
      </div>

      {showPreview && (
        <div className="modal-backdrop" onClick={() => setShowPreview(false)} role="presentation">
          <div className="modal-card modal-preview" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h3>Preview hóa đơn</h3>
                <p>{selectedCustomer.full_name} · {currentBranch?.name || 'Branch'}</p>
              </div>
              <button className="button ghost" onClick={() => setShowPreview(false)}>Đóng</button>
            </div>

            <div className="summary" style={{ marginTop: 14 }}>
              <div><span>Mã hóa đơn</span><strong>OD-{Date.now().toString().slice(-6)}</strong></div>
              <div><span>Số lượng sản phẩm</span><strong>{totalQuantity}</strong></div>
              <div><span>Tổng thanh toán</span><strong>{formatMoney(total)} đ</strong></div>
            </div>

            <div className="table-lite modal-item-list">
              {cart.map((item) => (
                <div className="cart-row horizontal-cart-row" key={item.id}>
                  <div className="cart-left">
                    <strong>{item.name}</strong>
                    <p>{item.qty} x {formatMoney(item.sale_price)} đ</p>
                  </div>
                  <div className="cart-right">
                    <span className="pill muted">{formatMoney(item.sale_price * item.qty)} đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
