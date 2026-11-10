import { cacheService } from './cache-service.js';

const STORAGE_KEY = 'pos-demo-data';
const AREAS = [
  { id: 'inside', name: 'Trong nhà', firstTable: 1, count: 30 },
  { id: 'yard', name: 'Sân vườn', firstTable: 31, count: 30 },
  { id: 'upstairs', name: 'Tầng 2', firstTable: 61, count: 20 }
];

export const MENU = [
  { id: 'beer-glass', name: 'Bia hơi cốc', category: 'Bia', price: 15000, station: 'Đồ uống' },
  { id: 'beer-pitcher', name: 'Bia hơi ca', category: 'Bia', price: 42000, station: 'Đồ uống' },
  { id: 'beer-tower', name: 'Tháp bia 3L', category: 'Bia', price: 180000, station: 'Đồ uống' },
  { id: 'grilled-squid', name: 'Mực nướng', category: 'Đồ nướng', price: 135000, station: 'Bếp nướng' },
  { id: 'grilled-sausage', name: 'Dồi sụn nướng', category: 'Đồ nướng', price: 85000, station: 'Bếp nướng' },
  { id: 'fried-tofu', name: 'Đậu phụ chiên', category: 'Đồ chiên', price: 45000, station: 'Bếp chiên' },
  { id: 'fried-corn', name: 'Ngô chiên bơ', category: 'Đồ chiên', price: 55000, station: 'Bếp chiên' },
  { id: 'peanuts', name: 'Lạc rang', category: 'Đồ nhắm', price: 25000, station: 'Bếp lạnh' }
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
    return data || save(createInitialData());
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
  closeTable(tableId) {
    const data = this.getData();
    const table = data.tables.find((item) => item.id === tableId);
    if (!table || table.status === 'empty') throw new Error('Phiên bàn không còn mở.');
    Object.assign(table, { status: 'empty', guestCount: 0, openedAt: null, total: 0, rounds: [], provisionalCount: 0 });
    return save(data);
  }
};
