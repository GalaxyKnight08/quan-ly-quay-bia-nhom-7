import { mockLogin } from './auth.ts';
import { getStoredSession } from '../lib/storage.ts';
import { posService, MENU } from './tabs.ts';
import type { ReportKegLoss, ReportSummary, ReportTopItems, ReportVoid } from '../types/index.ts';

const adminResources = new Set(['menu', 'areas', 'staff', 'kegs', 'happy-hours', 'taps', 'shifts']);

const reportSummary: ReportSummary = {
  revenue: 12840000,
  openAmount: 6420000,
  occupiedTables: 25,
  totalTables: 80,
  bills: 42
};

const kegLoss: ReportKegLoss = {
  totalLossLiters: 6.5,
  totalLossAmount: 195000,
  kegs: [
    { code: 'KEG-0007', beerName: 'Bia hơi Hà Nội', tapName: 'Vòi 1', capacityMl: 50000, soldMl: 46000, lossMl: 4000, lossPercent: 8, overThreshold: true },
    { code: 'KEG-0005', beerName: 'Bia hơi Hải Phòng', tapName: 'Vòi 2', capacityMl: 30000, soldMl: 28800, lossMl: 1200, lossPercent: 4, overThreshold: false }
  ]
};

const voids: ReportVoid[] = [
  { id: 1, table: 'Bàn 12', item: 'Khoai tây chiên', quantity: -1, amount: 45000, reason: 'Khách đổi ý' },
  { id: 2, table: 'Bàn 08', item: 'Mực nướng', quantity: '-10%', amount: 13500, reason: 'Món lỗi' }
];

const topItems: ReportTopItems[] = [
  { id: 1, name: 'Bia hơi cốc 0,5L', quantity: 1284, revenue: 19260000 },
  { id: 2, name: 'Mực nướng', quantity: 186, revenue: 25110000 },
  { id: 3, name: 'Bia hơi ca 1,5L', quantity: 430, revenue: 18060000 }
];

function parseBody(options: RequestInit) {
  return typeof options.body === 'string' ? JSON.parse(options.body) as Record<string, unknown> : {};
}

export async function mockApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = parseBody(options);
  let result: unknown;

  if (path === '/auth/login' && method === 'POST') {
    result = await mockLogin(String(body.email ?? ''), String(body.password ?? ''));
  } else if (path === '/auth/me' && method === 'GET') {
    result = getStoredSession()?.user ?? null;
  } else if (path.startsWith('/reports/today')) {
    result = reportSummary;
  } else if (path.startsWith('/reports/keg-loss')) {
    result = kegLoss;
  } else if (path.startsWith('/reports/voids')) {
    result = voids;
  } else if (path.startsWith('/reports/top-items')) {
    result = topItems;
  } else if (path.startsWith('/reports/hourly')) {
    result = Array.from({ length: 12 }, (_, hour) => ({ hour: hour + 9, revenue: (hour + 1) * 125000 }));
  } else if (path.startsWith('/menu')) {
    result = MENU;
  } else if (path.startsWith('/areas')) {
    result = posService.getData().areas.map((area) => ({
      id: area.id,
      name: area.name,
      tables: posService.getData().tables.filter((table) => table.areaId === area.id).map((table) => ({ id: table.id, code: String(table.id) }))
    }));
  } else if (path === '/tabs/summary') {
    result = {
      tables: posService.getData().tables.map((table) => ({
        tableId: table.id,
        areaId: table.areaId,
        code: String(table.id),
        status: table.status === 'empty' ? 'EMPTY' : table.status === 'provisional' ? 'PROVISIONAL_PRINTED' : 'OCCUPIED',
        total: table.total,
        openedAt: table.openedAt,
        guestCount: table.guestCount,
        rounds: table.rounds
      }))
    };
  } else if (adminResources.has(path.slice(1)) && method === 'GET') {
    result = [];
  } else {
    throw new Error(`Mock API route is not implemented: ${method} ${path}`);
  }

  return result as T;
}
