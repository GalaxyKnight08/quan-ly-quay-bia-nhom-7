import { useEffect, useMemo, useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { MENU, posService } from '../../services/pos-service.js';
import { formatDate, formatMoney, formatTime } from '../../utils/helper.js';
import { DashboardLayout } from './layout.jsx';

const money = (value) => formatMoney(value);

function elapsedTime(openedAt) {
  if (!openedAt) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000));
  return `${Math.floor(minutes / 60)}g ${minutes % 60}p`;
}

export function DashboardPage() {
  const user = authService.currentUser();
  const [data, setData] = useState(() => posService.getData());
  const [areaId, setAreaId] = useState('inside');
  const [activeView, setActiveView] = useState(user.role === 'manager' ? 'reports' : 'tables');
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [paymentTableId, setPaymentTableId] = useState(null);
  const [openTableId, setOpenTableId] = useState(null);
  const [toast, setToast] = useState('');
  const selectedTable = data.tables.find((table) => table.id === selectedTableId);
  const paymentTable = data.tables.find((table) => table.id === paymentTableId);

  useEffect(() => {
    const refresh = () => setData(posService.getData());
    const interval = window.setInterval(refresh, 3000);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const tables = useMemo(() => data.tables.filter((table) => table.areaId === areaId), [areaId, data.tables]);
  const occupiedCount = data.tables.filter((table) => table.status !== 'empty').length;
  const provisionalTotal = data.tables.filter((table) => table.status === 'provisional').reduce((sum, table) => sum + table.total, 0);
  const updateData = (nextData) => {
    setData(nextData);
    setOpenTableId(null);
    setToast('');
  };
  const handleTableClick = (table) => {
    if (table.status === 'empty') setOpenTableId(table.id);
    else setSelectedTableId(table.id);
  };
  const handleOpenTable = (guestCount) => {
    try {
      updateData(posService.openTable(openTableId, guestCount));
      setOpenTableId(null);
      setSelectedTableId(openTableId);
    } catch (error) {
      setToast(error.message);
    }
  };
  const handleAddRound = (lines) => {
    try {
      updateData(posService.addRound(selectedTableId, lines, user.name));
    } catch (error) {
      setToast(error.message);
    }
  };
  const handleProvisional = () => {
    try {
      updateData(posService.markProvisional(selectedTableId));
      setSelectedTableId(null);
      setToast('Đã ghi nhận in tạm tính.');
    } catch (error) {
      setToast(error.message);
    }
  };
  const handlePayment = () => {
    try {
      updateData(posService.closeTable(paymentTableId));
      setSelectedTableId(null);
      setPaymentTableId(null);
      setToast('Đã hoàn tất thanh toán. Bàn đã trở về trạng thái trống.');
    } catch (error) {
      setToast(error.message);
    }
  };

  return <>
    <DashboardLayout
      user={user}
      occupiedCount={occupiedCount}
      activeView={activeView}
      onNavigate={(view) => setActiveView(view)}
    >
      {activeView === 'tables'
        ? <main className="page-content pos-content">
          <div className="page-heading"><div><span className="eyebrow">Phân hệ Quầy</span><h1>Sơ đồ bàn</h1><p>Chọn bàn để mở phiên hoặc tiếp tục phục vụ khách.</p></div><div className="shift-reminder"><span className="shift-dot" />Chưa mở ca</div></div>
          <section className="pos-summary" aria-label="Tình trạng bàn">
            <div className="pos-summary-item"><span className="table-state-dot empty" />Bàn trống <strong>{80 - occupiedCount}</strong></div>
            <div className="pos-summary-item"><span className="table-state-dot occupied" />Đang ngồi <strong>{occupiedCount}/80</strong></div>
            <div className="pos-summary-item"><span className="table-state-dot provisional" />Tạm tính đang mở <strong>{money(provisionalTotal)}</strong></div>
          </section>
          <section className="panel floor-panel">
            <header className="floor-toolbar">
              <div className="area-tabs" role="tablist" aria-label="Chọn khu vực">
                {data.areas.map((area) => <button key={area.id} type="button" role="tab" aria-selected={areaId === area.id} className={`area-tab${areaId === area.id ? ' is-active' : ''}`} onClick={() => setAreaId(area.id)}>{area.name}<span>{area.count}</span></button>)}
              </div>
              <div className="floor-legend" aria-label="Chú thích trạng thái">
                <span><i className="table-state-dot empty" />Trống</span><span><i className="table-state-dot occupied" />Đang ngồi</span><span><i className="table-state-dot provisional" />Tạm tính</span>
              </div>
            </header>
            <div className="table-grid" role="list" aria-label="Bàn trong khu vực">
              {tables.map((table) => <button key={table.id} type="button" role="listitem" className={`table-tile table-${table.status}`} onClick={() => handleTableClick(table)} aria-label={`Bàn ${table.id}, ${table.status === 'empty' ? 'trống' : `${money(table.total)}, ${elapsedTime(table.openedAt)}`}`}>
                <span className="table-number">{table.id}</span>
                {table.status === 'empty' ? <span className="table-tile-hint">Mở bàn</span> : <><span className="table-total">{money(table.total)}</span><span className="table-elapsed">{elapsedTime(table.openedAt)}</span></>}
              </button>)}
            </div>
          </section>
        </main>
        : <ReportsPage data={data} />}
    </DashboardLayout>
    {openTableId !== null && <OpenTableDialog tableId={openTableId} onCancel={() => setOpenTableId(null)} onConfirm={handleOpenTable} />}
    {selectedTable && <TableSessionDialog table={selectedTable} onClose={() => setSelectedTableId(null)} onAddRound={handleAddRound} onProvisional={handleProvisional} onPayment={() => setPaymentTableId(selectedTableId)} />}
    {paymentTable && <PaymentDialog table={paymentTable} onClose={() => setPaymentTableId(null)} onConfirm={handlePayment} />}
    <div className="toast-region" aria-live="polite">{toast && <div className="toast" role="status">{toast}</div>}</div>
  </>;
}

function OpenTableDialog({ tableId, onCancel, onConfirm }) {
  const [guestCount, setGuestCount] = useState('');
  return <Modal title={`Mở bàn ${tableId}`} onClose={onCancel}>
    <form onSubmit={(event) => { event.preventDefault(); onConfirm(guestCount ? Number(guestCount) : null); }}>
      <div className="modal-body"><label className="modal-field"><span>Số khách <small>(không bắt buộc)</small></span><input type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Nhập số khách" autoFocus /></label></div>
      <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onCancel}>Hủy</button><button className="button-primary" type="submit">Mở bàn</button></footer>
    </form>
  </Modal>;
}

function TableSessionDialog({ table, onClose, onAddRound, onProvisional, onPayment }) {
  const [category, setCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState([]);
  const categories = ['Tất cả', ...new Set(MENU.map((item) => item.category))];
  const filteredMenu = MENU.filter((item) => (category === 'Tất cả' || item.category === category)
    && item.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const changeQuantity = (itemId, delta) => setDraft((lines) => {
    const existing = lines.find((line) => line.id === itemId);
    if (!existing && delta > 0) return [...lines, { ...MENU.find((item) => item.id === itemId), quantity: 1 }];
    return lines.map((line) => line.id === itemId ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0);
  });
  const sentLines = table.rounds.flatMap((round) => round.lines);
  const draftTotal = draft.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return <Modal title={`Phiên bàn ${table.id}`} onClose={onClose} wide>
    <div className="session-layout">
      <section className="menu-picker" aria-label="Chọn món">
        <div className="menu-tools"><label className="search-box"><i className="icon fa-solid fa-magnifying-glass" aria-hidden="true" /><span className="sr-only">Tìm món</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món hoặc mã tắt" /></label></div>
        <div className="menu-categories">{categories.map((item) => <button key={item} type="button" className={category === item ? 'is-selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="menu-items">{filteredMenu.map((item) => <button className="menu-item" key={item.id} type="button" onClick={() => changeQuantity(item.id, 1)}><span><strong>{item.name}</strong><small>{item.station}</small></span><b>{money(item.price)}<i className="icon fa-solid fa-plus" aria-hidden="true" /></b></button>)}</div>
      </section>
      <section className="session-order">
        <div className="session-meta"><span>{table.guestCount ? `${table.guestCount} khách` : 'Chưa ghi số khách'}</span><span>Đã ngồi {elapsedTime(table.openedAt)}</span></div>
        <h3>Lượt đang nhập</h3>
        {draft.length ? <div className="draft-list">{draft.map((line) => <div className="draft-line" key={line.id}><span>{line.name}<small>{money(line.price)}</small></span><div className="quantity-control"><button type="button" aria-label={`Giảm ${line.name}`} onClick={() => changeQuantity(line.id, -1)}>−</button><b>{line.quantity}</b><button type="button" aria-label={`Tăng ${line.name}`} onClick={() => changeQuantity(line.id, 1)}>+</button></div><strong>{money(line.price * line.quantity)}</strong></div>)}</div> : <p className="session-empty">Chọn món từ thực đơn để tạo lượt gọi.</p>}
        <div className="draft-total"><span>Tạm tính lượt này</span><strong>{money(draftTotal)}</strong></div>
        <button className="button-primary session-send" type="button" disabled={!draft.length} onClick={() => { onAddRound(draft); setDraft([]); }}>Gửi lượt gọi</button>
        <div className="sent-history"><h3>Lịch sử gọi món</h3>{table.rounds.length ? table.rounds.slice().reverse().map((round) => <article className="round-card" key={round.id}><header><strong>{formatTime(round.sentAt)}</strong><span>{round.staffName}</span></header>{round.lines.map((line) => <p key={`${round.id}-${line.id}`}>{line.name} × {line.quantity}</p>)}<button type="button" className="text-button" onClick={() => window.print()}>In lại phiếu</button></article>) : <p className="session-empty">Chưa có lượt gọi nào.</p>}{sentLines.length > 0 && <p className="session-sent-count">{sentLines.length} dòng món đã gửi</p>}</div>
        <div className="session-actions"><button type="button" className="button-secondary" disabled={!table.total} onClick={() => { window.print(); onProvisional(); }}>In tạm tính</button><button type="button" className="button-primary" disabled={!table.total} onClick={onPayment}>Thanh toán</button></div>
      </section>
    </div>
  </Modal>;
}

function ReportsPage({ data }) {
  const occupiedCount = data.tables.filter((table) => table.status !== 'empty').length;
  const provisionalTotal = data.tables.filter((table) => table.status === 'provisional').reduce((sum, table) => sum + table.total, 0);
  const demoRevenue = 12840000;
  const demoBills = 42;
  return <main className="page-content reports-content">
    <div className="page-heading"><div><span className="eyebrow">Phân hệ Báo cáo · Dữ liệu minh họa</span><h1>Tổng quan hôm nay</h1><p>{formatDate()} · Bố cục theo FR-16</p></div><span className="report-updated">Bản demo giao diện</span></div>
    <section className="report-metrics" aria-label="Số liệu trong ngày">
      <ReportMetric icon="fa-money-bill-wave" label="Doanh thu đã thu" value={money(demoRevenue)} change="+8,4%" />
      <ReportMetric icon="fa-receipt" label="Tạm tính đang mở" value={money(provisionalTotal)} change={`${data.tables.filter((table) => table.status === 'provisional').length} bàn`} />
      <ReportMetric icon="fa-chair" label="Bàn đang ngồi" value={`${occupiedCount}/80`} change="Trong các khu" />
      <ReportMetric icon="fa-file-invoice" label="Số hóa đơn" value={demoBills} change="+5,2%" />
    </section>
    <div className="report-grid">
      <section className="panel report-panel"><header className="panel-header"><div><h2 className="panel-title">Doanh thu theo giờ</h2><div className="panel-subtitle">Hôm nay so với cùng giờ hôm qua</div></div></header><div className="report-chart" role="img" aria-label="Biểu đồ doanh thu theo giờ"><div className="chart-axis"><span>3tr</span><span>2tr</span><span>1tr</span><span>0</span></div><div className="bar-chart">{[38, 51, 42, 69, 54, 82, 63, 91, 72, 48, 34, 20].map((height, index) => <div className="bar-group" key={index}><span className="bar yesterday" style={{ height: `${height * .65}%` }} /><span className="bar today" style={{ height: `${height}%` }} /></div>)}</div></div><div className="chart-labels report-labels"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span></div><div className="report-legend"><span><i className="legend-dot today" />Hôm nay</span><span><i className="legend-dot yesterday" />Hôm qua</span></div></section>
      <section className="panel payment-panel"><header className="panel-header"><div><h2 className="panel-title">Phương thức thanh toán</h2><div className="panel-subtitle">Tỷ lệ doanh thu đã thu</div></div></header><div className="payment-chart"><div className="payment-donut"><strong>100%</strong><span>Tổng thu</span></div></div><div className="payment-breakdown"><div><span><i className="legend-dot today" />Tiền mặt</span><strong>68%</strong></div><div><span><i className="legend-dot transfer" />Chuyển khoản</span><strong>32%</strong></div></div></section>
    </div>
  </main>;
}

function ReportMetric({ icon, label, value, change }) {
  return <article className="metric-card"><div className="metric-top">{label}<span className="metric-icon"><i className={`icon fa-solid ${icon}`} aria-hidden="true" /></span></div><div className="metric-value">{value}</div><div className="metric-foot"><span className="trend-up">{change}</span> so với cùng giờ hôm qua</div></article>;
}

function PaymentDialog({ table, onClose, onConfirm }) {
  const [method, setMethod] = useState('cash');
  const [received, setReceived] = useState('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const canComplete = table.total > 0 && (method === 'cash' ? Number(received) >= table.total : transferConfirmed);
  const change = Math.max(0, Number(received) - table.total);
  return <Modal title={`Thanh toán bàn ${table.id}`} onClose={onClose}>
    <div className="modal-body payment-form">
      <div className="payment-total"><span>Tổng cần thanh toán</span><strong>{money(table.total)}</strong></div>
      <div className="payment-methods" role="group" aria-label="Phương thức thanh toán">
        <button type="button" className={method === 'cash' ? 'is-selected' : ''} aria-pressed={method === 'cash'} onClick={() => setMethod('cash')}><i className="icon fa-solid fa-money-bill-wave" aria-hidden="true" />Tiền mặt</button>
        <button type="button" className={method === 'transfer' ? 'is-selected' : ''} aria-pressed={method === 'transfer'} onClick={() => setMethod('transfer')}><i className="icon fa-solid fa-qrcode" aria-hidden="true" />Chuyển khoản</button>
      </div>
      {method === 'cash'
        ? <><label className="modal-field"><span>Tiền khách đưa</span><input type="number" min={table.total} step="1000" value={received} onChange={(event) => setReceived(event.target.value)} placeholder="Nhập số tiền" /></label><div className="quick-cash">{[100000, 200000, 500000].map((amount) => <button key={amount} type="button" onClick={() => setReceived(String(amount))}>{money(amount)}</button>)}</div><div className="payment-change"><span>Tiền thừa</span><strong>{money(change)}</strong></div></>
        : <><div className="qr-placeholder"><i className="icon fa-solid fa-qrcode" aria-hidden="true" /><strong>Mã VietQR</strong><span>Ảnh QR sẽ có khi kết nối thông tin tài khoản quán.</span><code>BH{table.id}</code></div><label className="payment-confirm"><input type="checkbox" checked={transferConfirmed} onChange={(event) => setTransferConfirmed(event.target.checked)} /><span>Đã kiểm tra và xác nhận nhận đủ tiền</span></label></>}
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Quay lại</button><button className="button-primary" type="button" disabled={!canComplete} onClick={onConfirm}>Hoàn tất thanh toán</button></footer>
  </Modal>;
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><h2 id="modal-title">{title}</h2><button className="modal-close" type="button" aria-label="Đóng" onClick={onClose}><i className="icon fa-solid fa-xmark" aria-hidden="true" /></button></header>{children}</section></div>;
}
