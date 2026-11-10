import { cacheService } from './cache-service.js';

const STORAGE_KEY = 'pos-demo-data';
const AREAS = [
  { id: 'inside', name: 'Trong nhà', firstTable: 1, count: 30 },
  { id: 'yard', name: 'Sân vườn', firstTable: 31, count: 30 },
  { id: 'upstairs', name: 'Tầng 2', firstTable: 61, count: 20 }
];

export const MENU = [
  { id: 'beer-glass', shortcut: 'b', name: 'Bia hơi cốc', category: 'Bia', price: 15000, station: 'Đồ uống' },
  { id: 'beer-pitcher', shortcut: 'bc', name: 'Bia hơi ca', category: 'Bia', price: 42000, station: 'Đồ uống' },
  { id: 'beer-tower', shortcut: 'tb', name: 'Tháp bia 3L', category: 'Bia', price: 180000, station: 'Đồ uống' },
  { id: 'grilled-squid', shortcut: 'mn', name: 'Mực nướng', category: 'Đồ nướng', price: 135000, station: 'Bếp nướng' },
  { id: 'grilled-sausage', shortcut: 'dn', name: 'Dồi sụn nướng', category: 'Đồ nướng', price: 85000, station: 'Bếp nướng' },
  { id: 'fried-tofu', shortcut: 'dp', name: 'Đậu phụ chiên', category: 'Đồ chiên', price: 45000, station: 'Bếp chiên' },
  { id: 'fried-corn', shortcut: 'nc', name: 'Ngô chiên bơ', category: 'Đồ chiên', price: 55000, station: 'Bếp chiên' },
  { id: 'peanuts', shortcut: 'lr', name: 'Lạc rang', category: 'Đồ nhắm', price: 25000, station: 'Bếp lạnh' }
];

const createInitialData = () => {
  const tables = AREAS.flatMap((area) => Array.from({ length: area.count }, (_, index) => {
    const number = area.firstTable + index;
    const isOccupied = number <= 25;
    return {
      id: number,
      areaId: area.id,
      status: !isOccupied ? 'empty' : number > 20 ? 'provisional' : 'occupied',
      guestCount: isOccupied ? (number % 5) + 2 : 0,
      openedAt: isOccupied ? new Date(Date.now() - (number % 90 + 15) * 60000).toISOString() : null,
      total: isOccupied ? 150000 + (number - 1) * 8900 : 0,
      rounds: []
    };
  }));
  return { areas: AREAS, tables };
};

const save = (data) => {
  cacheService.set(STORAGE_KEY, data);
  return data;
};

export const posService = {
  getData() {
    const data = cacheService.get(STORAGE_KEY);
    if (!data) return save({ ...createInitialData(), completedBills: [] });
    if (!data.completedBills) {
      data.completedBills = [];
      return save(data);
    }
    return data;
  },
  openTable(tableId, guestCount) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    if (!table) throw new Error('Không tìm thấy bàn.');
    if (table.status !== 'empty') throw new Error('Bàn đã được mở.');
    table.status = 'occupied';
    table.guestCount = guestCount;
    table.openedAt = new Date().toISOString();
    table.total = 0;
    table.rounds = [];
    return save(data);
  },
  addRound(tableId, lines, staffName) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    if (!table || table.status === 'empty') throw new Error('Phiên bàn không còn mở.');
    if (!lines.length) throw new Error('Chưa có món trong lượt đang nhập.');
    const round = {
      id: `${Date.now()}`,
      sentAt: new Date().toISOString(),
      staffName,
      lines: lines.map((line) => ({ ...line, price: MENU.find((item) => item.id === line.id).price }))
    };
    table.rounds.push(round);
    table.total += round.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return save(data);
  },
  markProvisional(tableId) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    if (!table || table.status === 'empty') throw new Error('Phiên bàn không còn mở.');
    table.status = 'provisional';
    table.provisionalCount = (table.provisionalCount || 0) + 1;
    return save(data);
  },
  moveTable(sourceId, targetId, merge = false) {
    const data = this.getData();
    const source = data.tables.find((item) => item.id === sourceId);
    const target = data.tables.find((item) => item.id === targetId);
    if (!source || !target || source.status === 'empty') throw new Error('Không tìm thấy phiên bàn cần chuyển.');
    if (sourceId === targetId) throw new Error('Vui lòng chọn bàn khác.');
    if (merge && target.status === 'empty') throw new Error('Bàn đích đang trống, hãy dùng Chuyển bàn.');
    if (!merge && target.status !== 'empty') throw new Error('Bàn đích đang có khách, hãy dùng Gộp bàn.');
    if (merge) {
      target.rounds = [...target.rounds, ...source.rounds];
      target.total += source.total;
      target.guestCount = (target.guestCount || 0) + (source.guestCount || 0);
    } else {
      Object.assign(target, { ...source, id: target.id, areaId: target.areaId });
    }
    Object.assign(source, { status: 'empty', guestCount: 0, openedAt: null, total: 0, rounds: [], provisionalCount: 0 });
    return save(data);
  },
  adjustOrderLine(tableId, roundId, lineId, action, quantity, discountAmount = 0) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    const round = table?.rounds.find((item) => item.id === roundId);
    const line = round?.lines.find((item) => item.id === lineId && !item.adjustment);
    if (!line) throw new Error('Không tìm thấy món đã gửi.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > line.quantity) throw new Error('Số lượng điều chỉnh không hợp lệ.');
    if (action === 'void') {
      line.quantity -= quantity;
      table.total = Math.max(0, table.total - line.price * quantity);
      round.lines.push({ id: `void-${Date.now()}`, name: `Hủy: ${line.name}`, quantity: -quantity, price: line.price, adjustment: true });
    } else {
      const amount = Math.min(Math.max(0, discountAmount), line.price * quantity);
      if (!amount) throw new Error('Số tiền giảm phải lớn hơn 0.');
      table.total = Math.max(0, table.total - amount);
      round.lines.push({ id: `discount-${Date.now()}`, name: `Giảm: ${line.name}`, quantity: -1, price: amount, adjustment: true });
    }
    return save(data);
  },
  closeTable(tableId, payment = {}) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    if (!table || table.status === 'empty') throw new Error('Phiên bàn không còn mở.');
    const paidAt = new Date().toISOString();
    data.completedBills.unshift({
      billNo: `HD-${Date.now()}`,
      tableId,
      paidAt,
      subtotal: payment.subtotal ?? table.total,
      discount: payment.discount ?? 0,
      total: payment.total ?? table.total,
      change: payment.change ?? 0,
      payments: payment.payments ?? [],
      lines: table.rounds.flatMap((round) => round.lines.map((line) => ({ ...line })))
    });
    Object.assign(table, { status: 'empty', guestCount: 0, openedAt: null, total: 0, rounds: [], provisionalCount: 0 });
    return save(data);
  }
};
