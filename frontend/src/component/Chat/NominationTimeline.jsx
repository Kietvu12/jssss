import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, MessageCircle, FileText } from 'lucide-react';
import { getJobApplicationStatus, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const NominationTimeline = ({ nomination, messages = [] }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [timelineEvents, setTimelineEvents] = useState([]);
  const STATUS_TAG_STYLES = {
    1: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    2: { backgroundColor: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' },
    3: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    4: { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' },
    5: { backgroundColor: '#fdf4ff', color: '#a21caf', borderColor: '#f5d0fe' },
    6: { backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' },
    7: { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' },
    8: { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
    9: { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
    10: { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' },
    11: { backgroundColor: '#fff7ed', color: '#ea580c', borderColor: '#fdba74' },
    12: { backgroundColor: '#ecfeff', color: '#0891b2', borderColor: '#a5f3fc' },
    13: { backgroundColor: '#eef2ff', color: '#4338ca', borderColor: '#c7d2fe' },
    14: { backgroundColor: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' },
    15: { backgroundColor: '#ecfdf5', color: '#166534', borderColor: '#86efac' },
    16: { backgroundColor: '#fff7ed', color: '#9a3412', borderColor: '#fdba74' },
  };

  const EVENT_TAG_STYLES = {
    created: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    interview: { backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fde68a' },
    nyusha: { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
    status: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' },
  };

  const getEventTagStyle = (event) => {
    if (event.type === 'status') {
      return STATUS_TAG_STYLES[event.status] || EVENT_TAG_STYLES.status;
    }
    return EVENT_TAG_STYLES[event.type] || EVENT_TAG_STYLES.status;
  };

  const getIconColor = (event) => {
    if (event.type !== 'status') return '#6b7280';
    if (event.color === 'green') return '#16a34a';
    if (event.color === 'red') return '#dc2626';
    return '#d97706';
  };

  useEffect(() => {
    if (!nomination) return;
    const currentStatus = Number(nomination.status);

    const events = [];

    if (nomination.appliedAt || nomination.applied_at) {
      events.push({
        id: 'created',
        type: 'created',
        title: t.nominationCreated,
        date: nomination.appliedAt || nomination.applied_at,
        icon: FileText,
        color: 'blue',
        tagLabel: t.nominationCreated,
      });
    }

    if (nomination.interviewDate || nomination.interview_date) {
      events.push({
        id: 'interview1',
        type: 'interview',
        title: t.interviewRound1,
        date: nomination.interviewDate || nomination.interview_date,
        icon: Calendar,
        color: 'yellow',
        status: nomination.status,
        tagLabel: t.interviewRound1,
      });
    }

    if (nomination.interviewRound2Date || nomination.interview_round2_date) {
      events.push({
        id: 'interview2',
        type: 'interview',
        title: t.interviewRound2,
        date: nomination.interviewRound2Date || nomination.interview_round2_date,
        icon: Calendar,
        color: 'orange',
        status: nomination.status,
        tagLabel: t.interviewRound2,
      });
    }

    if (nomination.nyushaDate || nomination.nyusha_date) {
      events.push({
        id: 'nyusha',
        type: 'nyusha',
        title: t.nyushaDate,
        date: nomination.nyushaDate || nomination.nyusha_date,
        icon: CheckCircle,
        color: 'green',
        status: nomination.status,
        tagLabel: t.nyushaDate,
      });
    }

    const currentStatusInfo = getJobApplicationStatus(currentStatus);
    const statusCategory = currentStatusInfo?.category;
    const statusLabel = getJobApplicationStatusLabelByLanguage(currentStatus, language);
    const statusIsSuccess = statusCategory === 'success';
    const statusIsRejectedOrCancelled = statusCategory === 'rejected' || statusCategory === 'cancelled';
    events.push({
      id: 'current_status',
      type: 'status',
      title: `${t.statusLabel}: ${statusLabel}`,
      date: nomination.updatedAt || nomination.updated_at || nomination.appliedAt || nomination.applied_at,
      icon: statusIsSuccess ? CheckCircle : statusIsRejectedOrCancelled ? XCircle : AlertCircle,
      color: statusIsSuccess ? 'green' : statusIsRejectedOrCancelled ? 'red' : 'yellow',
      status: currentStatus,
      isCurrent: true,
      tagLabel: statusLabel,
    });

    // Sắp xếp theo thời gian
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTimelineEvents(events);
  }, [nomination, language]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const iconWrapperStyle = { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' };
  const cardStyle = (isCurrent) => ({
    backgroundColor: 'white',
    borderColor: '#f3f4f6',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
    ...(isCurrent ? { borderLeftWidth: '3px', borderLeftColor: '#6b7280' } : {}),
  });

  return (
    <div className="h-full rounded-lg border flex flex-col shadow-sm" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#f3f4f6' }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
          Timeline
        </h3>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {timelineEvents.length === 0 ? (
          <div className="text-center text-sm py-8" style={{ color: '#6b7280' }}>
            {t.timelineNoEvents}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#e5e7eb' }}></div>

            <div className="space-y-3">
              {timelineEvents.map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center"
                      style={iconWrapperStyle}
                    >
                      <Icon className="w-4 h-4" style={{ color: getIconColor(event) }} />
                    </div>

                    {/* Content - white card */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="rounded-lg border overflow-hidden"
                        style={cardStyle(event.isCurrent)}
                      >
                        <div
                          className="px-3 py-1 border-b"
                          style={getEventTagStyle(event)}
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {event.tagLabel || event.type}
                          </span>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-semibold mb-1" style={{ color: '#111827' }}>{event.title}</h4>
                          <p className="text-xs" style={{ color: '#6b7280' }}>{formatDate(event.date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NominationTimeline;

