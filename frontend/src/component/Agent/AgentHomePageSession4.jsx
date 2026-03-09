import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Calendar, MoreVertical, User, Grid3x3, List } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const AgentHomePageSession4 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [activeTab, setActiveTab] = useState('interview');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [viewMode, setViewMode] = useState('line'); // 'line' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [naitei, setNaitei] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredViewModeButton, setHoveredViewModeButton] = useState(false);
  const [hoveredSeeAllButton, setHoveredSeeAllButton] = useState(false);
  const [hoveredPrevMonthButton, setHoveredPrevMonthButton] = useState(false);
  const [hoveredNextMonthButton, setHoveredNextMonthButton] = useState(false);
  const [hoveredDatePickerPrevButton, setHoveredDatePickerPrevButton] = useState(false);
  const [hoveredDatePickerNextButton, setHoveredDatePickerNextButton] = useState(false);
  const [hoveredEventCardIndex, setHoveredEventCardIndex] = useState(null);
  const [hoveredMoreButtonIndex, setHoveredMoreButtonIndex] = useState(null);
  const [hoveredGoToMeetingButtonIndex, setHoveredGoToMeetingButtonIndex] = useState(null);
  const [hoveredCalendarDayIndex, setHoveredCalendarDayIndex] = useState(null);

  // Load schedule data
  useEffect(() => {
    loadSchedule();
  }, [currentMonth]);

  // Listen for calendar created events
  useEffect(() => {
    const handleCalendarCreated = () => {
      loadSchedule(); // Reload schedule when calendar is created
    };
    window.addEventListener('calendarCreated', handleCalendarCreated);
    return () => {
      window.removeEventListener('calendarCreated', handleCalendarCreated);
    };
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await apiService.getSchedule({ month, year });
      
      if (response.success && response.data) {
        // Process interviews
        const processedInterviews = (response.data.interviews || []).map(item => {
          const interviewDate = new Date(item.interviewDate);
          return {
            ...item,
            date: interviewDate.getDate(),
            time: item.interviewTime || '00:00',
            description: item.job?.company?.name || item.description || '',
            role: item.job?.title || item.role || '',
            isActive: new Date(item.interviewDate) >= new Date()
          };
        });
        
        // Process naitei
        const processedNaitei = (response.data.naitei || []).map(item => {
          const naiteiDate = new Date(item.naiteiDate || item.interviewDate);
          return {
            ...item,
            date: naiteiDate.getDate(),
            time: item.naiteiTime || item.interviewTime || '00:00',
            description: item.job?.company?.name || item.description || '',
            role: item.job?.title || item.role || '',
            isActive: naiteiDate >= new Date()
          };
        });
        
        setInterviews(processedInterviews);
        setNaitei(processedNaitei);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setInterviews([]);
      setNaitei([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for date picker (next 7 days) - dùng t.calendarDayNames theo ngôn ngữ
  const generateDates = () => {
    const dayNames = t.calendarDayNames || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: dayNames[date.getDay()],
        date: date.getDate()
      });
    }
    return dates;
  };

  const dates = generateDates();
  const monthNames = t.calendarMonthNames || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const allEvents = activeTab === 'interview' ? interviews : naitei;
  const events = viewMode === 'calendar' 
    ? allEvents.filter(event => event.date === selectedDate)
    : allEvents;

  // Calendar helper functions
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
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getDaysWithEvents = () => {
    const eventDates = new Set(allEvents.map(event => event.date));
    return eventDates;
  };

  const daysWithEvents = getDaysWithEvents();
  const calendarDays = getDaysInMonth(currentMonth);

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="rounded-lg shadow-sm border h-full flex flex-col max-w-full" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
      {/* Header */}
      <div className="p-2.5 sm:p-3 border-b" style={{ borderColor: '#f3f4f6' }}>
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-bold" style={{ color: '#111827' }}>{t.schedule}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'line' ? 'calendar' : 'line')}
              onMouseEnter={() => setHoveredViewModeButton(true)}
              onMouseLeave={() => setHoveredViewModeButton(false)}
              className="p-1.5 sm:p-2 rounded transition-colors"
              title={viewMode === 'line' ? t.agentHomeSwitchToCalendar : t.agentHomeSwitchToList}
              style={{
                backgroundColor: hoveredViewModeButton ? '#f3f4f6' : 'transparent'
              }}
            >
              {viewMode === 'line' ? (
                <Grid3x3 className="w-4 h-4" style={{ color: '#4b5563' }} />
              ) : (
                <List className="w-4 h-4" style={{ color: '#4b5563' }} />
              )}
            </button>
            <button 
              onMouseEnter={() => setHoveredSeeAllButton(true)}
              onMouseLeave={() => setHoveredSeeAllButton(false)}
              className="text-xs sm:text-sm font-medium transition-colors hidden sm:block"
              style={{
                color: hoveredSeeAllButton ? '#111827' : '#4b5563'
              }}
            >
              {t.seeAll}
            </button>
          </div>
        </div>

        {/* Month Navigation - Always visible */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => handleMonthChange(-1)}
            onMouseEnter={() => setHoveredPrevMonthButton(true)}
            onMouseLeave={() => setHoveredPrevMonthButton(false)}
            className="p-1 rounded transition-colors"
            style={{
              backgroundColor: hoveredPrevMonthButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: '#4b5563' }} />
          </button>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button 
            onClick={() => handleMonthChange(1)}
            onMouseEnter={() => setHoveredNextMonthButton(true)}
            onMouseLeave={() => setHoveredNextMonthButton(false)}
            className="p-1 rounded transition-colors"
            style={{
              backgroundColor: hoveredNextMonthButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: '#4b5563' }} />
          </button>
        </div>

        {/* Date Picker - Only in line mode */}
        {viewMode === 'line' && (
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-1">
            <button 
              onMouseEnter={() => setHoveredDatePickerPrevButton(true)}
              onMouseLeave={() => setHoveredDatePickerPrevButton(false)}
              className="p-1 rounded transition-colors flex-shrink-0"
              style={{
                backgroundColor: hoveredDatePickerPrevButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#4b5563' }} />
            </button>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center overflow-x-auto schedule-date-scroll">
              {dates.map((item, index) => {
                const isSelected = selectedDate === item.date;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(item.date)}
                    className="flex flex-col items-center px-1.5 sm:px-2 py-1.5 rounded-lg transition-colors min-w-[44px] sm:min-w-[48px] flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? '#dc2626' : 'transparent',
                      color: isSelected ? 'white' : '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="text-xs font-medium">{item.day}</span>
                    <span className="text-sm font-semibold" style={{ color: isSelected ? 'white' : '#111827' }}>
                      {item.date}
                    </span>
                  </button>
                );
              })}
            </div>
            <button 
              onMouseEnter={() => setHoveredDatePickerNextButton(true)}
              onMouseLeave={() => setHoveredDatePickerNextButton(false)}
              className="p-1 rounded transition-colors flex-shrink-0"
              style={{
                backgroundColor: hoveredDatePickerNextButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#4b5563' }} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={() => setActiveTab('interview')}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 border-b-2 transition-colors"
            style={{
              borderColor: activeTab === 'interview' ? '#dc2626' : 'transparent',
              color: activeTab === 'interview' ? '#dc2626' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'interview') {
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'interview') {
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: activeTab === 'interview' ? '#dc2626' : '#9ca3af' }} />
            <span className="text-xs font-medium whitespace-nowrap">{t.interview} {interviews.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('naitei')}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 border-b-2 transition-colors"
            style={{
              borderColor: activeTab === 'naitei' ? '#dc2626' : 'transparent',
              color: activeTab === 'naitei' ? '#dc2626' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'naitei') {
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'naitei') {
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: activeTab === 'naitei' ? '#dc2626' : '#9ca3af' }} />
            <span className="text-xs font-medium whitespace-nowrap">{t.naitei} {naitei.length}</span>
          </button>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {/* Calendar View - Only in calendar mode */}
          {viewMode === 'calendar' && (
            <div className="mb-3 pb-3 border-b" style={{ borderColor: '#e5e7eb' }}>
              {/* Calendar Grid - thu gọn */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {/* Day headers */}
                {(t.calendarDayNames || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day) => (
                  <div key={day} className="text-center text-[10px] font-semibold py-0.5" style={{ color: '#4b5563' }}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }
                  const hasEvent = daysWithEvents.has(day);
                  const isSelected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      onMouseEnter={() => setHoveredCalendarDayIndex(day)}
                      onMouseLeave={() => setHoveredCalendarDayIndex(null)}
                      className="aspect-square min-w-0 flex flex-col items-center justify-center rounded-md transition-colors relative"
                      style={{
                        backgroundColor: isSelected ? '#dc2626' : (hoveredCalendarDayIndex === day ? '#f3f4f6' : 'transparent'),
                        color: isSelected ? 'white' : '#111827'
                      }}
                    >
                      <span className="text-xs font-medium" style={{ color: isSelected ? 'white' : '#111827' }}>
                        {day}
                      </span>
                      {hasEvent && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'white' : '#dc2626' }}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                {t.loading || 'Loading...'}
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex gap-2">
                  {/* Time */}
                  <div className="text-xs font-medium pt-1 min-w-[42px]" style={{ color: '#6b7280' }}>
                    {event.time}
                  </div>

                  {/* Event Card */}
                  <div 
                    className="flex-1 min-w-0 border rounded-lg p-2.5 transition-shadow relative"
                    onMouseEnter={() => setHoveredEventCardIndex(event.id)}
                    onMouseLeave={() => setHoveredEventCardIndex(null)}
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#e5e7eb',
                      boxShadow: hoveredEventCardIndex === event.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                    }}
                  >
                    <button 
                      className="absolute top-3 right-3 p-1 rounded transition-colors"
                      onMouseEnter={() => setHoveredMoreButtonIndex(event.id)}
                      onMouseLeave={() => setHoveredMoreButtonIndex(null)}
                      style={{
                        backgroundColor: hoveredMoreButtonIndex === event.id ? '#f3f4f6' : 'transparent'
                      }}
                    >
                      <MoreVertical className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    </button>

                    <div className="flex items-start gap-3 pr-8">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                        <User className="w-5 h-5" style={{ color: '#dc2626' }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="text-sm font-semibold" style={{ color: '#111827' }}>{event.name}</h4>
                          <p className="text-xs" style={{ color: '#4b5563' }}>{event.role}</p>
                        </div>
                        <p className="text-xs mb-3 leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>
                          {event.description}
                        </p>
                        <button
                          onMouseEnter={() => {
                            if (event.isActive) {
                              setHoveredGoToMeetingButtonIndex(event.id);
                            }
                          }}
                          onMouseLeave={() => setHoveredGoToMeetingButtonIndex(null)}
                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: event.isActive 
                              ? (hoveredGoToMeetingButtonIndex === event.id ? '#b91c1c' : '#dc2626')
                              : '#f3f4f6',
                            color: event.isActive ? 'white' : '#6b7280',
                            cursor: event.isActive ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {t.goToMeeting}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                {viewMode === 'calendar' ? t.noEventsForDate : t.noEvents}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHomePageSession4;
