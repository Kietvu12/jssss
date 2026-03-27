import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentHomePageSession1 from '../../component/Agent/AgentHomePageSession1';
import AgentHomePageSession2 from '../../component/Agent/AgentHomePageSession2';
import AgentHomePageSession3 from '../../component/Agent/AgentHomePageSession3';
import AgentHomePageSession4 from '../../component/Agent/AgentHomePageSession4';
import AgentHomePageSession4Floating from '../../component/Agent/AgentHomePageSession4Floating';
import AgentHomePageSessionPaymentNomination from '../../component/Agent/AgentHomePageSessionPaymentNomination';
import apiService from '../../services/api';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsNote, setEventsNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingEvents(true);
        setEventsNote('');

        // Ưu tiên sự kiện sắp tới. Nếu không có (DB toàn sự kiện quá khứ) thì fallback hiển thị gần đây.
        const upcomingRes = await apiService.getCTVEvents({ upcoming: 1, limit: 5, sortBy: 'start_at', sortOrder: 'ASC' });
        const upcoming = upcomingRes?.success ? (upcomingRes.data?.events || []) : [];
        if (upcoming.length > 0) {
          setUpcomingEvents(upcoming);
          return;
        }

        const allRes = await apiService.getCTVEvents({ upcoming: 0, limit: 5, sortBy: 'start_at', sortOrder: 'DESC' });
        if (allRes.success) {
          setUpcomingEvents(allRes.data?.events || []);
          setEventsNote('Hiện không có sự kiện sắp tới, đang hiển thị các sự kiện gần đây.');
        } else {
          setUpcomingEvents([]);
        }
      } catch (e) {
        console.error(e);
        setUpcomingEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, []);

  const fmt = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-3 h-full">
        {/* Left Column - Sessions 1, 2, Payment/Nomination, 3 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 sm:space-y-3 md:space-y-4 lg:pr-2">
          {/* Upcoming events */}
          <div className="bg-white rounded-xl border p-3 sm:p-4" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Sự kiện sắp tới</h2>
              <span className="text-[11px] text-gray-500">{upcomingEvents.length} sự kiện</span>
            </div>
            {loadingEvents ? (
              <div className="mt-3 text-xs text-gray-500">Đang tải...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="mt-3 text-xs text-gray-500">Chưa có sự kiện sắp tới.</div>
            ) : (
              <>
                {eventsNote && (
                  <div className="mt-2 text-[11px] text-gray-500">
                    {eventsNote}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl border bg-white p-3 hover:shadow-sm transition-shadow"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                          {evt.title || 'Sự kiện'}
                        </div>
                        <div className="mt-1 flex flex-col gap-1 text-[11px] text-gray-600">
                          <div className="inline-flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{fmt(evt.start_at)}{evt.end_at ? ` → ${fmt(evt.end_at)}` : ''}</span>
                          </div>
                          {evt.location && (
                            <div className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white flex-shrink-0"
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={() => navigate(`/agent/events/${evt.id}`)}
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>

          <AgentHomePageSession1 />
          <AgentHomePageSession2 />
          <AgentHomePageSessionPaymentNomination />
          <AgentHomePageSession3 />
        </div>

        {/* Right Column - Session 4 (Desktop only) - thu gọn chiều ngang */}
        <div className="hidden lg:block w-80 max-w-[340px] flex-shrink-0 overflow-y-auto hide-scrollbar">
          <AgentHomePageSession4 />
        </div>
      </div>

      {/* Floating Schedule Button (Mobile only) */}
      <AgentHomePageSession4Floating />
    </>
  );
};

export default HomePage;