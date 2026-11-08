import { cacheService } from './cache-service.js';

const STORAGE_KEY = 'dashboard-data';
const DEMO_DATA = {
  products: [
    { id: 'p1', name: 'Bia Saigon Lager', category: 'Lon 330ml', stock: 48, capacity: 80, price: 18000 },
    { id: 'p2', name: 'Heineken Silver', category: 'Lon 330ml', stock: 31, capacity: 60, price: 22000 },
    { id: 'p3', name: 'Tiger Crystal', category: 'Lon 330ml', stock: 8, capacity: 50, price: 20000 },
    { id: 'p4', name: 'Bia 333', category: 'Lon 330ml', stock: 24, capacity: 50, price: 16000 }
  ],
  orders: [
    { id: 'DH-1048', customer: 'Lê Quốc Bảo', items: 6, amount: 132000, time: '2026-11-08T14:32:00', status: 'Hoàn tất', staff: 'Minh Anh' },
    { id: 'DH-1047', customer: 'Phạm Thu Hà', items: 4, amount: 80000, time: '2026-11-08T14:18:00', status: 'Hoàn tất', staff: 'Minh Anh' },
    { id: 'DH-1046', customer: 'Nguyễn Đức Long', items: 12, amount: 228000, time: '2026-11-08T14:05:00', status: 'Đang xử lý', staff: 'Hoàng Nam' },
    { id: 'DH-1045', customer: 'Trần Mai Chi', items: 3, amount: 66000, time: '2026-11-08T13:46:00', status: 'Hoàn tất', staff: 'Minh Anh' },
    { id: 'DH-1044', customer: 'Đỗ Thanh Tùng', items: 8, amount: 160000, time: '2026-11-08T13:29:00', status: 'Hoàn tất', staff: 'Hoàng Nam' }
  ]
};

const getData = () => cacheService.get(STORAGE_KEY, DEMO_DATA);

export const sheetApi = {
  async getDashboard() {
    return getData();
  },
  async createOrder(order) {
    const data = getData();
    const created = { ...order, id: `DH-${1049 + data.orders.length - DEMO_DATA.orders.length}`, time: new Date().toISOString(), status: 'Hoàn tất' };
    data.orders.unshift(created);
    cacheService.set(STORAGE_KEY, data);
    return created;
  },
  async updateStock(productId, quantity) {
    const data = getData();
    const product = data.products.find((item) => item.id === productId);
    if (!product) throw new Error('Không tìm thấy sản phẩm.');
    product.stock = Math.max(0, Number(quantity));
    cacheService.set(STORAGE_KEY, data);
    return product;
  }
};