import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, MessageCircle, FileText } from 'lucide-react';
import { getJobApplicationStatus, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const NominationTimeline = ({ nomination, messages = [] }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    if (!nomination) return;

    const events = [];

    if (nomination.appliedAt || nomination.applied_at) {
      events.push({
        id: 'created',
        type: 'created',
        title: t.nominationCreated,
        date: nomination.appliedAt || nomination.applied_at,
        icon: FileText,
        color: 'blue',
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
      });
    }

    const statusLabel = getJobApplicationStatusLabelByLanguage(nomination.status, language);
    events.push({
      id: 'current_status',
      type: 'status',
      title: `${t.statusLabel}: ${statusLabel}`,
      date: nomination.updatedAt || nomination.updated_at || nomination.appliedAt || nomination.applied_at,
      icon: nomination.status === 8 || nomination.status === 10 || nomination.status === 12 || nomination.status === 13 
        ? CheckCircle 
        : nomination.status === 15 || nomination.status === 16 || nomination.status === 7 || nomination.status === 9 || nomination.status === 14
        ? XCircle
        : AlertCircle,
      color: nomination.status === 8 || nomination.status === 10 || nomination.status === 12 || nomination.status === 13 
        ? 'green'
        : nomination.status === 15 || nomination.status === 16 || nomination.status === 7 || nomination.status === 9 || nomination.status === 14
        ? 'red'
        : 'yellow',
      status: nomination.status,
      isCurrent: true,
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

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      red: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[color] || colors.blue;
  };

  const getColorInlineStyle = (color) => {
    const colorMap = {
      blue: { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#93c5fd' },
      yellow: { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fde047' },
      orange: { backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' },
      green: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' },
      red: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="h-full rounded-lg border flex flex-col" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
          <Clock className="w-4 h-4" />
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
            
            <div className="space-y-4">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === timelineEvents.length - 1;
                const colorStyle = getColorInlineStyle(event.color);
                
                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    {/* Icon */}
                    <div 
                      className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                      style={colorStyle}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div 
                        className="p-3 rounded-lg border"
                        style={{
                          ...colorStyle,
                          ...(event.isCurrent ? {
                            boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.5), 0 0 0 4px rgba(96, 165, 250, 0.2)'
                          } : {})
                        }}
                      >
                        <h4 className="text-xs font-semibold mb-1" style={{ color: '#111827' }}>{event.title}</h4>
                        <p className="text-xs" style={{ color: '#4b5563' }}>{formatDate(event.date)}</p>
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

