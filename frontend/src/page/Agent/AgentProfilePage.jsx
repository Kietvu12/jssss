import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Building2, CreditCard, Save } from 'lucide-react';
import apiService from '../../services/api';

const AgentProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    country: '',
    postCode: '',
    address: '',
    organizationType: 'individual',
    companyName: '',
    taxCode: '',
    website: '',
    businessAddress: '',
    businessLicense: '',
    birthday: '',
    gender: '',
    facebook: '',
    zalo: '',
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    bankBranch: '',
    organizationLink: '',
    description: ''
  });
  const [hoveredBack, setHoveredBack] = useState(false);
  const [hoveredSave, setHoveredSave] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getCTVProfile();
      if (res?.success && res?.data?.collaborator) {
        const c = res.data.collaborator;
        setProfile(c);
        setForm({
          name: c.name ?? '',
          phone: c.phone ?? '',
          country: c.country ?? '',
          postCode: c.postCode ?? '',
          address: c.address ?? '',
          organizationType: c.organizationType ?? 'individual',
          companyName: c.companyName ?? '',
          taxCode: c.taxCode ?? '',
          website: c.website ?? '',
          businessAddress: c.businessAddress ?? '',
          businessLicense: c.businessLicense ?? '',
          birthday: c.birthday ? c.birthday.slice(0, 10) : '',
          gender: c.gender !== undefined && c.gender !== null ? String(c.gender) : '',
          facebook: c.facebook ?? '',
          zalo: c.zalo ?? '',
          bankName: c.bankName ?? '',
          bankAccount: c.bankAccount ?? '',
          bankAccountName: c.bankAccountName ?? '',
          bankBranch: c.bankBranch ?? '',
          organizationLink: c.organizationLink ?? '',
          description: c.description ?? ''
        });
      } else {
        setError(res?.message || 'Không tải được thông tin');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      setError(null);
      const payload = {
        ...form,
        gender: form.gender === '' ? null : parseInt(form.gender, 10)
      };
      const res = await apiService.updateCTVProfile(payload);
      if (res?.success && res?.data?.collaborator) {
        setProfile(res.data.collaborator);
        localStorage.setItem('user', JSON.stringify(res.data.collaborator));
        setSuccess(true);
      } else {
        setError(res?.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#dc2626' }} />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-lg border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/agent')}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            onMouseEnter={() => setHoveredBack(true)}
            onMouseLeave={() => setHoveredBack(false)}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: hoveredBack ? '#f3f4f6' : 'transparent' }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {profile?.rankLevel && (
              <p className="text-xs text-gray-500 mt-0.5">
                {profile.rankLevel.name} · {profile.rankLevel.percent != null ? `${Number(profile.rankLevel.percent)}%` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <div className="rounded-lg border p-3 text-sm text-green-700 bg-green-50 border-green-200">
            Đã cập nhật thông tin thành công.
          </div>
        )}
        {error && profile && (
          <div className="rounded-lg border p-3 text-sm text-red-700 bg-red-50 border-red-200">
            {error}
          </div>
        )}

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Thông tin cơ bản</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Họ tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#e5e7eb' }}
                placeholder="Họ và tên"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#e5e7eb' }}
              >
                <option value="">— Chọn —</option>
                <option value="1">Nam</option>
                <option value="2">Nữ</option>
                <option value="3">Khác</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả / Ghi chú</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#e5e7eb' }}
                placeholder="Mô tả ngắn (tùy chọn)"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Liên hệ</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email (không đổi được)</label>
              <input type="text" value={profile?.email ?? ''} readOnly disabled className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} placeholder="Số điện thoại" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Facebook</label>
              <input type="text" name="facebook" value={form.facebook} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} placeholder="Link hoặc ID Facebook" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Zalo</label>
              <input type="text" name="zalo" value={form.zalo} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} placeholder="Số Zalo" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Địa chỉ</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quốc gia</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} placeholder="Việt Nam" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mã bưu điện</label>
              <input type="text" name="postCode" value={form.postCode} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} placeholder="Địa chỉ chi tiết" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Tổ chức (nếu có)</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Loại tổ chức</label>
              <select name="organizationType" value={form.organizationType} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }}>
                <option value="individual">Cá nhân</option>
                <option value="company">Công ty</option>
                <option value="organization">Tổ chức</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tên công ty / Tổ chức</label>
              <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mã số thuế</label>
              <input type="text" name="taxCode" value={form.taxCode} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ kinh doanh</label>
              <input type="text" name="businessAddress" value={form.businessAddress} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Ngân hàng</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ngân hàng</label>
              <input type="text" name="bankName" value={form.bankName} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Số tài khoản</label>
              <input type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Chủ tài khoản</label>
              <input type="text" name="bankAccountName" value={form.bankAccountName} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Chi nhánh</label>
              <input type="text" name="bankBranch" value={form.bankBranch} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e5e7eb' }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            onMouseEnter={() => setHoveredSave(true)}
            onMouseLeave={() => setHoveredSave(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: hoveredSave && !saving ? '#b91c1c' : '#dc2626' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentProfilePage;
