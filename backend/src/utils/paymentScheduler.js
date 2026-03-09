import {
  JobApplication,
  PaymentRequest,
  Message
} from '../models/index.js';
import { Op } from 'sequelize';

/** Status 14 = Đã vào công ty */
const STATUS_JOINED_COMPANY = 14;

/**
 * Scheduled job: Sau 3 tháng kể từ ngày chuyển trạng thái sang "Đã vào công ty" (status 14),
 * CTV tự động tạo yêu cầu thanh toán (PaymentRequest) và tin nhắn trong chat.
 *
 * Chạy mỗi ngày một lần.
 */
export async function checkAndCreatePaymentRequestsAfter3Months() {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    // Tìm job_application có:
    // - status = 14 (Đã vào công ty)
    // - nyusha_date đã qua 3 tháng (nyusha_date <= threeMonthsAgo)
    // - chưa có payment_request nào
    const jobApplications = await JobApplication.findAll({
      where: {
        status: STATUS_JOINED_COMPANY,
        nyushaDate: {
          [Op.lte]: threeMonthsAgo,
          [Op.ne]: null
        }
      },
      include: [
        {
          model: PaymentRequest,
          as: 'paymentRequests',
          required: false
        }
      ]
    });

    let createdCount = 0;

    for (const jobApp of jobApplications) {
      // Bỏ qua nếu đã có payment request
      if (jobApp.paymentRequests && jobApp.paymentRequests.length > 0) {
        continue;
      }
      if (!jobApp.collaboratorId) {
        continue;
      }

      // Tạo PaymentRequest (CTV tự động tạo - amount = 0, admin nhập sau)
      const paymentRequest = await PaymentRequest.create({
        collaboratorId: jobApp.collaboratorId,
        jobApplicationId: jobApp.id,
        amount: 0,
        status: 0, // Chờ duyệt
        note: 'Yêu cầu thanh toán được tạo tự động sau 3 tháng kể từ ngày vào công ty. Admin vui lòng nhập số tiền và duyệt.'
      });

      // Tạo tin nhắn trong chat (senderType = 3: System)
      const nyushaStr = jobApp.nyushaDate
        ? new Date(jobApp.nyushaDate).toLocaleDateString('vi-VN')
        : 'N/A';
      const content = [
        '💳 **Hệ thống đã tạo yêu cầu thanh toán**',
        '',
        `Đơn tiến cử #${jobApp.id} đã qua 3 tháng kể từ ngày vào công ty (${nyushaStr}).`,
        'CTV đã tự động gửi yêu cầu thanh toán đến Admin.',
        'Admin vui lòng nhập số tiền và duyệt tại Trang quản lý thanh toán.',
        '',
        '*Tin nhắn tự động từ hệ thống*'
      ].join('\n');

      await Message.create({
        jobApplicationId: jobApp.id,
        adminId: null,
        collaboratorId: jobApp.collaboratorId,
        senderType: 3, // System
        content,
        isReadByAdmin: false,
        isReadByCollaborator: false
      });

      createdCount++;
      console.log(`[Payment Scheduler] Đã tạo payment request #${paymentRequest.id} và message cho job application #${jobApp.id}`);
    }

    if (createdCount > 0) {
      console.log(`[Payment Scheduler] Đã tạo ${createdCount} yêu cầu thanh toán mới`);
    }
    return createdCount;
  } catch (error) {
    console.error('[Payment Scheduler] Error:', error);
    throw error;
  }
}

/** @deprecated Dùng checkAndCreatePaymentRequestsAfter3Months thay thế */
export async function checkAndUpdatePaymentStatus() {
  return checkAndCreatePaymentRequestsAfter3Months();
}

/**
 * Khởi chạy scheduler (chạy mỗi ngày một lần)
 */
export function startPaymentScheduler() {
  // Chạy ngay lập tức
  checkAndCreatePaymentRequestsAfter3Months().catch(console.error);

  // Sau đó chạy mỗi 24 giờ
  setInterval(() => {
    checkAndCreatePaymentRequestsAfter3Months().catch(console.error);
  }, 24 * 60 * 60 * 1000); // 24 giờ

  console.log('[Payment Scheduler] Đã khởi động scheduler tạo yêu cầu thanh toán sau 3 tháng');
}

