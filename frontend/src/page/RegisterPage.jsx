import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import './LandingPage.css';

// Danh sách lĩnh vực (theo form mẫu)
const LINH_VUC = [
  'Kinh doanh – Sales',
  'Kế hoạch – Quản lý',
  'IT (SE / Hạ tầng / Web)',
  'Kỹ thuật lập trình nhúng',
  'Kỹ thuật cơ khí – Điện – Điện tử',
  'Kỹ thuật hóa học – vật liệu – mỹ phẩm – sản phẩm tiêu dùng',
  'Kỹ thuật thực phẩm – hương liệu – thức ăn chăn nuôi',
  'Nhân sự',
  'Tài chính – Kế toán',
  'Hành chính – Văn phòng',
  'Lĩnh vực khác',
];

const NAM_KN_OPTIONS = ['Dưới 1 năm', '1~3 năm', 'Trên 3 năm'];
const QUOC_GIA_OPTIONS = ['Việt Nam', 'Nhật Bản', 'Khác'];

// Màu & style (theo form mẫu)
const C = {
  red: '#c61414',
  redLt: '#fdf2f2',
  gray: '#4a4a4a',
  blue: '#1c8ae7',
  green: '#00bf63',
  white: '#ffffff',
  bg: '#f5f5f5',
  border: '#dddddd',
};

const css = {
  root: {
    fontFamily: "'Barlow', sans-serif",
    background: C.white,
    minHeight: '100vh',
  },
  header: {
    background: '#000',
    padding: '0 40px',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,.25)',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', textDecoration: 'none', color: C.white,
  },
  hero: {
    background: C.white,
    padding: '48px 40px 56px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 28, fontWeight: 700, color: C.gray, marginBottom: 8,
  },
  heroSub: {
    fontSize: 15, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.5,
  },
  wrapper: {
    maxWidth: 760, margin: '-28px auto 60px', padding: '0 20px',
  },
  card: {
    background: C.white, borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,.09)', padding: '40px 48px',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 700, letterSpacing: '1.2px',
    textTransform: 'uppercase', color: C.red,
    borderLeft: `3px solid ${C.red}`, paddingLeft: 10, marginBottom: 20,
  },
  divider: {
    border: 'none', borderTop: `1px solid ${C.border}`, margin: '32px 0',
  },
  field: { marginBottom: 20 },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.gray,
  },
  req: { color: C.red, marginLeft: 3 },
  hint: { fontSize: 11, fontWeight: 400, color: '#999', marginLeft: 6 },
  input: {
    width: '100%', padding: '11px 14px',
    fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.gray,
    background: '#fafafa', border: `1.5px solid ${C.border}`,
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
    transition: 'border .2s, box-shadow .2s',
  },
  inputFocus: {
    borderColor: C.red,
    boxShadow: '0 0 0 3px rgba(198,20,20,.1)',
    background: C.white,
  },
  inputError: { borderColor: C.red },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16 },
  toggleGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  toggleOption: (checked) => ({
    flex: 1, minWidth: 160,
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 18px',
    border: `2px solid ${checked ? C.red : C.border}`,
    borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500,
    background: checked ? C.redLt : C.white,
    color: checked ? C.red : C.gray,
    transition: 'all .2s', userSelect: 'none',
  }),
  radioCircle: (checked) => ({
    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
    border: `2px solid ${checked ? C.red : C.border}`,
    background: checked ? C.red : 'transparent',
    boxShadow: checked ? `inset 0 0 0 3px ${C.white}` : 'none',
    transition: 'all .2s',
  }),
  checkGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  checkItem: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 },
  multiSelectWrap: { position: 'relative', width: '100%' },
  multiSelectTrigger: {
    width: '100%', padding: '11px 14px', paddingRight: 36,
    fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.gray,
    background: '#fafafa', border: `1.5px solid ${C.border}`,
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
    cursor: 'pointer', textAlign: 'left',
  },
  multiSelectTriggerOpen: {
    borderColor: C.red, boxShadow: '0 0 0 3px rgba(198,20,20,.1)', background: C.white,
  },
  multiSelectDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
    background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, maxHeight: 280, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  multiSelectSearch: {
    padding: 10, borderBottom: `1px solid ${C.border}`,
    fontFamily: "'Barlow', sans-serif", fontSize: 14,
    border: 'none', outline: 'none', background: '#fafafa',
  },
  multiSelectList: { overflow: 'auto', maxHeight: 220, padding: '6px 0' },
  multiSelectOption: (selected) => ({
    padding: '10px 14px', cursor: 'pointer', fontSize: 13,
    background: selected ? C.redLt : 'transparent',
    color: selected ? C.red : C.gray,
    display: 'flex', alignItems: 'center', gap: 8,
  }),
  multiSelectTags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  multiSelectTag: {
    fontSize: 12, padding: '4px 10px', borderRadius: 20,
    background: C.redLt, color: C.red, display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  multiSelectTagRemove: { cursor: 'pointer', opacity: 0.8 },
  expInline: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingLeft: 24 },
  uploadZone: (hasFile) => ({
    border: `2px dashed ${hasFile ? C.red : C.border}`,
    borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer',
    background: hasFile ? C.redLt : 'transparent',
    transition: 'border .2s, background .2s',
  }),
  upIcon: { fontSize: 28, marginBottom: 8 },
  upText: { fontSize: 13, color: '#999' },
  upHint: { fontSize: 11, color: '#bbb', marginTop: 4 },
  subDesc: { fontSize: 13, color: '#888', marginBottom: 20 },
  submitRow: {
    marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  agreeLabel: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 13.5, color: C.gray, cursor: 'pointer',
    maxWidth: 500, lineHeight: 1.6,
  },
  agreeLink: { color: C.blue, textDecoration: 'underline' },
  btnSubmit: (disabled) => ({
    background: disabled ? '#ccc' : C.red,
    color: C.white, fontFamily: "'Barlow', sans-serif",
    fontSize: 16, fontWeight: 700, padding: '14px 56px',
    border: 'none', borderRadius: 50, cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '.5px',
    boxShadow: disabled ? 'none' : '0 4px 16px rgba(198,20,20,.4)',
    transition: 'background .2s, box-shadow .2s',
  }),
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
    zIndex: 100, display: 'grid', placeItems: 'center',
  },
  successBox: {
    background: C.white, borderRadius: 20, padding: '48px 56px',
    textAlign: 'center', maxWidth: 420,
    boxShadow: '0 12px 40px rgba(0,0,0,.2)',
  },
  checkCircle: {
    width: 72, height: 72, background: C.green, borderRadius: '50%',
    display: 'grid', placeItems: 'center', margin: '0 auto 20px',
  },
  errText: { fontSize: 12, color: C.red, marginTop: 4 },
};

// ─── Input với focus highlight ─────────────────────────────────────────────
function FInput({ style, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...css.input,
        ...(focused ? css.inputFocus : {}),
        ...(error ? css.inputError : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function FSelect({ style, error, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...css.input,
        ...(focused ? css.inputFocus : {}),
        ...(error ? css.inputError : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      {children}
    </select>
  );
}

function FTextarea({ style, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      style={{
        ...css.input,
        minHeight: 100,
        resize: 'vertical',
        ...(focused ? css.inputFocus : {}),
        ...(error ? css.inputError : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function SearchableMultiSelect({ options, value = [], onChange, placeholder = 'Gõ để tìm, chọn...' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);
  const q = search.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const toggle = (item) => {
    const next = value.includes(item) ? value.filter((v) => v !== item) : [...value, item];
    onChange(next);
  };
  const remove = (e, item) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== item));
  };
  const displayText = value.length ? `${value.length} lĩnh vực đã chọn` : placeholder;
  return (
    <div style={css.multiSelectWrap} ref={wrapRef}>
      <div
        role="combobox"
        aria-expanded={open}
        style={{
          ...css.multiSelectTrigger,
          ...(open ? css.multiSelectTriggerOpen : {}),
        }}
        onClick={() => setOpen(!open)}
      >
        {displayText}
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div style={css.multiSelectDropdown}>
          <input
            type="text"
            placeholder="🔍 Gõ để tìm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            style={css.multiSelectSearch}
            autoFocus
          />
          <div style={css.multiSelectList} role="listbox">
            {filtered.length ? (
              filtered.map((opt) => {
                const selected = value.includes(opt);
                return (
                  <div
                    key={opt}
                    role="option"
                    aria-selected={selected}
                    style={css.multiSelectOption(selected)}
                    onClick={() => toggle(opt)}
                  >
                    {selected && '✓ '}
                    {opt}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: 14, color: '#999', fontSize: 13 }}>Không có kết quả</div>
            )}
          </div>
        </div>
      )}
      {value.length > 0 && (
        <div style={css.multiSelectTags}>
          {value.map((v) => (
            <span key={v} style={css.multiSelectTag}>
              {v}
              <span style={css.multiSelectTagRemove} onClick={(e) => remove(e, v)} aria-label="Bỏ chọn">
                ×
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoTen: '',
    ngaySinh: '',
    email: '',
    soDienThoai: '',
    loaiSdt: 'Zalo',
    facebookLinkedin: '',
    quocGia: '',
    zipCode: '',
    diaChi: '',
    loaiCtv: 'ca_nhan',
    kinhNghiem: '',
    namKinhNghiem: '',
    linhVucCaNhan: [],
    gioiThieuCaNhan: '',
    tenCongTy: '',
    website: '',
    mst: '',
    diaChiDN: '',
    giayphepFile: null,
    linhVucDN: [],
    gioiThieuDN: '',
    password: '',
    confirmPassword: '',
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setForm((prev) => ({ ...prev, giayphepFile: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = (form.email || '').trim();
    const phone = String(form.soDienThoai || '').replace(/\D/g, '').replace(/\s/g, '');

    if (!(form.hoTen || '').trim()) newErrors.hoTen = 'Họ tên là bắt buộc';
    if (!trimmedEmail) newErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) newErrors.email = 'Email không đúng định dạng';
    if (!phone) newErrors.soDienThoai = 'Số điện thoại là bắt buộc';
    else if (!/^0[0-9]{9,10}$/.test(phone)) newErrors.soDienThoai = 'Số điện thoại 10–11 số, bắt đầu bằng 0';
    if (!form.password) newErrors.password = 'Mật khẩu là bắt buộc';
    else if (form.password.length < 8) newErrors.password = 'Mật khẩu ít nhất 8 ký tự';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (form.bankAccount && !form.bankName) newErrors.bankName = 'Nhập tên ngân hàng khi có số tài khoản';

    if (form.loaiCtv === 'ca_nhan') {
      if (!form.kinhNghiem) newErrors.kinhNghiem = 'Vui lòng chọn mức độ kinh nghiệm';
    } else {
      if (!(form.tenCongTy || '').trim()) newErrors.tenCongTy = 'Tên công ty là bắt buộc';
      if (!(form.mst || '').trim()) newErrors.mst = 'Mã số thuế là bắt buộc';
      if (!(form.diaChiDN || '').trim()) newErrors.diaChiDN = 'Địa chỉ doanh nghiệp là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildApiPayload = () => {
    const isCompany = form.loaiCtv === 'to_chuc';
    const phone = String(form.soDienThoai || '').replace(/\D/g, '').replace(/\s/g, '').slice(0, 11);

    let description = '';
    if (isCompany) {
      const parts = [];
      if (form.linhVucDN?.length) parts.push('Lĩnh vực: ' + form.linhVucDN.join(', '));
      if ((form.gioiThieuDN || '').trim()) parts.push(form.gioiThieuDN.trim());
      description = parts.join('\n\n');
    } else {
      const parts = [];
      if (form.kinhNghiem === '1' && form.namKinhNghiem) parts.push('Số năm kinh nghiệm: ' + form.namKinhNghiem);
      if (form.linhVucCaNhan?.length) parts.push('Lĩnh vực network: ' + form.linhVucCaNhan.join(', '));
      if ((form.gioiThieuCaNhan || '').trim()) parts.push(form.gioiThieuCaNhan.trim());
      description = parts.join('\n\n');
    }

    const payload = {
      name: (form.hoTen || '').trim(),
      email: (form.email || '').trim(),
      password: form.password,
      phone,
      country: form.quocGia || undefined,
      postCode: (form.zipCode || '').trim() || undefined,
      address: (form.diaChi || '').trim() || undefined,
      organizationType: isCompany ? 'company' : 'individual',
      birthday: form.ngaySinh || undefined,
      zalo: form.loaiSdt === 'Zalo' ? phone : undefined,
      organizationLink: (form.facebookLinkedin || '').trim() || undefined,
      bankName: (form.bankName || '').trim() || undefined,
      bankAccount: (form.bankAccount || '').trim() || undefined,
      bankAccountName: (form.bankAccountName || '').trim() || undefined,
      description: description || undefined,
    };

    if (isCompany) {
      payload.companyName = (form.tenCongTy || '').trim();
      payload.taxCode = (form.mst || '').trim();
      payload.website = (form.website || '').trim() || undefined;
      payload.businessAddress = (form.diaChiDN || '').trim();
      payload.businessLicense = undefined;
    } else {
      payload.hasExperience = form.kinhNghiem;
      payload.yearsExperience = form.namKinhNghiem || undefined;
      payload.sectors = form.linhVucCaNhan?.length ? form.linhVucCaNhan : undefined;
    }
    if (isCompany && form.linhVucDN?.length) {
      payload.companySectors = form.linhVucDN;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      alert('Vui lòng đồng ý với Quy định & chính sách sử dụng nền tảng.');
      return;
    }
    if (!validateForm()) return;
    try {
      setLoading(true);
      const payload = buildApiPayload();
      const response = await apiService.registerCTV(payload);
      if (response.success) {
        setSubmitted(true);
      } else {
        alert(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isCaNhan = form.loaiCtv === 'ca_nhan';

  return (
    <div style={css.root}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <header style={css.header}>
        <Link to="/" style={css.logoWrap} aria-label="Job Share - powered by Q work station">
          <span style={{ fontSize: 20, fontWeight: 700 }}>
            Job<span style={{ color: C.red }}>Share</span>
          </span>
        </Link>
        <Link to="/login" style={{ marginLeft: 'auto', color: C.white, fontSize: 14, textDecoration: 'none' }}>
          Đăng nhập
        </Link>
      </header>

      <div style={css.hero}>
        <h1 style={css.heroTitle}>Đăng ký Cộng tác viên</h1>
        <p style={css.heroSub}>
          Điền đầy đủ thông tin bên dưới để trở thành cộng tác viên JobShare.
        </p>
      </div>

      <div style={css.wrapper}>
        <div style={css.card}>
          <form onSubmit={handleSubmit} noValidate>
            {/* 1. Thông tin cá nhân */}
            <div style={css.sectionTitle}>1. Thông tin cá nhân</div>

            <div style={css.field}>
              <label style={css.label}>Họ và tên <span style={css.req}>*</span></label>
              <FInput type="text" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={set('hoTen')} error={!!errors.hoTen} />
              {errors.hoTen && <p style={css.errText}>{errors.hoTen}</p>}
            </div>

            <div style={css.grid2}>
              <div style={css.field}>
                <label style={css.label}>Ngày sinh <span style={css.req}>*</span></label>
                <FInput type="date" value={form.ngaySinh} onChange={set('ngaySinh')} error={!!errors.ngaySinh} />
              </div>
              <div style={css.field}>
                <label style={css.label}>Email <span style={css.req}>*</span></label>
                <FInput type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} error={!!errors.email} />
                {errors.email && <p style={css.errText}>{errors.email}</p>}
              </div>
            </div>

            <div style={css.field}>
              <label style={css.label}>
                Số điện thoại <span style={css.req}>*</span>
                <span style={css.hint}>Vui lòng điền số điện thoại liên lạc thường xuyên nhất</span>
              </label>
              <div style={css.grid2}>
                <FSelect value={form.loaiSdt} onChange={set('loaiSdt')} style={{ minWidth: 120 }} error={!!errors.soDienThoai}>
                  <option value="Zalo">Zalo</option>
                  <option value="Line">Line</option>
                </FSelect>
                <FInput
                  type="tel"
                  placeholder={form.loaiSdt === 'Zalo' ? 'Số Zalo' : 'Số Line'}
                  value={form.soDienThoai}
                  onChange={set('soDienThoai')}
                  error={!!errors.soDienThoai}
                />
              </div>
              {errors.soDienThoai && <p style={css.errText}>{errors.soDienThoai}</p>}
            </div>

            <div style={css.field}>
              <label style={css.label}>
                Facebook / LinkedIn <span style={css.hint}>Link hồ sơ (nếu có)</span>
              </label>
              <FInput type="url" placeholder="https://facebook.com/... hoặc linkedin.com/in/..." value={form.facebookLinkedin} onChange={set('facebookLinkedin')} />
            </div>

            <div style={css.field}>
              <label style={css.label}>Nơi sống hiện tại <span style={css.req}>*</span></label>
              <div style={css.grid3}>
                <FSelect value={form.quocGia} onChange={set('quocGia')} error={!!errors.quocGia}>
                  <option value="">Quốc gia</option>
                  {QUOC_GIA_OPTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </FSelect>
                <FInput type="text" placeholder="Mã bưu chính" value={form.zipCode} onChange={set('zipCode')} />
                <FInput type="text" placeholder="Địa chỉ chi tiết" value={form.diaChi} onChange={set('diaChi')} />
              </div>
            </div>

            <hr style={css.divider} />

            {/* 2. Hình thức tổ chức */}
            <div style={css.sectionTitle}>2. Hình thức tổ chức</div>

            <div style={{ ...css.field, ...css.toggleGroup }}>
              {[
                { value: 'ca_nhan', label: 'Cá nhân' },
                { value: 'to_chuc', label: 'Tổ chức – Doanh nghiệp' },
              ].map((opt) => {
                const checked = form.loaiCtv === opt.value;
                return (
                  <label
                    key={opt.value}
                    style={css.toggleOption(checked)}
                    onClick={() => setForm((p) => ({ ...p, loaiCtv: opt.value }))}
                  >
                    <div style={css.radioCircle(checked)} />
                    {opt.label}
                  </label>
                );
              })}
            </div>

            {/* 3a. Cá nhân */}
            {isCaNhan && (
              <>
                <hr style={css.divider} />
                <div style={css.sectionTitle}>3. Thông tin bổ sung</div>
                <p style={css.subDesc}>Vui lòng trả lời một số thông tin để chúng tôi hiểu hơn về bạn nhé!</p>

                <div style={css.field}>
                  <label style={css.label}>
                    Bạn đã có kinh nghiệm làm cộng tác viên tuyển dụng chưa? <span style={css.req}>*</span>
                  </label>
                  <div style={{ ...css.checkGroup, gap: 12 }}>
                    <label style={css.checkItem}>
                      <input type="radio" name="kinhNghiem" value="0" checked={form.kinhNghiem === '0'} onChange={set('kinhNghiem')} style={{ accentColor: C.red }} />
                      <span>Chưa có kinh nghiệm</span>
                    </label>
                    <div>
                      <label style={{ ...css.checkItem, marginBottom: 10 }}>
                        <input type="radio" name="kinhNghiem" value="1" checked={form.kinhNghiem === '1'} onChange={set('kinhNghiem')} style={{ accentColor: C.red }} />
                        <span>Đã có kinh nghiệm</span>
                      </label>
                      {form.kinhNghiem === '1' && (
                        <div style={css.expInline}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Số năm kinh nghiệm:</span>
                          <FSelect value={form.namKinhNghiem} onChange={set('namKinhNghiem')} style={{ width: 'auto', minWidth: 160 }}>
                            <option value="">Chọn</option>
                            {NAM_KN_OPTIONS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </FSelect>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.kinhNghiem && <p style={css.errText}>{errors.kinhNghiem}</p>}
                </div>

                <div style={css.field}>
                  <label style={css.label}>Bạn có network ứng viên nhiều nhất trong lĩnh vực nào?</label>
                  <SearchableMultiSelect
                    options={LINH_VUC}
                    value={form.linhVucCaNhan}
                    onChange={(arr) => setForm((p) => ({ ...p, linhVucCaNhan: arr }))}
                    placeholder="Gõ để tìm, chọn nhiều lĩnh vực..."
                  />
                </div>

                <div style={css.field}>
                  <label style={css.label}>
                    Giới thiệu bản thân <span style={css.hint}>Tuỳ ý – giúp chúng tôi hiểu hơn về bạn</span>
                  </label>
                  <FTextarea
                    placeholder="Chia sẻ một chút về bản thân, kinh nghiệm hoặc mục tiêu của bạn…"
                    value={form.gioiThieuCaNhan}
                    onChange={set('gioiThieuCaNhan')}
                  />
                </div>
              </>
            )}

            {/* 3b. Doanh nghiệp */}
            {!isCaNhan && (
              <>
                <hr style={css.divider} />
                <div style={css.sectionTitle}>3. Thông tin doanh nghiệp</div>

                <div style={css.grid2}>
                  <div style={css.field}>
                    <label style={css.label}>Tên công ty <span style={css.req}>*</span></label>
                    <FInput type="text" placeholder="Tên đầy đủ của công ty" value={form.tenCongTy} onChange={set('tenCongTy')} error={!!errors.tenCongTy} />
                    {errors.tenCongTy && <p style={css.errText}>{errors.tenCongTy}</p>}
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>Website</label>
                    <FInput type="url" placeholder="https://company.com" value={form.website} onChange={set('website')} />
                  </div>
                </div>

                <div style={css.grid2}>
                  <div style={css.field}>
                    <label style={css.label}>Mã số thuế (MST) <span style={css.req}>*</span></label>
                    <FInput type="text" placeholder="0123456789" value={form.mst} onChange={set('mst')} error={!!errors.mst} />
                    {errors.mst && <p style={css.errText}>{errors.mst}</p>}
                  </div>
                  <div style={css.field}>
                    <label style={css.label}>Địa chỉ hoạt động hiện tại <span style={css.req}>*</span></label>
                    <FInput type="text" placeholder="Địa chỉ trụ sở chính" value={form.diaChiDN} onChange={set('diaChiDN')} error={!!errors.diaChiDN} />
                    {errors.diaChiDN && <p style={css.errText}>{errors.diaChiDN}</p>}
                  </div>
                </div>

                <div style={css.field}>
                  <label style={css.label}>
                    Giấy phép kinh doanh <span style={css.req}>*</span>
                    <span style={css.hint}>File PDF</span>
                  </label>
                  <label style={css.uploadZone(!!uploadedFileName)}>
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile} />
                    <div style={css.upIcon}>📄</div>
                    {uploadedFileName ? (
                      <p style={{ ...css.upText, color: C.red }}>
                        <strong>{uploadedFileName}</strong> đã được chọn
                      </p>
                    ) : (
                      <>
                        <p style={css.upText}>
                          <strong style={{ color: C.red }}>Nhấn để tải lên</strong> hoặc kéo thả file vào đây
                        </p>
                        <p style={css.upHint}>Chỉ chấp nhận file PDF · Tối đa 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div style={css.field}>
                  <label style={css.label}>Doanh nghiệp có network ứng viên trong lĩnh vực nào?</label>
                  <SearchableMultiSelect
                    options={LINH_VUC}
                    value={form.linhVucDN}
                    onChange={(arr) => setForm((p) => ({ ...p, linhVucDN: arr }))}
                    placeholder="Gõ để tìm, chọn nhiều lĩnh vực..."
                  />
                </div>

                <div style={css.field}>
                  <label style={css.label}>Giới thiệu về doanh nghiệp <span style={css.hint}>Tuỳ ý</span></label>
                  <FTextarea
                    placeholder="Chia sẻ về lĩnh vực hoạt động, quy mô và thế mạnh của doanh nghiệp…"
                    value={form.gioiThieuDN}
                    onChange={set('gioiThieuDN')}
                  />
                </div>
              </>
            )}

            {/* Mật khẩu đăng nhập */}
            <hr style={css.divider} />
            <div style={css.sectionTitle}>Mật khẩu đăng nhập</div>
            <div style={css.grid2}>
              <div style={css.field}>
                <label style={css.label}>Mật khẩu <span style={css.req}>*</span></label>
                <FInput type="password" placeholder="Ít nhất 8 ký tự" value={form.password} onChange={set('password')} error={!!errors.password} />
                {errors.password && <p style={css.errText}>{errors.password}</p>}
              </div>
              <div style={css.field}>
                <label style={css.label}>Xác nhận mật khẩu <span style={css.req}>*</span></label>
                <FInput type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={set('confirmPassword')} error={!!errors.confirmPassword} />
                {errors.confirmPassword && <p style={css.errText}>{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Thông tin ngân hàng (tùy chọn) */}
            <div style={css.field}>
              <div style={{ ...css.sectionTitle, marginBottom: 12 }}>Thông tin ngân hàng <span style={css.hint}>(tùy chọn)</span></div>
              <div style={css.grid2}>
                <div style={css.field}>
                  <label style={css.label}>Tên ngân hàng</label>
                  <FInput type="text" placeholder="VD: Vietcombank" value={form.bankName} onChange={set('bankName')} error={!!errors.bankName} />
                  {errors.bankName && <p style={css.errText}>{errors.bankName}</p>}
                </div>
                <div style={css.field}>
                  <label style={css.label}>Số tài khoản</label>
                  <FInput type="text" placeholder="Tùy chọn" value={form.bankAccount} onChange={set('bankAccount')} />
                </div>
              </div>
              <div style={css.field}>
                <label style={css.label}>Chủ tài khoản</label>
                <FInput type="text" placeholder="Tùy chọn" value={form.bankAccountName} onChange={set('bankAccountName')} />
              </div>
            </div>

            {/* Đồng ý + Nút gửi */}
            <div style={css.submitRow}>
              <label style={css.agreeLabel}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: C.red, flexShrink: 0, cursor: 'pointer' }}
                  checked={form.agreeTerms}
                  onChange={(e) => setForm((p) => ({ ...p, agreeTerms: e.target.checked }))}
                />
                <span>
                  Tôi đã đọc và đồng ý với{' '}
                  <a href="#" target="_blank" rel="noreferrer" style={css.agreeLink}>
                    Quy định &amp; chính sách sử dụng nền tảng Workstation JobShare
                  </a>
                </span>
              </label>
              <button type="submit" style={css.btnSubmit(!form.agreeTerms || loading)} disabled={!form.agreeTerms || loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: C.gray, marginTop: 24, marginBottom: 40 }}>
        Đã có tài khoản? <Link to="/login" style={css.agreeLink}>Đăng nhập</Link>
      </p>

      {/* Success overlay */}
      {submitted && (
        <div style={css.overlay} onClick={() => { setSubmitted(false); navigate('/login'); }}>
          <div style={css.successBox} onClick={(e) => e.stopPropagation()}>
            <div style={css.checkCircle}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, color: C.gray, marginBottom: 10 }}>Đăng ký thành công!</h2>
            <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
              Cảm ơn bạn đã đăng ký. Vui lòng mở email để bấm link xác thực, hệ thống sẽ tự động kích hoạt tài khoản cho bạn.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ ...css.btnSubmit(false), marginTop: 20 }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
