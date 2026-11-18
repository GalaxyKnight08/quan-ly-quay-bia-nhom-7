import { useState } from 'react';
import { Modal } from '../../../components/shared/Modal.tsx';

interface Tap {
  name: string;
  keg: string;
  beer: string;
  sold: number;
  capacity: number;
}

export function TapPage({ onToast }: { onToast: (message: string) => void }) {
  const [taps, setTaps] = useState<Tap[]>([
    { name: 'Vòi 1', keg: 'KEG-0008', beer: 'Bia hơi Hà Nội', sold: 46, capacity: 50 },
    { name: 'Vòi 2', keg: 'KEG-0006', beer: 'Bia hơi Hải Phòng', sold: 27, capacity: 30 },
    { name: 'Vòi 3', keg: 'Chưa gắn keg', beer: '—', sold: 0, capacity: 50 }
  ]);
  const [confirmTap, setConfirmTap] = useState<number | null>(null);
  const replaceTap = (index: number) => {
    setTaps((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, keg: `KEG-00${11 + itemIndex}`, sold: 0 } : item));
    setConfirmTap(null);
    onToast('Đã cập nhật keg demo cho vòi.');
  };

  return <main className="page-content feature-content">
    <div className="page-heading"><div><span className="eyebrow">Phân hệ Quầy</span><h1>Vòi bia & thay keg</h1><p>FR-10 · Theo dõi keg đang dùng và thể tích bia đã bán</p></div></div>
    <div className="tap-grid">{taps.map((tap, index) => <article className="panel tap-card" key={tap.name}><header><span className="tap-icon"><i className="icon fa-solid fa-beer-mug-empty" /></span><div><h2>{tap.name}</h2><p>{tap.beer} · {tap.keg}</p></div><span className="status-pill">{tap.keg === 'Chưa gắn keg' ? 'Sẵn sàng' : 'Đang dùng'}</span></header><div className="tap-progress-label"><span>Đã bán</span><strong>{tap.sold} / {tap.capacity} L</strong></div><div className="tap-progress"><span style={{ width: `${Math.min(100, tap.sold / tap.capacity * 100)}%` }} /></div><div className="tap-card-footer"><span>Còn khoảng {Math.max(0, tap.capacity - tap.sold)} L</span><button className="button-secondary" type="button" onClick={() => tap.sold / tap.capacity < .9 ? setConfirmTap(index) : replaceTap(index)}>Thay keg</button></div></article>)}</div>
    {confirmTap !== null && <Modal title="Xác nhận thay keg" onClose={() => setConfirmTap(null)}>
      <div className="modal-body"><p>Keg mới bán {Math.round(taps[confirmTap].sold / taps[confirmTap].capacity * 100)}% dung tích. Phần bia còn lại sẽ được tính là hao hụt.</p></div>
      <footer className="modal-footer"><button className="button-secondary" type="button" onClick={() => setConfirmTap(null)}>Hủy</button><button className="button-primary" type="button" onClick={() => replaceTap(confirmTap)}>Xác nhận thay</button></footer>
    </Modal>}
  </main>;
}
