import { useEffect, useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { sheetApi } from '../../services/sheet-api.js';
import { can } from '../../utils/permissions.js';
import { formatMoney, formatTime, initials } from '../../utils/helper.js';
import { validateOrder } from '../../utils/validator.js';
import { Icon, IconSprite } from './icons.jsx';
import { DashboardLayout } from './layout.jsx';

export function DashboardPage() {
  const user = authService.currentUser();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    sheetApi.getDashboard().then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setToast('Không tải được dữ liệu quầy.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!modal) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  if (!data) return <><IconSprite /><div className="page-content"><p role="status">Đang tải dữ liệu quầy...</p></div></>;

  const totalRevenue = data.orders.reduce((sum, order) => sum + order.amount, 0);
  const totalUnits = data.orders.reduce((sum, order) => sum + order.items, 0);
  const lowStockCount = data.products.filter((product) => product.stock < 12).length;
  const visibleOrders = data.orders.filter((order) => `${order.id} ${order.customer} ${order.staff}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
    && (status === 'all' || order.status === status));

  const notify = (message) => setToast(message);
  const createOrder = async (order) => {
    const created = await sheetApi.createOrder(order);
    setData((current) => ({ ...current, orders: [created, ...current.orders] }));
    setModal(null);
    notify(`Đã tạo đơn ${created.id}.`);
  };
  const updateStock = async (productId, quantity) => {
    const updated = await sheetApi.updateStock(productId, quantity);
    setData((current) => ({ ...current, products: current.products.map((product) => product.id === updated.id ? updated : product) }));
    setModal(null);
    notify(`Tồn kho ${updated.name} đã được cập nhật.`);
  };
  const navigate = (view) => {
    const target = { overview: 'overview', orders: 'orders-panel', inventory: 'inventory-panel' }[view];
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    else notify(view === 'reports' ? 'Báo cáo doanh thu đang được chuẩn bị.' : 'Quản lý nhân viên sẽ sớm khả dụng.');
  };

  return <>
    <IconSprite />
    <DashboardLayout user={user} orderCount={data.orders.length} lowStockCount={lowStockCount} onNavigate={navigate}>
      <main className="page-content" id="overview">
        <div className="page-heading"><div><h1>Tổng quan</h1><p>Chào <strong>{user.name}</strong>, đây là tình hình quầy hôm nay.</p></div><button className="button-primary" type="button" onClick={() => setModal({ type: 'order' })}><Icon name="plus" />Tạo đơn hàng</button></div>
        <section className="metric-grid" aria-label="Chỉ số trong ngày">
          <article className="metric-card"><div className="metric-top">Doanh thu hôm nay<span className="metric-icon"><Icon name="cash" /></span></div><div className="metric-value">{formatMoney(totalRevenue)}</div><div className="metric-foot"><span className="trend-up"><Icon name="arrow-up" style={{ width: 11, height: 11, verticalAlign: -2 }} /> 12,8%</span> so với hôm qua</div></article>
          <article className="metric-card"><div className="metric-top">Đơn hàng<span className="metric-icon"><Icon name="receipt" /></span></div><div className="metric-value">{data.orders.length}</div><div className="metric-foot"><span className="trend-up">{data.orders.length}</span> đơn trong ca</div></article>
          <article className="metric-card"><div className="metric-top">Sản phẩm đã bán<span className="metric-icon"><Icon name="beer" /></span></div><div className="metric-value">{totalUnits}</div><div className="metric-foot">Sản phẩm trong hôm nay</div></article>
          <article className="metric-card"><div className="metric-top">Giá trị trung bình<span className="metric-icon amber"><Icon name="chart" /></span></div><div className="metric-value">{formatMoney(data.orders.length ? Math.round(totalRevenue / data.orders.length) : 0)}</div><div className="metric-foot">Trên mỗi đơn hàng</div></article>
        </section>
        <div className="dashboard-grid">
          <section className="panel" aria-labelledby="sales-title"><header className="panel-header"><div><h2 className="panel-title" id="sales-title">Doanh thu trong ngày</h2><div className="panel-subtitle">Biến động doanh thu theo giờ</div></div><span className="legend">Hôm nay</span></header>
            <div className="panel-body"><div className="chart-summary"><span className="chart-total">{formatMoney(totalRevenue)}</span><span className="chart-change">+12,8%</span></div>
              <div className="chart-area" role="img" aria-label="Biểu đồ doanh thu tăng dần trong ngày"><svg viewBox="0 0 700 180" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#54a77c" stopOpacity=".2" /><stop offset="1" stopColor="#54a77c" stopOpacity="0" /></linearGradient></defs><path className="chart-gridline" d="M0 24H700M0 68H700M0 112H700M0 156H700" /><path className="chart-fill" d="M0 145 C45 135 50 126 95 132 S160 107 190 116 S250 88 290 101 S350 75 395 88 S455 63 495 75 S555 43 590 56 S650 32 700 26 V180 H0Z" /><path className="chart-line" d="M0 145 C45 135 50 126 95 132 S160 107 190 116 S250 88 290 101 S350 75 395 88 S455 63 495 75 S555 43 590 56 S650 32 700 26" /></svg></div>
              <div className="chart-labels"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span></div>
            </div>
          </section>
          <section className="panel inventory-panel" id="inventory-panel" aria-labelledby="inventory-title"><header className="panel-header"><div><h2 className="panel-title" id="inventory-title">Tồn kho nổi bật</h2><div className="panel-subtitle">{lowStockCount ? `${lowStockCount} sản phẩm sắp hết` : 'Tồn kho ổn định'}</div></div><button className="icon-button" type="button" aria-label="Điều chỉnh tồn kho" title="Điều chỉnh tồn kho" onClick={() => setModal({ type: 'stock' })}><Icon name="edit" /></button></header>
            <div className="panel-body"><div className="inventory-list">{data.products.map((product) => {
              const percentage = Math.min(100, Math.round(product.stock / product.capacity * 100));
              return <div className="inventory-row" key={product.id}><span className="product-thumb" aria-hidden="true"><Icon name="beer" /></span><span><span className="product-name">{product.name}</span><span className="product-sub">{product.category}</span></span><span className="stock-number">{product.stock} lon<div className="stock-bar"><span className={percentage < 25 ? 'low' : ''} style={{ width: `${percentage}%` }} /></div></span></div>;
            })}</div></div>
          </section>
        </div>
        <section className="panel table-panel" id="orders-panel" aria-labelledby="orders-title"><header className="panel-header"><div><h2 className="panel-title" id="orders-title">Đơn hàng gần đây</h2><div className="panel-subtitle">Các giao dịch mới nhất trong ca</div></div><div className="table-tools"><label className="search-box"><Icon name="search" /><span className="sr-only">Tìm đơn hàng</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm đơn hàng" /></label><label className="sr-only" htmlFor="status-filter">Lọc trạng thái</label><select className="filter-select" id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Tất cả</option><option value="Hoàn tất">Hoàn tất</option><option value="Đang xử lý">Đang xử lý</option></select></div></header>
          <div className="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Thanh toán</th><th>Thời gian</th><th>Trạng thái</th></tr></thead><tbody>{visibleOrders.length ? visibleOrders.map((order) => <tr key={order.id}><td className="order-code">{order.id}</td><td><span className="customer-cell"><span className="mini-avatar">{initials(order.customer)}</span>{order.customer}</span></td><td>{order.items} sản phẩm</td><td><strong>{formatMoney(order.amount)}</strong></td><td>{formatTime(order.time)}</td><td><span className={`status-pill${order.status === 'Đang xử lý' ? ' pending' : ''}`}>{order.status}</span></td></tr>) : <tr><td className="empty-state" colSpan="6">Không tìm thấy đơn hàng phù hợp.</td></tr>}</tbody></table></div>
          <footer className="table-footer"><span>{visibleOrders.length} đơn hàng</span><span>Dữ liệu được lưu trên thiết bị</span></footer>
        </section>
        <div className="quick-actions"><button className="quick-action" type="button" onClick={() => setModal({ type: 'order' })}><span className="metric-icon"><Icon name="plus" /></span><span><strong>Tạo đơn mới</strong><small>Ghi nhận giao dịch</small></span></button><button className="quick-action" type="button" onClick={() => navigate('inventory')}><span className="metric-icon amber"><Icon name="box" /></span><span><strong>Kiểm tra kho</strong><small>Xem lượng hàng còn</small></span></button></div>
      </main>
    </DashboardLayout>
    {modal?.type === 'order' && <OrderModal onClose={() => setModal(null)} onSubmit={createOrder} user={user} />}
    {modal?.type === 'stock' && <StockModal products={data.products} onClose={() => setModal(null)} onSubmit={updateStock} allowed={can(user, 'inventory:manage')} onNotify={notify} />}
    <div className="toast-region" aria-live="polite">{toast && <div className="toast" role="status">{toast}</div>}</div>
  </>;
}

function ModalFrame({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><h2 id="modal-title">{title}</h2><button className="modal-close" type="button" aria-label="Đóng" onClick={onClose}><Icon name="close" /></button></header>{children}</section></div>;
}

function OrderModal({ onClose, onSubmit, user }) {
  const [error, setError] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const errors = validateOrder(values);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }
    await onSubmit({ ...values, items: Number(values.items), amount: Number(values.amount), customer: values.customer.trim(), staff: user.name.split(' ').at(-1) });
  };

  return <ModalFrame title="Tạo đơn hàng" onClose={onClose}><form onSubmit={handleSubmit}><div className="modal-body">
    <div className="modal-field"><label htmlFor="order-customer">Tên khách hàng</label><input id="order-customer" name="customer" placeholder="Ví dụ: Nguyễn Văn An" required autoFocus /></div>
    <div className="modal-field"><label htmlFor="order-items">Số lượng sản phẩm</label><input id="order-items" name="items" type="number" min="1" defaultValue="2" required /></div>
    <div className="modal-field"><label htmlFor="order-amount">Tổng thanh toán (đ)</label><input id="order-amount" name="amount" type="number" min="1" placeholder="Ví dụ: 80000" required /></div>
    <p className="form-error" role="alert">{error}</p>
  </div><footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Hủy</button><button className="button-primary" type="submit">Lưu đơn hàng</button></footer></form></ModalFrame>;
}

function StockModal({ products, onClose, onSubmit, allowed, onNotify }) {
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(products[0]?.stock || 0);
  const selectedProduct = products.find((product) => product.id === productId);

  if (!allowed) {
    return <ModalFrame title="Điều chỉnh tồn kho" onClose={onClose}><div className="modal-body"><p>Chỉ quản lý mới có thể điều chỉnh tồn kho.</p></div><footer className="modal-footer"><button className="button-secondary" type="button" onClick={() => { onClose(); onNotify('Chỉ quản lý mới có thể điều chỉnh tồn kho.'); }}>Đóng</button></footer></ModalFrame>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(productId, quantity);
  };

  return <ModalFrame title="Điều chỉnh tồn kho" onClose={onClose}><form onSubmit={handleSubmit}><div className="modal-body">
    <div className="modal-field"><label htmlFor="stock-product">Sản phẩm</label><select id="stock-product" value={productId} onChange={(event) => { const nextId = event.target.value; setProductId(nextId); setQuantity(products.find((product) => product.id === nextId).stock); }}>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select></div>
    <div className="modal-field"><label htmlFor="stock-quantity">Số lượng tồn</label><input id="stock-quantity" type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></div>
    <span className="screen-reader">Đang chọn {selectedProduct?.name}</span>
  </div><footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Hủy</button><button className="button-primary" type="submit">Cập nhật kho</button></footer></form></ModalFrame>;
}