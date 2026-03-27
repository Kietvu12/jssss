import { CollaboratorNotification } from '../models/index.js';

const collaboratorStreams = new Map();

const formatDateVi = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

const writeSseEvent = (res, eventName, data) => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const publishToCollaborator = (collaboratorId, payload) => {
  if (!collaboratorId) return;
  const streams = collaboratorStreams.get(Number(collaboratorId));
  if (!streams || streams.size === 0) return;

  for (const res of streams) {
    try {
      writeSseEvent(res, 'notification', payload);
    } catch (err) {
      // Nếu stream lỗi thì bỏ qua, cleanup sẽ xử lý khi connection close.
    }
  }
};

const buildNominationContent = ({ candidateName, jobCode, createdByAdmin }) => {
  const safeCandidate = candidateName || 'Ứng viên';
  const safeJobCode = jobCode || 'N/A';
  if (createdByAdmin) {
    return `Hồ sơ ${safeCandidate} đã được tạo đơn tiến cử hộ - đơn tiến cử ${safeJobCode}`;
  }
  return `Hồ sơ ${safeCandidate} đã được tiến cử thành công - đơn tiến cử ${safeJobCode}`;
};

const buildStatusContent = ({ status, candidateName, jobCode, nyushaDate }) => {
  const safeCandidate = candidateName || 'Ứng viên';
  const safeJobCode = jobCode || 'N/A';
  const statusNum = Number(status);

  if (statusNum === 7 || statusNum === 8) {
    return `Hồ sơ ${safeCandidate} đã có lịch phỏng vấn đơn tiến cử ${safeJobCode}`;
  }
  if ([4, 6, 10].includes(statusNum)) {
    return `Hồ sơ ${safeCandidate} đã trượt tại đơn tiến cử ${safeJobCode}`;
  }
  if (statusNum === 11) {
    return `Hồ sơ ${safeCandidate} đã có thông báo trúng tuyển tại đơn tiến cử ${safeJobCode}`;
  }
  if (statusNum === 12) {
    return `Hồ sơ ${safeCandidate} đã xác nhận thông báo trúng tuyển tại đơn tiến cử ${safeJobCode}`;
  }
  if (statusNum === 13) {
    return `Hồ sơ ${safeCandidate} đã từ chối nhận việc tại đơn tiến cử ${safeJobCode}`;
  }
  if (statusNum === 14) {
    const dateText = formatDateVi(nyushaDate);
    return `Hồ sơ ${safeCandidate} đã vào công ty - đơn tiến cử ${safeJobCode}${dateText ? ` ngày ${dateText}` : ''}`;
  }
  if (statusNum === 16) {
    return `Hồ sơ ${safeCandidate} đã hủy giữa chừng tại đơn tiến cử ${safeJobCode}`;
  }
  return `Đơn tiến cử ${safeJobCode} đã được cập nhật trạng thái`;
};

export const collaboratorNotificationService = {
  subscribe(collaboratorId, res) {
    const key = Number(collaboratorId);
    if (!collaboratorStreams.has(key)) {
      collaboratorStreams.set(key, new Set());
    }
    collaboratorStreams.get(key).add(res);
  },

  unsubscribe(collaboratorId, res) {
    const key = Number(collaboratorId);
    const streams = collaboratorStreams.get(key);
    if (!streams) return;
    streams.delete(res);
    if (streams.size === 0) {
      collaboratorStreams.delete(key);
    }
  },

  async createAndEmit({ collaboratorId, title, content, jobId = null, url = null }) {
    if (!collaboratorId || !title || !content) return null;
    const notification = await CollaboratorNotification.create({
      collaboratorId,
      title,
      content,
      jobId,
      url,
      isRead: false
    });

    publishToCollaborator(collaboratorId, {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      jobId: notification.jobId,
      url: notification.url,
      isRead: notification.isRead,
      createdAt: notification.createdAt || notification.created_at || new Date().toISOString()
    });

    return notification;
  },

  async notifyNominationCreated({ collaboratorId, candidateName, jobCode, jobId = null, jobApplicationId = null, createdByAdmin = false }) {
    const content = buildNominationContent({ candidateName, jobCode, createdByAdmin });
    return this.createAndEmit({
      collaboratorId,
      title: 'Đơn tiến cử mới',
      content,
      jobId,
      url: jobApplicationId ? `/ctv/job-applications/${jobApplicationId}` : null
    });
  },

  async notifyStatusChanged({ collaboratorId, candidateName, jobCode, status, nyushaDate = null, jobId = null, jobApplicationId = null }) {
    const content = buildStatusContent({ status, candidateName, jobCode, nyushaDate });
    return this.createAndEmit({
      collaboratorId,
      title: 'Cập nhật trạng thái đơn tiến cử',
      content,
      jobId,
      url: jobApplicationId ? `/ctv/job-applications/${jobApplicationId}` : null
    });
  },

  async notifyIncomingMessage({ collaboratorId, jobCode, jobId = null, jobApplicationId = null }) {
    const safeJobCode = jobCode || 'N/A';
    return this.createAndEmit({
      collaboratorId,
      title: 'Tin nhắn mới',
      content: `Bạn có tin nhắn mới về đơn tiến cử ${safeJobCode}`,
      jobId,
      url: jobApplicationId ? `/ctv/job-applications/${jobApplicationId}` : null
    });
  },

  async notifyPaymentApprovedOrPaid({ collaboratorId, candidateName, jobCode, jobId = null, jobApplicationId = null, action = 'approved' }) {
    const safeCandidate = candidateName || 'Ứng viên';
    const safeJobCode = jobCode || 'N/A';
    const content = action === 'paid'
      ? `Bạn đã được thanh toán phí giới thiệu với hồ sơ ${safeCandidate} - đơn tiến cử ${safeJobCode}`
      : `Đơn thanh toán của bạn đã được phê duyệt với hồ sơ ${safeCandidate} - đơn tiến cử ${safeJobCode}`;

    return this.createAndEmit({
      collaboratorId,
      title: action === 'paid' ? 'Thanh toán hoàn tất' : 'Đơn thanh toán được phê duyệt',
      content,
      jobId,
      url: jobApplicationId ? `/ctv/job-applications/${jobApplicationId}` : null
    });
  }
};
