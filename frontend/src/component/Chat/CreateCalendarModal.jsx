import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, FileText, Save } from 'lucide-react';
import apiService from '../../services/api';

const CreateCalendarModal = ({ message, jobApplicationId, userType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    eventType: 1, // 1: Interview, 2: Nyusha
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    status: 0 // 0: Pending, 1: Confirmed, 2: Cancelled
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jobApplication, setJobApplication] = useState(null);
  
  // Hover states
  const [hoveredCloseButton, setHoveredCloseButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSubmitButton, setHoveredSubmitButton] = useState(false);

  useEffect(() => {
    parseMessageAndLoadData();
  }, [message]);

  const parseMessageAndLoadData = () => {
    // Parse message: "@job_application_id đặt lịch hẹn phỏng vấn / nyusha vào ngày ... nhé"
    const content = message.content || '';
    const match = content.match(/@(\d+)\s+đặt lịch hẹn\s+(phỏng vấn|nyusha)\s+vào ngày\s+(.+?)\s+nhé/i);
    
    if (match) {
      const eventType = match[2].toLowerCase().includes('nyusha') ? 2 : 1;
      const dateText = match[3].trim();
      
      // Try to parse date from various formats
      let parsedDate = null;
      const dateFormats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/i, // DD/MM/YYYY HH:mm
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/i, // DD/MM/YYYY
        /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/i, // YYYY-MM-DD HH:mm
      ];

      for (const format of dateFormats) {
        const match = dateText.match(format);
        if (match) {
          if (format === dateFormats[0]) {
            // DD/MM/YYYY HH:mm
            parsedDate = new Date(
              parseInt(match[3]),
              parseInt(match[2]) - 1,
              parseInt(match[1]),
              parseInt(match[4]),
              parseInt(match[5])
            );
          } else if (format === dateFormats[1]) {
            // DD/MM/YYYY
            parsedDate = new Date(
              parseInt(match[3]),
              parseInt(match[2]) - 1,
              parseInt(match[1])
            );
          } else if (format === dateFormats[2]) {
            // YYYY-MM-DD HH:mm
            parsedDate = new Date(
              parseInt(match[1]),
              parseInt(match[2]) - 1,
              parseInt(match[3]),
              parseInt(match[4]),
              parseInt(match[5])
            );
          }
          break;
        }
      }

      if (parsedDate && !isNaN(parsedDate.getTime())) {
        const startAt = parsedDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        const endAt = new Date(parsedDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // +1 hour
        
        setFormData(prev => ({
          ...prev,
          eventType,
          title: eventType === 1 ? 'Phỏng vấn ứng viên' : 'Nyusha',
          description: `Lịch hẹn từ tin nhắn: ${content}`,
          startAt,
          endAt
        }));
      } else {
        // If can't parse, set default values
        const now = new Date();
        const startAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // Tomorrow
        const endAt = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString().slice(0, 16);
        
        setFormData(prev => ({
          ...prev,
          eventType,
          title: eventType === 1 ? 'Phỏng vấn ứng viên' : 'Nyusha',
          description: `Lịch hẹn từ tin nhắn: ${content}\nNgày: ${dateText}`,
          startAt,
          endAt
        }));
      }
    } else {
      // Default values if can't parse
      const now = new Date();
      const startAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      const endAt = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString().slice(0, 16);
      
      setFormData(prev => ({
        ...prev,
        title: 'Lịch hẹn mới',
        startAt,
        endAt
      }));
    }

    // Load job application info
    loadJobApplication();
  };

  const loadJobApplication = async () => {
    try {
      const response = userType === 'ctv'
        ? await apiService.getJobApplicationById(jobApplicationId)
        : await apiService.getAdminJobApplicationById(jobApplicationId);
      
      if (response.success && response.data) {
        const app = response.data.jobApplication || response.data.application;
        setJobApplication(app);
        
        // Update title with candidate and job info
        if (app) {
          const candidateName = app.name || app.cv?.fullName || 'Ứng viên';
          const jobTitle = app.job?.title || 'Công việc';
          setFormData(prev => ({
            ...prev,
            title: prev.title || `${prev.eventType === 1 ? 'Phỏng vấn' : 'Nyusha'}: ${candidateName} - ${jobTitle}`
          }));
        }
      }
    } catch (error) {
      console.error('Error loading job application:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'eventType' || name === 'status' ? parseInt(value) : value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.startAt) {
      newErrors.startAt = 'Thời gian bắt đầu là bắt buộc';
    }

    if (formData.endAt && new Date(formData.endAt) < new Date(formData.startAt)) {
      newErrors.endAt = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const calendarData = {
        jobApplicationId: parseInt(jobApplicationId),
        eventType: formData.eventType,
        title: formData.title,
        description: formData.description || '',
        startAt: formData.startAt,
        endAt: formData.endAt || null,
        status: formData.status,
        collaboratorId: jobApplication?.collaboratorId || jobApplication?.collaborator?.id || null
      };

      const response = await apiService.createAdminCalendar(calendarData);
      
      if (response.success) {
        alert('Tạo lịch hẹn thành công! Lịch hẹn đã được cập nhật vào calendar.');
        
        // Dispatch event to reload schedules in other components
        window.dispatchEvent(new CustomEvent('calendarCreated', { 
          detail: { jobApplicationId } 
        }));
        
        onSuccess();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo lịch hẹn');
      }
    } catch (error) {
      console.error('Error creating calendar:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#111827' }}>
            <CalendarIcon className="w-5 h-5" style={{ color: '#2563eb' }} />
            Tạo lịch hẹn nhanh
          </h2>
          <button
            onClick={onClose}
            onMouseEnter={() => setHoveredCloseButton(true)}
            onMouseLeave={() => setHoveredCloseButton(false)}
            className="p-1 rounded transition-colors"
            style={{
              backgroundColor: hoveredCloseButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <X className="w-5 h-5" style={{ color: '#4b5563' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Job Application Info */}
          {jobApplication && (
            <div className="border rounded-lg p-3" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: '#1e3a8a' }}>Đơn ứng tuyển</div>
              <div className="text-sm" style={{ color: '#1e40af' }}>
                {jobApplication.name || jobApplication.cv?.fullName || 'N/A'} - {jobApplication.job?.title || 'N/A'}
              </div>
            </div>
          )}

          {/* Event Type */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
              Loại sự kiện <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
            >
              <option value="1">Phỏng vấn</option>
              <option value="2">Nyusha</option>
              <option value="3">Khác</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
              Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Phỏng vấn ứng viên..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: errors.title ? '#ef4444' : '#d1d5db'
              }}
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                Thời gian bắt đầu <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="datetime-local"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: errors.startAt ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>
              {errors.startAt && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.startAt}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                Thời gian kết thúc
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="datetime-local"
                  name="endAt"
                  value={formData.endAt}
                  onChange={handleInputChange}
                  min={formData.startAt}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: errors.endAt ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>
              {errors.endAt && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.endAt}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
              Mô tả / Ghi chú
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả hoặc ghi chú cho lịch hẹn..."
              rows="3"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
            >
              <option value="0">Chờ xác nhận</option>
              <option value="1">Đã xác nhận</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setHoveredCancelButton(true)}
              onMouseLeave={() => setHoveredCancelButton(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
                color: '#374151'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setHoveredSubmitButton(true)}
              onMouseLeave={() => setHoveredSubmitButton(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              style={{
                backgroundColor: hoveredSubmitButton ? '#2563eb' : '#2563eb',
                color: 'white',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCalendarModal;

