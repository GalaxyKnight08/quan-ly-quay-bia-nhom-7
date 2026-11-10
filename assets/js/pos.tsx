import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { authService } from '../../services/auth-service.ts';
import { MENU, posService } from '../../services/pos-service.ts';
import { formatMoney, formatTime } from '../../utils/helper.ts';
import { DashboardLayout } from './layout.tsx';
import { FRPage } from './fr-pages.tsx';
import type { CompletedBill, DiningTable, MenuItem, OrderLine, PaymentDetails, User } from '../../utils/types.ts';
import type { AdjustmentAction } from '../../utils/types.ts';

type DraftLine = MenuItem & { quantity: number };
interface Adjustment {
  roundId: string;
  lineId: string;
  action: AdjustmentAction;
  quantity: number;
  discountAmount: number;
  reason: string;
  note: string;
}

const money = (value: number) => formatMoney(value);

function elapsedTime(openedAt: string | null) {
  if (!openedAt) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000));
  return `${Math.floor(minutes / 60)}g ${minutes % 60}p`;
}

export function DashboardPage() {
  const user = authService.currentUser();
  const [data, setData] = useState(() => posService.getData());
  const [areaId, setAreaId] = useState('inside');
  const [activeView, setActiveView] = useState(['manager', 'owner'].includes(user?.role ?? '') ? 'reports' : 'tables');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [paymentTableId, setPaymentTableId] = useState<number | null>(null);
  const [openTableId, setOpenTableId] = useState<number | null>(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [receipt, setReceipt] = useState<CompletedBill | null>(null);
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
  const updateData = (nextData: ReturnType<typeof posService.getData>) => {
    setData(nextData);
    setOpenTableId(null);
    setToast('');
  };
  const handleTableClick = (table: DiningTable) => {
    if (table.status === 'empty') setOpenTableId(table.id);
    else setSelectedTableId(table.id);
  };
  const handleOpenTable = (guestCount: number | null) => {
    try {
      if (openTableId === null) return;
      updateData(posService.openTable(openTableId, guestCount));
      setOpenTableId(null);
      setSelectedTableId(openTableId);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể mở bàn.');
    }
  };
  const handleAddRound = (lines: DraftLine[]) => {
    try {
      if (selectedTableId === null || !user) return;
      updateData(posService.addRound(selectedTableId, lines, user.name));
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể gửi lượt gọi.');
    }
  };
  const handleProvisional = () => {
    try {
      if (selectedTableId === null) return;
      updateData(posService.markProvisional(selectedTableId));
      setSelectedTableId(null);
      setToast('Đã ghi nhận in tạm tính.');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể in tạm tính.');
    }
  };
  const handlePayment = (payment: PaymentDetails) => {
    try {
      if (paymentTableId === null) return;
      const nextData = posService.closeTable(paymentTableId, payment);
      setData(nextData);
      setOpenTableId(null);
      setToast('');
      setSelectedTableId(null);
      setPaymentTableId(null);
      setReceipt(nextData.completedBills[0]);
      setToast('Đã hoàn tất thanh toán. Bàn đã trở về trạng thái trống.');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể hoàn tất thanh toán.');
    }
  };
  const handleMoveMerge = (targetId: number, merge: boolean) => {
    try {
      if (selectedTableId === null) return;
      updateData(posService.moveTable(selectedTableId, targetId, merge));
      setSelectedTableId(null);
      setToast(merge ? 'Đã gộp phiên bàn.' : 'Đã chuyển bàn.');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể chuyển hoặc gộp bàn.');
    }
  };
  const handleAdjustment = ({ roundId, lineId, action, quantity, discountAmount, reason, note }: Adjustment) => {
    try {
      if (selectedTableId === null) return;
      updateData(posService.adjustOrderLine(selectedTableId, roundId, lineId, action, quantity, discountAmount, reason, note));
      setToast(action === 'void' ? 'Đã ghi nhận hủy món demo.' : 'Đã ghi nhận giảm giá demo.');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Không thể điều chỉnh món.');
    }
  };

  if (!user) return null;

  return <>
    <DashboardLayout
      user={user}
      occupiedCount={occupiedCount}
      shiftOpen={shiftOpen}
      activeView={activeView}
      onNavigate={(view) => setActiveView(view)}
    >
      {activeView === 'tables'
        ? <main className="page-content pos-content">
          <div className="page-heading"><div><span className="eyebrow">Phân hệ Quầy</span><h1>Sơ đồ bàn</h1><p>Chọn bàn để mở phiên hoặc tiếp tục phục vụ khách.</p></div><div className="shift-reminder"><span className="shift-dot" />{shiftOpen ? 'Ca đang mở' : 'Chưa mở ca'}</div></div>
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
        : <FRPage view={activeView} user={user} shiftOpen={shiftOpen} setShiftOpen={setShiftOpen} onToast={setToast} />}
    </DashboardLayout>
    {openTableId !== null && <OpenTableDialog tableId={openTableId} onCancel={() => setOpenTableId(null)} onConfirm={handleOpenTable} />}
    {selectedTable && <TableSessionDialog table={selectedTable} tables={data.tables} user={user} onClose={() => setSelectedTableId(null)} onAddRound={handleAddRound} onProvisional={handleProvisional} onPayment={() => setPaymentTableId(selectedTableId)} onMoveMerge={handleMoveMerge} onAdjustment={handleAdjustment} />}
    {paymentTable && <PaymentDialog table={paymentTable} user={user} onClose={() => setPaymentTableId(null)} onConfirm={handlePayment} />}
    {receipt && <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} />}
    <div className="toast-region" aria-live="polite">{toast && <div className="toast" role="status">{toast}</div>}</div>
  </>;
}

function OpenTableDialog({ tableId, onCancel, onConfirm }: { tableId: number; onCancel: () => void; onConfirm: (guestCount: number | null) => void }) {
  const [guestCount, setGuestCount] = useState('');
  return <Modal title={`Mở bàn ${tableId}`} onClose={onCancel}>
    <form onSubmit={(event) => { event.preventDefault(); onConfirm(guestCount ? Number(guestCount) : null); }}>
      <div className="modal-body"><label className="modal-field"><span>Số khách <small>(không bắt buộc)</small></span><input type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} placeholder="Nhập số khách" autoFocus /></label></div>
      <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onCancel}>Hủy</button><button className="button-primary" type="submit">Mở bàn</button></footer>
    </form>
  </Modal>;
}

interface TableSessionDialogProps {
  table: DiningTable;
  tables: DiningTable[];
  user: User;
  onClose: () => void;
  onAddRound: (lines: DraftLine[]) => void;
  onProvisional: () => void;
  onPayment: () => void;
  onMoveMerge: (targetId: number, merge: boolean) => void;
  onAdjustment: (adjustment: Adjustment) => void;
}

function TableSessionDialog({ table, tables, user, onClose, onAddRound, onProvisional, onPayment, onMoveMerge, onAdjustment }: TableSessionDialogProps) {
  const [category, setCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<DraftLine[]>([]);
  const [sessionAction, setSessionAction] = useState('');
  const categories = ['Tất cả', ...new Set(MENU.map((item) => item.category))];
  const searchTerm = search.trim().toLocaleLowerCase('vi');
  const filteredMenu = MENU.filter((item) => (category === 'Tất cả' || item.category === category)
    && `${item.name} ${item.shortcut}`.toLocaleLowerCase('vi').includes(searchTerm));
  const changeQuantity = (itemId: string, delta: number) => setDraft((lines) => {
    const existing = lines.find((line) => line.id === itemId);
    const menuItem = MENU.find((item) => item.id === itemId);
    if (!existing && delta > 0 && menuItem) return [...lines, { ...menuItem, quantity: 1 }];
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
        <div className="session-extra-actions"><button type="button" className="text-button" onClick={() => setSessionAction('transfer')}>Chuyển / gộp bàn</button><button type="button" className="text-button" disabled={!sentLines.length} onClick={() => setSessionAction('adjust')}>Hủy / giảm món đã gửi</button></div>
      </section>
    </div>
    {sessionAction === 'transfer' && <TransferDialog table={table} tables={tables} onClose={() => setSessionAction('')} onSubmit={onMoveMerge} />}
    {sessionAction === 'adjust' && <AdjustmentDialog table={table} user={user} onClose={() => setSessionAction('')} onSubmit={(adjustment) => { onAdjustment(adjustment); setSessionAction(''); }} />}
  </Modal>;
}

function TransferDialog({ table, tables, onClose, onSubmit }: { table: DiningTable; tables: DiningTable[]; onClose: () => void; onSubmit: (targetId: number, merge: boolean) => void }) {
  const [mode, setMode] = useState('move');
  const [targetId, setTargetId] = useState('');
  const candidates = tables.filter((item) => item.id !== table.id && (mode === 'move' ? item.status === 'empty' : item.status !== 'empty'));
  return <Modal title="Chuyển / gộp bàn" onClose={onClose}>
    <div className="modal-body">
      <div className="payment-methods"><button type="button" className={mode === 'move' ? 'is-selected' : ''} onClick={() => { setMode('move'); setTargetId(''); }}>Chuyển bàn</button><button type="button" className={mode === 'merge' ? 'is-selected' : ''} onClick={() => { setMode('merge'); setTargetId(''); }}>Gộp bàn</button></div>
      <label className="modal-field"><span>Bàn đích</span><select value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="" disabled>Chọn bàn</option>{candidates.map((item) => <option value={item.id} key={item.id}>Bàn {item.id}{item.status !== 'empty' ? ' · đang có khách' : ''}</option>)}</select></label>
      <p className="form-hint">{mode === 'move' ? 'Chỉ chọn được bàn trống. Toàn bộ phiên sẽ chuyển sang bàn đích.' : 'Chỉ chọn được bàn đang có khách. Các món sẽ nhập vào phiên bàn đích.'}</p>
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Hủy</button><button className="button-primary" type="button" disabled={!targetId} onClick={() => onSubmit(Number(targetId), mode === 'merge')}>Xác nhận</button></footer>
  </Modal>;
}

function AdjustmentDialog({ table, user, onClose, onSubmit }: { table: DiningTable; user: User; onClose: () => void; onSubmit: (adjustment: Adjustment) => void }) {
  const [selected, setSelected] = useState('');
  const [action, setAction] = useState<AdjustmentAction>('void');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Khách đổi ý');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState('');
  const lines = table.rounds.flatMap((round) => round.lines.filter((line) => !line.adjustment && line.quantity > 0).map((line) => ({ ...line, roundId: round.id })));
  const selectedLine = lines.find((line) => `${line.roundId}:${line.id}` === selected);
  return <Modal title="Hủy / giảm món đã gửi" onClose={onClose}>
    <div className="modal-body feature-form">
      <label className="modal-field"><span>Món đã gửi</span><select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Chọn món</option>{lines.map((line) => <option key={`${line.roundId}:${line.id}`} value={`${line.roundId}:${line.id}`}>{line.name} · còn {line.quantity}</option>)}</select></label>
      <label className="modal-field"><span>Thao tác</span><select value={action} onChange={(event) => setAction(event.target.value as AdjustmentAction)}><option value="void">Hủy món</option><option value="discount">Giảm giá</option></select></label>
      <label className="modal-field"><span>{action === 'void' ? 'Số lượng hủy' : 'Số lượng món áp dụng'}</span><input type="number" min="1" max={selectedLine?.quantity || 1} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
      {action === 'discount' && <label className="modal-field"><span>Số tiền giảm (₫)</span><input type="number" min="1" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>}
      <label className="modal-field"><span>Lý do bắt buộc</span><select value={reason} onChange={(event) => setReason(event.target.value)}>{['Khách đổi ý', 'Bếp hết món', 'Nhập nhầm', 'Món lỗi', 'Khác'].map((item) => <option key={item}>{item}</option>)}</select></label>
      {reason === 'Khác' && <label className="modal-field"><span>Ghi chú lý do</span><input value={note} onChange={(event) => setNote(event.target.value)} required /></label>}
      {user.role === 'staff' && <label className="modal-field"><span>PIN Quản lý ca</span><input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="PIN demo: 1234" /></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Hủy</button><button className="button-primary" type="button" disabled={!selected || !reason || (reason === 'Khác' && !note.trim()) || (user.role === 'staff' && !pin)} onClick={() => {
      if (user.role === 'staff' && pin !== '1234') {
        setError('PIN không đúng.');
        return;
      }
      const [roundId, lineId] = selected.split(':');
      setError('');
      onSubmit({ roundId, lineId, action, quantity: Number(quantity), discountAmount: Number(discount), reason, note });
    }}>Xác nhận</button></footer>
  </Modal>;
}

interface PaymentDialogProps {
  table: DiningTable;
  user: User;
  onClose: () => void;
  onConfirm: (payment: PaymentDetails) => void;
}

function PaymentDialog({ table, user, onClose, onConfirm }: PaymentDialogProps) {
  const [method, setMethod] = useState('cash');
  const [received, setReceived] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('amount');
  const [approverPin, setApproverPin] = useState('');
  const subtotal = table.total;
  const discountValue = discountType === 'percent' ? Math.round(subtotal * Math.min(100, Number(discount)) / 100) : Math.min(subtotal, Number(discount));
  const payable = Math.max(0, subtotal - discountValue);
  const transferValue = method === 'cash' ? 0 : method === 'transfer' ? payable : Number(transferAmount);
  const cashValue = method === 'transfer' ? 0 : Number(received);
  const discountApproved = discountValue === 0 || user.role !== 'staff' || approverPin === '1234';
  const canComplete = payable > 0 && transferValue <= payable && cashValue + transferValue >= payable && (transferValue === 0 || transferConfirmed) && discountApproved;
  const change = Math.max(0, cashValue + transferValue - payable);
  return <Modal title={`Thanh toán bàn ${table.id}`} onClose={onClose}>
    <div className="modal-body payment-form">
      <div className="payment-total"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div>
      <div className="bill-discount"><label className="modal-field"><span>Giảm giá hóa đơn</span><input type="number" min="0" max={discountType === 'percent' ? 100 : subtotal} value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="0" /></label><select value={discountType} onChange={(event) => setDiscountType(event.target.value)} aria-label="Loại giảm giá"><option value="amount">₫</option><option value="percent">%</option></select></div>
      {discountValue > 0 && <div className="payment-change"><span>Giảm giá</span><strong>−{money(discountValue)}</strong></div>}
      <div className="payment-total"><span>Tổng cần thanh toán</span><strong>{money(payable)}</strong></div>
      {discountValue > 0 && user.role === 'staff' && <label className="modal-field"><span>PIN Quản lý ca</span><input type="password" inputMode="numeric" value={approverPin} onChange={(event) => setApproverPin(event.target.value)} placeholder="PIN demo: 1234" /></label>}
      <div className="payment-methods" role="group" aria-label="Phương thức thanh toán">
        <button type="button" className={method === 'cash' ? 'is-selected' : ''} aria-pressed={method === 'cash'} onClick={() => setMethod('cash')}><i className="icon fa-solid fa-money-bill-wave" aria-hidden="true" />Tiền mặt</button>
        <button type="button" className={method === 'transfer' ? 'is-selected' : ''} aria-pressed={method === 'transfer'} onClick={() => setMethod('transfer')}><i className="icon fa-solid fa-qrcode" aria-hidden="true" />Chuyển khoản</button>
        <button type="button" className={method === 'split' ? 'is-selected' : ''} aria-pressed={method === 'split'} onClick={() => setMethod('split')}>Kết hợp</button>
      </div>
      {method !== 'transfer' && <><label className="modal-field"><span>{method === 'split' ? 'Tiền mặt khách đưa (₫)' : 'Tiền khách đưa (₫)'}</span><input type="number" min="0" step="1000" value={received} onChange={(event) => setReceived(event.target.value)} placeholder="Nhập số tiền" /></label><div className="quick-cash">{[100000, 200000, 500000].map((amount) => <button key={amount} type="button" onClick={() => setReceived(String(amount))}>{money(amount)}</button>)}</div></>}
      {method === 'split' && <label className="modal-field"><span>Chuyển khoản (₫)</span><input type="number" min="0" max={payable} value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)} placeholder="Nhập số tiền chuyển khoản" /></label>}
      {method !== 'cash' && <><div className="qr-placeholder"><i className="icon fa-solid fa-qrcode" aria-hidden="true" /><strong>Mã VietQR · {money(transferValue)}</strong><span>QR thật cần cấu hình tài khoản ngân hàng của quán.</span><code>BH{table.id}</code></div><label className="payment-confirm"><input type="checkbox" checked={transferConfirmed} onChange={(event) => setTransferConfirmed(event.target.checked)} /><span>Đã kiểm tra và xác nhận nhận đủ tiền chuyển khoản</span></label></>}
      <div className="payment-change"><span>Tiền thừa</span><strong>{money(change)}</strong></div>
      {transferValue > payable && <p className="form-error" role="alert">Số tiền chuyển khoản không được vượt quá tổng cần thanh toán.</p>}
      {!discountApproved && <p className="form-error" role="alert">PIN không đúng.</p>}
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Quay lại</button><button className="button-primary" type="button" disabled={!canComplete} onClick={() => {
      const cashPaid = Math.max(0, payable - transferValue);
      const payments: PaymentDetails['payments'] = [];
      if (cashPaid) payments.push({ method: 'CASH', amount: cashPaid });
      if (transferValue) payments.push({ method: 'TRANSFER', amount: transferValue });
      onConfirm({ subtotal, discount: discountValue, total: payable, change, payments });
    }}>Hoàn tất thanh toán</button></footer>
  </Modal>;
}

function ReceiptDialog({ receipt, onClose }: { receipt: CompletedBill; onClose: () => void }) {
  return <Modal title="Hóa đơn thanh toán" onClose={onClose}>
    <div className="modal-body receipt-body">
      <div className="receipt-head"><strong>{receipt.billNo}</strong><span>Bàn {receipt.tableId} · {formatTime(receipt.paidAt)}</span></div>
      <div className="receipt-lines">{receipt.lines.map((line, index) => <div className="receipt-line" key={`${line.id}-${index}`}><span>{line.name} × {Math.abs(line.quantity)}</span><strong>{line.adjustment ? 'Điều chỉnh' : money(line.price * line.quantity)}</strong></div>)}</div>
      <div className="receipt-total"><span>Tạm tính</span><strong>{money(receipt.subtotal)}</strong></div>
      {receipt.discount > 0 && <div className="receipt-total"><span>Giảm giá</span><strong>−{money(receipt.discount)}</strong></div>}
      <div className="receipt-total grand"><span>Đã thanh toán</span><strong>{money(receipt.total)}</strong></div>
      {receipt.payments.map((payment) => <div className="receipt-total" key={payment.method}><span>{payment.method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span><strong>{money(payment.amount)}</strong></div>)}
      <div className="receipt-total"><span>Tiền thừa</span><strong>{money(receipt.change)}</strong></div>
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Đóng</button><button className="button-primary" type="button" onClick={() => window.print()}><i className="icon fa-solid fa-print" />In hóa đơn</button></footer>
  </Modal>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) onClose(); }}><section className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><h2 id="modal-title">{title}</h2><button className="modal-close" type="button" aria-label="Đóng" onClick={onClose}><i className="icon fa-solid fa-xmark" aria-hidden="true" /></button></header>{children}</section></div>;
}
