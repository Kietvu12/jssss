import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

/**
 * Thẻ tin nhắn khi admin thay đổi trạng thái – UI hồng nhạt (xanh khi Đã thanh toán), có tiêu đề trạng thái.
 */
const StatusChangeMessageCard = ({ statusName, reason, paymentAmount, tags = [], createdAt, formatDate }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const isPaidStatus = statusName && (statusName.includes('thanh toán') || statusName.includes('Đã thanh toán') || statusName.includes('Paid') || statusName.includes('支払'));
  const borderColor = isPaidStatus ? '#86efac' : '#fbc4c4';
  const headerBg = isPaidStatus ? '#dcfce7' : '#fce7e7';
  const cardBg = isPaidStatus ? '#f0fdf4' : '#fdf2f2';

  return (
    <div
      className="rounded-xl overflow-hidden max-w-[85%]"
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}
    >
      <div
        className="px-3 py-2 text-center font-bold text-sm"
        style={{ backgroundColor: headerBg, color: '#1f2937' }}
      >
        {statusName || t.chatStatusDefaultName}
      </div>

      <div className="px-3 py-3 space-y-2" style={{ backgroundColor: cardBg }}>
        {isPaidStatus && paymentAmount ? (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#374151' }}>
              {t.chatPaymentAmountLabel}
            </p>
            <div
              className="text-sm rounded border px-2 py-1.5 min-h-[2rem] font-semibold"
              style={{ borderColor: '#86efac', backgroundColor: '#fff', color: '#166534' }}
            >
              {paymentAmount}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#374151' }}>
              {t.chatReasonOf} ({statusName || t.statusLabel}):
            </p>
            <div
              className="text-sm rounded border px-2 py-1.5 min-h-[2rem]"
              style={{ borderColor: '#e5e7eb', backgroundColor: '#fff', color: '#111827' }}
            >
              {reason && reason.trim() ? reason.trim() : t.chatReasonPlaceholder}
            </div>
          </div>
        )}

        {/* Các thẻ nhỏ (placeholder hoặc từ props) */}
        {(tags && tags.length > 0) ? (
          <div className="space-y-1 pt-1">
            {tags.map((tag, i) => (
              <p key={i} className="text-sm pl-2" style={{ color: '#374151' }}>
                + {typeof tag === 'string' ? tag : tag.label || tag}
              </p>
            ))}
          </div>
        ) : (
          <div className="space-y-1 pt-1" style={{ color: '#6b7280' }}>
            {/* <p className="text-sm pl-2">+ tạo thêm các thẻ nhỏ</p>
            <p className="text-sm pl-4">+ tạo thêm các thẻ nhỏ hơn của thẻ nhỏ</p> */}
          </div>
        )}
      </div>

      {formatDate && createdAt && (
        <p className="text-xs px-3 py-1.5 border-t" style={{ borderColor, color: '#9ca3af' }}>
          {formatDate(createdAt)}
        </p>
      )}
    </div>
  );
};

export default StatusChangeMessageCard;
