import { useEffect, useState } from 'react';
import { formatMoney, formatTime } from '../../lib/format.ts';
import { Modal } from '../shared/Modal.tsx';
import { PrintSurface } from './PrintSurface.tsx';
import { groupReceiptLines, type ReceiptLine } from './receiptLines.ts';
import type { CompletedBill } from '../../types/index.ts';

function ReceiptDocument({ receipt, lines }: { receipt: CompletedBill; lines: ReceiptLine[] }) {
  return <>
    <header className="receipt-head"><strong>{receipt.billNo}</strong><span>Bàn {receipt.tableId} · {formatTime(receipt.paidAt)}</span></header>
    <div className="receipt-lines">{lines.map((line, index) => <div className="receipt-line" key={`${line.name}-${index}`}><span>{line.name} × {line.quantity}</span><strong>{formatMoney(line.total)}</strong></div>)}</div>
    <div className="receipt-total"><span>Tạm tính</span><strong>{formatMoney(receipt.subtotal)}</strong></div>
    {receipt.discount > 0 && <div className="receipt-total"><span>Giảm giá</span><strong>−{formatMoney(receipt.discount)}</strong></div>}
    <div className="receipt-total grand"><span>Đã thanh toán</span><strong>{formatMoney(receipt.total)}</strong></div>
    {receipt.payments.map((payment) => <div className="receipt-total" key={payment.method}><span>{payment.method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span><strong>{formatMoney(payment.amount)}</strong></div>)}
    <div className="receipt-total"><span>Tiền thừa</span><strong>{formatMoney(receipt.change)}</strong></div>
  </>;
}

export function PrintReceipt({ receipt, onClose }: { receipt: CompletedBill; onClose: () => void }) {
  const [printing, setPrinting] = useState(false);
  const lines = groupReceiptLines(receipt.lines);

  useEffect(() => {
    if (!printing) return undefined;
    const handleAfterPrint = () => setPrinting(false);
    window.addEventListener('afterprint', handleAfterPrint);
    const frame = window.requestAnimationFrame(() => window.print());
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printing]);

  return <Modal title="Hóa đơn thanh toán" onClose={onClose}>
    <div className="modal-body receipt-body">
      <ReceiptDocument receipt={receipt} lines={lines} />
    </div>
    <footer className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Đóng</button><button className="button-primary" type="button" onClick={() => setPrinting(true)}><i className="icon fa-solid fa-print" />In hóa đơn</button></footer>
    <PrintSurface active={printing}><ReceiptDocument receipt={receipt} lines={lines} /></PrintSurface>
  </Modal>;
}
