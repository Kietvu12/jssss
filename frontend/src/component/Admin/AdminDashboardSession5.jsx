import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, User, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AdminDashboardSession5 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, language]);

  // Listen for calendar created events
  useEffect(() => {
    const handleCalendarCreated = () => {
      fetchAppointments(); // Reload appointments when calendar is created
    };
    window.addEventListener('calendarCreated', handleCalendarCreated);
    return () => {
      window.removeEventListener('calendarCreated', handleCalendarCreated);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Get calendars for the current month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString().split('T')[0];

      const response = await apiService.getAdminCalendars({
        startFrom: startDate,
        startTo: endDate,
        limit: 100
      });

      if (response.success && response.data?.calendars) {
        const appsMap = {};
        
        response.data.calendars.forEach((calendar) => {
          if (calendar.startAt || calendar.start_at) {
            const startDate = new Date(calendar.startAt || calendar.start_at);
            const dateKey = startDate.toISOString().split('T')[0];
            const time = startDate.toTimeString().slice(0, 5);
            
            if (!appsMap[dateKey]) {
              appsMap[dateKey] = [];
            }
            
            const eventType = calendar.eventType || calendar.event_type || 1;
            appsMap[dateKey].push({
              id: calendar.id,
              time: time,
              title: calendar.title || (eventType === 1 ? t.adminDashboardInterviewCandidate : eventType === 2 ? t.adminDashboardNyushaEvent : t.adminDashboardMeetingEvent),
              candidate: calendar.jobApplication?.name || calendar.jobApplication?.cv?.fullName || t.adminDashboardNa,
              job: calendar.jobApplication?.job?.title || t.adminDashboardNa,
              location: calendar.description || t.adminDashboardMeetingRoom,
              type: eventType === 1 ? 'interview' : eventType === 2 ? 'nyusha' : 'meeting',
              calendarId: calendar.id,
              jobApplicationId: calendar.jobApplicationId || calendar.job_application_id
            });
          }
        });

        setAppointments(appsMap);
      } else {
        setAppointments({});
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments({});
    } finally {
      setLoading(false);
    }
  };

  // Sample appointments data (fallback)
  const sampleAppointments = {
    '2025-01-15': [
      {
        id: 1,
        time: '09:00',
        title: '', candidate: '', job: '', location: '', type: 'interview',
      },
    ],
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDateAppointments = (day) => {
    if (!day) return [];
    const dateKey = formatDateKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return appointments[dateKey] || [];
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateKey = formatDateKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(dateKey);
    setShowModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = t.calendarMonthNames || ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = t.calendarDayNames || ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const days = getDaysInMonth(currentDate);
  const selectedAppointments = selectedDate ? (appointments[selectedDate] || []) : [];

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const upcoming = [];
    const allDates = Object.keys(appointments);
    
    allDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 7) {
        appointments[dateStr].forEach(apt => {
          upcoming.push({
            ...apt,
            date: dateStr,
            daysUntil: diffDays,
          });
        });
      }
    });
    
    return upcoming.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }
      return a.time.localeCompare(b.time);
    });
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 shadow-sm relative overflow-hidden">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t.adminDashboardAppointments}</h3>
            <p className="text-xs text-gray-500">{t.adminDashboardAppointmentsDesc}</p>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h4 className="text-base font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-700 py-1"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, index) => {
              const dayAppointments = getDateAppointments(day);
              const isToday = day && 
                currentDate.getFullYear() === new Date().getFullYear() &&
                currentDate.getMonth() === new Date().getMonth() &&
                day === new Date().getDate();

              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-1 rounded border-2 transition-all hover:bg-gray-50 ${
                    isToday
                      ? 'border-blue-600 bg-blue-50'
                      : dayAppointments.length > 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col h-full items-center justify-center">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <div className="mt-0.5 flex items-center gap-0.5">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`w-1 h-1 rounded-full ${
                              apt.type === 'interview' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          ></div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <span className="text-[10px] text-gray-500">+{dayAppointments.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-blue-600 bg-blue-50 rounded"></div>
              <span className="text-xs text-gray-700">{t.adminDashboardToday}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-green-200 bg-green-50 rounded"></div>
              <span className="text-xs text-gray-700">{t.adminDashboardHasSchedule}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-700">{t.adminDashboardInterview}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-700">{t.adminDashboardMeeting}</span>
            </div>
          </div>

          {/* Slide-in Modal - chỉ trong calendar container */}
          {showModal && (
            <>
              {/* Backdrop - chỉ che phần calendar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 40,
                  borderRadius: '0.5rem',
                }}
                onClick={() => setShowModal(false)}
              ></div>

              {/* Modal */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100%',
                  width: '100%',
                  maxWidth: '24rem',
                  backgroundColor: 'white',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  zIndex: 50,
                  transform: showModal ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 0.3s ease-in-out',
                  borderRadius: '0.5rem 0 0 0.5rem',
                }}
              >
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {selectedDate && new Date(selectedDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'ja-JP', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.adminDashboardAppointmentsCount.replace('{count}', selectedAppointments.length)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedAppointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">{t.adminDashboardNoAppointments}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {t.adminDashboardNoAppointmentsForDate}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  apt.type === 'interview'
                                    ? 'bg-blue-100'
                                    : 'bg-purple-100'
                                }`}
                              >
                                {apt.type === 'interview' ? (
                                  <User className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Briefcase className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-900">{apt.time}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                                  {apt.title}
                                </h4>
                                {apt.candidate && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-700">{apt.candidate}</span>
                                  </div>
                                )}
                                {apt.job && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Briefcase className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-700">{apt.job}</span>
                                  </div>
                                )}
                                {apt.company && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Briefcase className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-700">{apt.company}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-700">{apt.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Sự kiện sắp diễn ra</h3>
            <p className="text-xs text-gray-500">Các lịch hẹn trong 7 ngày tới</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">{t.adminDashboardNoUpcomingEvents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t.adminDashboardNoUpcomingEventsDesc}
                </p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.date);
                const isToday = event.daysUntil === 0;
                const isTomorrow = event.daysUntil === 1;
                
                return (
                  <div
                    key={`${event.date}-${event.id}`}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedDate(event.date);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          event.type === 'interview'
                            ? 'bg-blue-100'
                            : 'bg-purple-100'
                        }`}
                      >
                        {event.type === 'interview' ? (
                          <User className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-900">{event.time}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {isToday 
                              ? t.adminDashboardToday 
                              : isTomorrow 
                              ? t.adminDashboardTomorrow 
                              : t.adminDashboardDaysFromNow.replace('{n}', event.daysUntil)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                          {event.title}
                        </h4>
                        <div className="space-y-1">
                          {event.candidate && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">{event.candidate}</span>
                            </div>
                          )}
                          {event.job && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">{event.job}</span>
                            </div>
                          )}
                          {event.company && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">{event.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-700">{event.location}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {eventDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'ja-JP', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSession5;

