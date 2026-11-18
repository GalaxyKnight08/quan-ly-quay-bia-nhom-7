import { formatMoney, formatTime } from '../../lib/format.ts';
import { Modal } from '../shared/Modal.tsx';
import type { CompletedBill } from '../../types/index.ts';

export function PrintReceipt({ receipt, onClose }: { receipt: CompletedBill; onClose: () => void }) {
  return <Modal title="Hóa đơn thanh toán" onClose={onClose}>
    <div className="modal-body receipt-body">
      <div className="receipt-head"><strong>{receipt.billNo}</strong><span>Bàn {receipt.tableId} · {formatTime(receipt.paidAt)}</span></div>
      <div className="receipt-lines">{receipt.lines.map((line, index) => <div className="receipt-line" key={`${line.id}-${index}`}><span>{line.name} × {Math.abs(line.quantity)}</span><strong>{line.adjustment ? 'Điều chỉnh' : formatMoney(line.price * line.quantity)}</strong></div>)}</div>
      <div className="receipt-total"><span>Tạm tính</span><strong>{formatMoney(receipt.subtotal)}</strong></div>
      {receipt.discount > 0 && <div className="receipt-total"><span>Giảm giá</span><strong>−{formatMoney(receipt.discount)}</strong></div>}
      <div className="receipt-total grand"><span>Đã thanh toán</span><strong>{formatMoney(receipt.total)}</strong></div>
      {receipt.payments.map((payment) => <div className="receipt-total" key={payment.method}><span>{payment.method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span><strong>{formatMoney(payment.amount)}</strong></div>)}
      <div className="receipt-total"><span>Tiền thừa</span><strong>{formatMoney(receipt.change)}</strong></div>
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Đóng</button><button className="button-primary" type="button" onClick={() => window.print()}><i className="icon fa-solid fa-print" />In hóa đơn</button></footer>
  </Modal>;
}
