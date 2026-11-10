import { useMemo, useState } from 'react';
import { formatMoney } from '../../utils/helper.js';

const money = formatMoney;

const datasets = {
  menu: {
    title: 'Thực đơn & khu chế biến',
    subtitle: 'FR-11 · Quản lý món, nhóm món và khu chế biến',
    tabs: [
      { id: 'items', label: 'Món ăn', columns: ['Tên món', 'Mã tắt', 'Nhóm', 'Giá bán', 'Khu chế biến', 'Trạng thái'], fields: [['Tên món', 'name'], ['Mã tắt', 'shortcut'], ['Nhóm', 'category'], ['Giá bán (₫)', 'price', 'number'], ['Khu chế biến', 'station'], ['Là bia hơi', 'isDraftBeer', 'select', ['Không', 'Có']], ['Thể tích (ml)', 'volume', 'number'], ['Vòi mặc định', 'tap'], ['Trạng thái', 'status', 'select', ['Còn món', 'Hết món', 'Ẩn']]], rows: [
        { name: 'Bia hơi cốc 0,5L', shortcut: 'b', category: 'Bia', price: 15000, station: 'Quầy rót bia', status: 'Còn món' },
        { name: 'Bia hơi ca 1,5L', shortcut: 'bc', category: 'Bia', price: 42000, station: 'Quầy rót bia', status: 'Còn món' },
        { name: 'Mực nướng', shortcut: 'mn', category: 'Đồ nướng', price: 135000, station: 'Bếp nướng', status: 'Còn món' },
        { name: 'Ngô chiên bơ', shortcut: 'nc', category: 'Đồ chiên', price: 55000, station: 'Bếp chiên', status: 'Hết món' }
      ] },
      { id: 'groups', label: 'Nhóm món', columns: ['Tên nhóm', 'Thứ tự', 'Số món', 'Trạng thái'], fields: [['Tên nhóm', 'name'], ['Thứ tự', 'order', 'number'], ['Số món', 'count', 'number']], rows: [
        { name: 'Bia', order: 1, count: 6, status: 'Đang dùng' }, { name: 'Đồ nướng', order: 2, count: 8, status: 'Đang dùng' }, { name: 'Đồ chiên', order: 3, count: 5, status: 'Đang dùng' }, { name: 'Đồ nhắm', order: 4, count: 9, status: 'Đang dùng' }
      ] },
      { id: 'stations', label: 'Khu chế biến', columns: ['Tên khu', 'Số món phụ trách', 'Trạng thái'], fields: [['Tên khu', 'name'], ['Số món phụ trách', 'count', 'number']], rows: [
        { name: 'Quầy rót bia', count: 6, status: 'Đang dùng' }, { name: 'Bếp nướng', count: 8, status: 'Đang dùng' }, { name: 'Bếp chiên', count: 5, status: 'Đang dùng' }
      ] }
    ]
  },
  areas: {
    title: 'Khu & bàn',
    subtitle: 'FR-12 · Cấu hình khu vực và sơ đồ bàn',
    tabs: [
      { id: 'areas', label: 'Khu vực', columns: ['Tên khu', 'Số bàn', 'Thứ tự', 'Trạng thái'], fields: [['Tên khu', 'name'], ['Số bàn', 'tables', 'number'], ['Thứ tự', 'order', 'number']], rows: [
        { name: 'Trong nhà', tables: 30, order: 1, status: 'Đang dùng' }, { name: 'Sân vườn', tables: 30, order: 2, status: 'Đang dùng' }, { name: 'Tầng 2', tables: 20, order: 3, status: 'Đang dùng' }
      ] },
      { id: 'tables', label: 'Bàn', columns: ['Mã bàn', 'Khu vực', 'Sức chứa', 'Trạng thái'], fields: [['Mã bàn', 'name'], ['Khu vực', 'area'], ['Sức chứa', 'capacity', 'number']], rows: [
        { name: 'Bàn 01', area: 'Trong nhà', capacity: 6, status: 'Trống' }, { name: 'Bàn 02', area: 'Trong nhà', capacity: 8, status: 'Đang phục vụ' }, { name: 'Bàn 31', area: 'Sân vườn', capacity: 10, status: 'Trống' }
      ] }
    ]
  },
  staff: {
    title: 'Quản lý nhân viên',
    subtitle: 'FR-13 · Tài khoản, vai trò và trạng thái nhân viên',
    tabs: [{ id: 'staff', label: 'Nhân viên', columns: ['Họ tên', 'Email', 'Vai trò', 'Trạng thái'], fields: [['Họ tên', 'name'], ['Email', 'email'], ['Mật khẩu mới (nếu tạo/đặt lại)', 'password', 'password'], ['Vai trò', 'role', 'select', ['Nhân viên quầy', 'Quản lý ca', 'Chủ quán']], ['PIN duyệt (quản lý/chủ quán)', 'pin', 'password'], ['Trạng thái', 'status', 'select', ['Hoạt động', 'Đã khóa']]], rows: [
      { name: 'Nguyễn Minh Anh', email: 'nhanvien@quaybia.vn', role: 'Nhân viên quầy', status: 'Hoạt động' },
      { name: 'Trần Hoàng Nam', email: 'quanly@quaybia.vn', role: 'Quản lý ca', status: 'Hoạt động' },
      { name: 'Nguyễn Thu Hoa', email: 'hoa@biahoi.vn', role: 'Chủ quán', status: 'Hoạt động' }
    ] }]
  },
  kegs: {
    title: 'Nhập kho keg',
    subtitle: 'FR-14 · Theo dõi keg trong kho, đang dùng và đã hết',
    tabs: [{ id: 'kegs', label: 'Danh sách keg', columns: ['Mã keg', 'Loại bia', 'Dung tích', 'Giá nhập', 'Ngày nhập', 'Trạng thái'], fields: [['Loại bia', 'beer'], ['Dung tích (L)', 'capacity', 'select', ['30', '50']], ['Giá nhập (₫)', 'cost', 'number'], ['Ngày nhập', 'date', 'date'], ['Số lượng nhập', 'quantity', 'number']], rows: [
      { name: 'KEG-0008', beer: 'Bia hơi Hà Nội', capacity: '50 L', cost: 1250000, date: '10/11/2026', status: 'Đang dùng' },
      { name: 'KEG-0009', beer: 'Bia hơi Hà Nội', capacity: '50 L', cost: 1250000, date: '10/11/2026', status: 'Trong kho' },
      { name: 'KEG-0010', beer: 'Bia hơi Hải Phòng', capacity: '30 L', cost: 920000, date: '09/11/2026', status: 'Trong kho' },
      { name: 'KEG-0007', beer: 'Bia hơi Hà Nội', capacity: '50 L', cost: 1200000, date: '06/11/2026', status: 'Đã hết' }
    ] }]
  },
  happyHours: {
    title: 'Giá giờ vàng',
    subtitle: 'FR-15 · Thiết lập khung giờ và giá ưu đãi',
    tabs: [{ id: 'happy-hours', label: 'Khung giờ', columns: ['Tên chương trình', 'Ngày áp dụng', 'Thời gian', 'Món áp dụng', 'Giá ưu đãi', 'Trạng thái'], fields: [['Tên chương trình', 'name'], ['Ngày áp dụng (vd: T2–T6)', 'days'], ['Bắt đầu', 'start', 'time'], ['Kết thúc', 'end', 'time'], ['Món áp dụng', 'item'], ['Giá ưu đãi (₫)', 'price', 'number'], ['Trạng thái', 'status', 'select', ['Đang bật', 'Đã tắt']]], rows: [
      { name: 'Ưu đãi đầu giờ', days: 'Thứ 2 – Thứ 6', start: '16:00', end: '18:00', item: 'Bia hơi cốc 0,5L', price: 12000, status: 'Đang bật' },
      { name: 'Giờ vàng cuối tuần', days: 'Thứ 7 – Chủ nhật', start: '14:00', end: '16:00', item: 'Bia hơi ca 1,5L', price: 38000, status: 'Đã tắt' }
    ] }]
  },
  voids: {
    title: 'Nhật ký hủy / giảm',
    subtitle: 'FR-18 · Theo dõi thao tác điều chỉnh món và hóa đơn',
    tabs: [{ id: 'voids', label: 'Nhật ký', columns: ['Thời gian', 'Bàn', 'Món', 'Số lượng', 'Số tiền', 'Loại', 'Lý do', 'Người yêu cầu / duyệt'], fields: [], rows: [
      { name: '10/11/2026 16:42', table: 'Bàn 12', item: 'Khoai tây chiên', quantity: '−1', amount: 45000, type: 'Hủy', reason: 'Khách đổi ý', staff: 'Minh Anh / Hoàng Nam' },
      { name: '10/11/2026 15:18', table: 'Bàn 08', item: 'Mực nướng', quantity: '−10%', amount: 13500, type: 'Giảm giá', reason: 'Món lỗi', staff: 'Minh Anh / Hoàng Nam' },
      { name: '10/11/2026 14:06', table: 'Bàn 23', item: 'Hóa đơn', quantity: '−5%', amount: 32000, type: 'Giảm hóa đơn', reason: 'Chăm sóc khách', staff: 'Hoàng Nam / —' }
    ] }]
  },
  topItems: {
    title: 'Món bán chạy & giờ cao điểm',
    subtitle: 'FR-19 · Thống kê theo thời điểm thanh toán (tối đa 31 ngày)',
    tabs: [{ id: 'top-items', label: 'Báo cáo', columns: ['#', 'Món', 'Số lượng', 'Doanh thu', 'Tỷ trọng'], fields: [], rows: [
      { rank: 1, name: 'Bia hơi cốc 0,5L', quantity: '1.284', amount: 19260000, share: '26%' },
      { rank: 2, name: 'Mực nướng', quantity: '186', amount: 25110000, share: '18%' },
      { rank: 3, name: 'Bia hơi ca 1,5L', quantity: '430', amount: 18060000, share: '16%' },
      { rank: 4, name: 'Đậu phụ chiên', quantity: '302', amount: 13590000, share: '12%' },
      { rank: 5, name: 'Dồi sụn nướng', quantity: '144', amount: 12240000, share: '9%' },
      { rank: 6, name: 'Ngô chiên bơ', quantity: '212', amount: 11660000, share: '8%' },
      { rank: 7, name: 'Lạc rang', quantity: '408', amount: 10200000, share: '7%' },
      { rank: 8, name: 'Bia hơi tháp 3L', quantity: '52', amount: 9360000, share: '6%' },
      { rank: 9, name: 'Nem chua rán', quantity: '118', amount: 8260000, share: '5%' },
      { rank: 10, name: 'Dưa chuột', quantity: '154', amount: 6160000, share: '3%' }
    ] }]
  }
};

const displayValue = (value) => typeof value === 'number' && value >= 1000 ? money(value) : value;
const tableFields = {
  items: ['name', 'shortcut', 'category', 'price', 'station', 'status'],
  groups: ['name', 'order', 'count', 'status'],
  stations: ['name', 'count', 'status'],
  areas: ['name', 'tables', 'order', 'status'],
  tables: ['name', 'area', 'capacity', 'status'],
  staff: ['name', 'email', 'role', 'status'],
  kegs: ['name', 'beer', 'capacity', 'cost', 'date', 'status'],
  'happy-hours': ['name', 'days', 'hours', 'item', 'price', 'status'],
  voids: ['name', 'table', 'item', 'quantity', 'amount', 'type', 'reason', 'staff'],
  'top-items': ['rank', 'name', 'quantity', 'amount', 'share']
};

export function FRPage({ view, user, shiftOpen, setShiftOpen, onToast }) {
  if (view === 'shifts') return <ShiftPage user={user} isOpen={shiftOpen} setIsOpen={setShiftOpen} onToast={onToast} />;
  if (view === 'taps') return <TapPage onToast={onToast} />;
  if (view === 'kegLoss') return <KegLossPage />;
  const config = datasets[view];
  if (config) return <RecordsPage key={view} config={config} onToast={onToast} filters={view === 'topItems' || view === 'voids'} />;
  return <ReportsPage />;
}

function PageHeading({ title, subtitle, action }) {
  return <div className="page-heading"><div><span className="eyebrow">Giao diện theo đặc tả</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function RecordsPage({ config, onToast, filters = false }) {
  const [tabId, setTabId] = useState(config.tabs[0].id);
  const [records, setRecords] = useState(() => Object.fromEntries(config.tabs.map((tab) => [tab.id, tab.rows])));
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('quantity');
  const [dateError, setDateError] = useState('');
  const activeTab = config.tabs.find((tab) => tab.id === tabId);
  const visibleRecords = useMemo(() => {
    const filtered = records[tabId].filter((record) => Object.values(record).join(' ').toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
    if (config.title.includes('Món bán')) {
      const numericValue = (record) => sortBy === 'quantity' ? Number(String(record[sortBy]).replaceAll('.', '')) : Number(record[sortBy]);
      return filtered.slice().sort((left, right) => numericValue(right) - numericValue(left));
    }
    return filtered;
  }, [config.title, query, records, sortBy, tabId]);

  const saveRecord = (record) => {
    setRecords((current) => {
      const currentRows = current[tabId];
      if (editing?.index !== undefined) return { ...current, [tabId]: currentRows.map((row, index) => index === editing.index ? { ...row, ...record } : row) };
      return { ...current, [tabId]: [{ ...record, status: record.status || 'Đang dùng' }, ...currentRows] };
    });
    onToast(editing?.index !== undefined ? 'Đã cập nhật dữ liệu giao diện.' : 'Đã thêm dữ liệu mẫu.');
    setEditing(null);
  };

  return <main className="page-content feature-content">
    <PageHeading title={config.title} subtitle={config.subtitle} action={activeTab.fields.length > 0 && <button className="button-primary" type="button" onClick={() => setEditing({})}><i className="icon fa-solid fa-plus" aria-hidden="true" />Thêm mới</button>} />
    {filters && <div className="feature-filters panel">{config.title.includes('Món bán') ? <>
      <label>Từ ngày<input id="report-from" type="date" defaultValue="2026-11-01" onChange={() => validateReportPeriod(setDateError)} /></label><label>Đến ngày<input id="report-to" type="date" defaultValue="2026-11-10" onChange={() => validateReportPeriod(setDateError)} /></label><label>Xếp theo<select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="quantity">Số lượng</option><option value="amount">Doanh thu</option></select></label><p className="form-error" role="alert">{dateError}</p>
    </> : <>
      <label>Từ ngày<input type="date" defaultValue="2026-11-01" /></label><label>Đến ngày<input type="date" defaultValue="2026-11-10" /></label><label>Nhân viên<input type="search" placeholder="Tất cả" /></label><label>Người duyệt<input type="search" placeholder="Tất cả" /></label><label>Lý do<select defaultValue=""><option value="">Tất cả lý do</option>{['Khách đổi ý', 'Bếp hết món', 'Nhập nhầm', 'Món lỗi', 'Khác'].map((reason) => <option key={reason}>{reason}</option>)}</select></label>
    </>}</div>}
    {config.title.includes('Nhật ký') && <section className="report-metrics"><Metric label="Số lần hủy / giảm" value="3" /><Metric label="Tổng tiền điều chỉnh" value={money(90500)} /><Metric label="Người yêu cầu" value="2 nhân viên" /><Metric label="Khoảng thời gian" value="01/11 – 10/11" /></section>}
    {config.title.includes('Món bán') && <TopItemsCharts />}
    {config.title.includes('Nhân viên') && <p className="feature-note">Mật khẩu và PIN chỉ nhập khi tạo mới/đặt lại. Bản demo không lưu thông tin bí mật; backend cần băm bcrypt, chặn tự khóa và bảo vệ chủ quán cuối cùng.</p>}
    <section className="panel feature-panel">
      {config.tabs.length > 1 && <div className="feature-tabs" role="tablist">{config.tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === tabId} className={tab.id === tabId ? 'is-active' : ''} onClick={() => setTabId(tab.id)}>{tab.label}</button>)}</div>}
      <header className="panel-header"><div><h2 className="panel-title">{activeTab.label}</h2><div className="panel-subtitle">{visibleRecords.length} bản ghi · Dữ liệu minh họa</div></div><label className="search-box"><i className="icon fa-solid fa-magnifying-glass" aria-hidden="true" /><span className="sr-only">Tìm kiếm</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm..." /></label></header>
      <div className="table-wrap"><table><thead><tr>{activeTab.columns.map((column) => <th key={column}>{column}</th>)}{activeTab.fields.length > 0 && <th>Thao tác</th>}</tr></thead><tbody>
        {visibleRecords.map((record, rowIndex) => {
          const index = records[tabId].indexOf(record);
          const keys = tableFields[tabId] || Object.keys(record);
          return <tr key={`${tabId}-${index}`}>{keys.map((key) => <td key={key}>{key === 'hours' ? `${record.start} – ${record.end}` : key === 'rank' ? rowIndex + 1 : displayValue(record[key])}</td>)}{activeTab.fields.length > 0 && <td><button className="text-button" type="button" onClick={() => setEditing({ index, record })}>Sửa</button></td>}</tr>;
        })}
        {!visibleRecords.length && <tr><td className="empty-state" colSpan={activeTab.columns.length + 1}>Không có dữ liệu phù hợp.</td></tr>}
      </tbody></table></div>
      {editing && <RecordDialog key={editing.index ?? 'new'} title={editing.record ? 'Cập nhật' : `Thêm ${activeTab.label.toLocaleLowerCase('vi')}`} fields={activeTab.fields} initial={editing.record} onClose={() => setEditing(null)} onSave={saveRecord} />}
    </section>
  </main>;
}

function RecordDialog({ title, fields, initial = {}, onClose, onSave }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    fields.forEach(([, key, type]) => {
      if (type === 'number') values[key] = Number(values[key]);
    });
    onSave(values);
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="record-title">
      <header className="modal-header"><h2 id="record-title">{title}</h2><button className="modal-close" type="button" onClick={onClose} aria-label="Đóng"><i className="icon fa-solid fa-xmark" /></button></header>
      <form onSubmit={handleSubmit}>
        <div className="modal-body feature-form">{fields.map(([label, name, type, options]) => <label className="modal-field" key={name}>
          <span>{label}</span>
          {type === 'select'
            ? <select name={name} defaultValue={initial[name] || options[0]}>{options.map((option) => <option key={option}>{option}</option>)}</select>
            : <input name={name} type={type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'time' ? 'time' : type === 'password' ? 'password' : 'text'} defaultValue={initial[name] ?? ''} required={name !== 'password' && name !== 'pin'} />}
        </label>)}</div>
        <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Hủy</button><button className="button-primary" type="submit">Lưu</button></footer>
      </form>
    </section>
  </div>;
}

function validateReportPeriod(setError) {
  const from = document.getElementById('report-from')?.value;
  const to = document.getElementById('report-to')?.value;
  if (!from || !to) return;
  const days = (new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000;
  setError(days < 0 ? 'Ngày bắt đầu phải trước ngày kết thúc.' : days > 30 ? 'Khoảng ngày không được vượt quá 31 ngày.' : '');
}

function TopItemsCharts() {
  const amounts = [91, 82, 74, 65, 58, 49, 42, 34, 26, 19];
  return <div className="report-grid feature-report-grid">
    <section className="panel report-panel"><header className="panel-header"><div><h2 className="panel-title">Top 10 món bán chạy</h2><div className="panel-subtitle">Biểu đồ theo số lượng hoặc doanh thu</div></div></header><div className="top-item-bars">{amounts.map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{index + 1}</small></div>)}</div></section>
    <section className="panel report-panel"><header className="panel-header"><div><h2 className="panel-title">Doanh thu theo giờ</h2><div className="panel-subtitle">Tính theo thời điểm thanh toán</div></div></header><div className="feature-hour-bars">{[20, 25, 30, 48, 62, 82, 92, 75, 58, 36, 20, 10].map((height, index) => <div className="feature-hour-group" key={index}><span style={{ height: `${height}%` }} /></div>)}</div><div className="chart-labels report-labels"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span></div></section>
  </div>;
}

function ShiftPage({ user, isOpen, setIsOpen, onToast }) {
  const [countedCash, setCountedCash] = useState('');
  const expectedCash = 2500000 + 6820000;
  return <main className="page-content feature-content"><PageHeading title="Mở / đóng ca" subtitle="FR-09 · Theo dõi tiền đầu ca, doanh thu và chênh lệch" action={<span className={`status-pill${isOpen ? '' : ' pending'}`}>{isOpen ? 'Ca đang mở' : 'Chưa mở ca'}</span>} />
    <section className="report-metrics"><Metric label="Tiền đầu ca" value={money(isOpen ? 2500000 : 0)} /><Metric label="Tiền mặt thu trong ca" value={money(isOpen ? 6820000 : 0)} /><Metric label="Chuyển khoản" value={money(isOpen ? 4380000 : 0)} /><Metric label="Hóa đơn" value={isOpen ? '42' : '0'} /></section>
    <section className="panel shift-page-card"><header className="panel-header"><div><h2 className="panel-title">Ca chiều · 14:00 – hiện tại</h2><div className="panel-subtitle">Nhân viên: Nguyễn Minh Anh · Quản lý: Trần Hoàng Nam</div></div>{!isOpen ? <button className="button-primary" type="button" onClick={() => { setIsOpen(true); onToast('Đã mở ca demo.'); }}>Mở ca</button> : ['manager', 'owner'].includes(user.role) && <button className="button-secondary" type="button" onClick={() => { setIsOpen(false); onToast('Đã đóng ca demo.'); }}>Đóng ca</button>}</header>
      {isOpen && <div className="shift-close-form"><label className="modal-field"><span>Tiền mặt đếm được (₫)</span><input type="number" min="0" value={countedCash} onChange={(event) => setCountedCash(event.target.value)} placeholder="Nhập số tiền trong két" /></label><div className="shift-difference"><span>Dự kiến trong két: <strong>{money(expectedCash)}</strong></span><span>Chênh lệch: <strong>{money((Number(countedCash) || 0) - expectedCash)}</strong></span></div>{user.role === 'staff' && <p className="form-hint">Chỉ Quản lý ca hoặc Chủ quán mới có thể đóng ca.</p>}</div>}
    </section>
  </main>;
}

function TapPage({ onToast }) {
  const [taps, setTaps] = useState([{ name: 'Vòi 1', keg: 'KEG-0008', beer: 'Bia hơi Hà Nội', sold: 46, capacity: 50 }, { name: 'Vòi 2', keg: 'KEG-0006', beer: 'Bia hơi Hải Phòng', sold: 27, capacity: 30 }, { name: 'Vòi 3', keg: 'Chưa gắn keg', beer: '—', sold: 0, capacity: 50 }]);
  const [confirmTap, setConfirmTap] = useState(null);
  const replaceTap = (index) => {
    setTaps((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, keg: `KEG-00${11 + itemIndex}`, sold: 0 } : item));
    setConfirmTap(null);
    onToast('Đã cập nhật keg demo cho vòi.');
  };
  return <main className="page-content feature-content"><PageHeading title="Vòi bia & thay keg" subtitle="FR-10 · Theo dõi keg đang dùng và thể tích bia đã bán" />
    <div className="tap-grid">{taps.map((tap, index) => <article className="panel tap-card" key={tap.name}><header><span className="tap-icon"><i className="icon fa-solid fa-beer-mug-empty" /></span><div><h2>{tap.name}</h2><p>{tap.beer} · {tap.keg}</p></div><span className="status-pill">{tap.keg === 'Chưa gắn keg' ? 'Sẵn sàng' : 'Đang dùng'}</span></header><div className="tap-progress-label"><span>Đã bán</span><strong>{tap.sold} / {tap.capacity} L</strong></div><div className="tap-progress"><span style={{ width: `${Math.min(100, tap.sold / tap.capacity * 100)}%` }} /></div><div className="tap-card-footer"><span>Còn khoảng {Math.max(0, tap.capacity - tap.sold)} L</span><button className="button-secondary" type="button" onClick={() => tap.sold / tap.capacity < .9 ? setConfirmTap(index) : replaceTap(index)}>Thay keg</button></div></article>)}</div>
    {confirmTap !== null && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="tap-confirm-title"><header className="modal-header"><h2 id="tap-confirm-title">Xác nhận thay keg</h2><button className="modal-close" type="button" onClick={() => setConfirmTap(null)} aria-label="Đóng"><i className="icon fa-solid fa-xmark" /></button></header><div className="modal-body"><p>Keg mới bán {Math.round(taps[confirmTap].sold / taps[confirmTap].capacity * 100)}% dung tích. Phần bia còn lại sẽ được tính là hao hụt.</p></div><footer className="modal-footer"><button className="button-secondary" type="button" onClick={() => setConfirmTap(null)}>Hủy</button><button className="button-primary" type="button" onClick={() => replaceTap(confirmTap)}>Xác nhận thay</button></footer></section></div>}
  </main>;
}

function KegLossPage() {
  const [threshold, setThreshold] = useState('5');
  return <main className="page-content feature-content"><PageHeading title="Hao hụt keg" subtitle="FR-17 · Đối chiếu lượng bia xuất keg và lượng bán ra" />
    <div className="feature-filters panel"><label>Từ ngày<input type="date" defaultValue="2026-11-01" /></label><label>Đến ngày<input type="date" defaultValue="2026-11-10" /></label><label>Ngưỡng cảnh báo (%)<input type="number" min="0" max="100" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></label><button className="button-primary" type="button">Lọc báo cáo</button></div>
    <section className="report-metrics"><Metric label="Tổng hao hụt" value="6,5 L" /><Metric label="Giá trị ước tính" value={money(195000)} /><Metric label="Keg đã hết" value="4" /><Metric label="Ngưỡng cảnh báo" value={`${threshold}%`} /></section>
    <DataTable columns={['Mã keg', 'Loại bia', 'Vòi', 'Dung tích', 'Đã bán', 'Hao hụt', 'Tỷ lệ', 'Trạng thái']} rows={[
      ['KEG-0007', 'Bia hơi Hà Nội', 'Vòi 1', '50 L', '46 L', '4 L', '8%', 'Cảnh báo'],
      ['KEG-0005', 'Bia hơi Hải Phòng', 'Vòi 2', '30 L', '28,8 L', '1,2 L', '4%', 'Bình thường'],
      ['KEG-0004', 'Bia hơi Hà Nội', 'Vòi 1', '50 L', '48,5 L', '1,5 L', '3%', 'Bình thường']
    ]} />
  </main>;
}

function ReportsPage() {
  return <main className="page-content reports-content"><PageHeading title="Tổng quan hôm nay" subtitle="FR-16 · Doanh thu đã thu, tạm tính và tình hình hoạt động" action={<span className="report-updated">Cập nhật lúc 17:30 · Dữ liệu minh họa</span>} />
    <section className="report-metrics"><Metric label="Doanh thu đã thu" value={money(12840000)} change="+8,4% so cùng giờ hôm qua" /><Metric label="Tạm tính đang mở" value={money(6420000)} change="6 bàn" /><Metric label="Bàn đang ngồi" value="25 / 80" change="31% công suất" /><Metric label="Số hóa đơn" value="42" change="+5,2% so cùng giờ hôm qua" /></section>
    <div className="report-grid"><section className="panel report-panel"><header className="panel-header"><div><h2 className="panel-title">Doanh thu theo giờ</h2><div className="panel-subtitle">Hôm nay so với cùng giờ hôm qua</div></div></header><div className="feature-hour-bars">{[38, 51, 42, 69, 54, 82, 63, 91, 72, 48, 34, 20].map((height, index) => <div className="feature-hour-group" key={index}><span style={{ height: `${height}%` }} /><i style={{ height: `${height * .65}%` }} /></div>)}</div><div className="report-legend"><span>● Hôm nay</span><span>● Hôm qua</span></div></section><section className="panel payment-panel"><header className="panel-header"><div><h2 className="panel-title">Phương thức thanh toán</h2><div className="panel-subtitle">Tỷ lệ doanh thu đã thu</div></div></header><div className="payment-breakdown feature-breakdown"><div><span>Tiền mặt</span><strong>68% · {money(8731200)}</strong></div><div><span>Chuyển khoản</span><strong>32% · {money(4108800)}</strong></div></div></section></div>
  </main>;
}

function Metric({ label, value, change }) {
  return <article className="metric-card"><div className="metric-top">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{change || 'Dữ liệu minh họa'}</div></article>;
}

function DataTable({ columns, rows }) {
  return <section className="panel feature-panel"><header className="panel-header"><div><h2 className="panel-title">Chi tiết theo keg</h2><div className="panel-subtitle">Dữ liệu minh họa</div></div></header><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell}>{value}</td>)}</tr>)}</tbody></table></div></section>;
}
