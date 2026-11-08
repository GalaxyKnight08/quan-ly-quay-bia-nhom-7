export const validateLogin = ({ phone, password }) => {
  const errors = {};
  if (!/^[0-9+()\-\s]{8,20}$/.test(phone || '')) errors.phone = 'Vui lòng nhập số điện thoại hợp lệ.';
  if (!password || password.length < 6) errors.password = 'Mật khẩu cần có ít nhất 6 ký tự.';
  return errors;
};

export const validateOrder = ({ customer, items, amount }) => {
  const errors = {};
  if (!customer?.trim()) errors.customer = 'Vui lòng nhập tên khách hàng.';
  if (!items) errors.items = 'Vui lòng nhập số lượng sản phẩm.';
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) errors.amount = 'Giá trị đơn hàng phải lớn hơn 0.';
  return errors;
};