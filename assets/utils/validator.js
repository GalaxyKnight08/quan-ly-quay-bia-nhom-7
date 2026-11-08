export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email || '')) errors.email = 'Vui lòng nhập email hợp lệ.';
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