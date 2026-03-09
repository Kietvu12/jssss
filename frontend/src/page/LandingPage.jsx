import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const RED = '#ED212F';
const RED_DARK = '#C41820';
const GRAY_900 = '#212529';
const GRAY_700 = '#495057';
const GRAY_600 = '#868E96';
const GRAY_500 = '#ADB5BD';
const GRAY_400 = '#CED4DA';
const GRAY_200 = '#E9ECEF';
const GRAY_100 = '#F1F3F5';
const GRAY_50 = '#F8F9FA';
const WHITE = '#FFFFFF';

const JOBS = [
  { logo: '🏢', title: 'STAFF SERVICE - Kỹ sư thiết kế cơ khí', company: 'Staff Service Engineering', desc: 'Top 3 công ty phái cử lớn tại Nhật tuyển kỹ sư thiết kế cơ khí. Cơ hội làm việc trong môi trường kỹ thuật lớn tại Nhật, thu nhập theo năng lực...', location: 'Tokyo, Japan', type: 'Full-time', level: 'N3+', salary: '250,000' },
  { logo: '💻', title: 'OUTSOURCING - Kỹ sư IT', company: 'Outsourcing Technology', desc: 'Outsourcing Technology tuyển kỹ sư IT từ Việt Nam trình độ tương đương N3. Khách hàng lớn của công ty được phân bố tại các khu vực trên...', location: 'Osaka, Japan', type: 'Full-time', level: 'N3+', salary: '280,000' },
  { logo: '⚡', title: 'BENEXT - Kỹ sư cơ khí / Điện - Điện tử', company: 'BeNEXT Corporation', desc: 'Đợt tuyển thứ 18 của BeNEXT hợp tác với Workstation sắp diễn ra vào cuối tháng 9. Ứng viên N4+ từ 01 năm kinh nghiệm trở lên có thể ứng...', location: 'Nagoya, Japan', type: 'Full-time', level: 'N4+', salary: '220,000' },
  { logo: '🏗️', title: 'LINKTRUST - Kỹ sư quản lý thi công', company: 'Linktrust Co., Ltd', desc: 'Linktrust trụ sở Daikanyama, Tokyo tuyển kỹ sư quản lý thi công trình độ N3+. Nội dung công việc: quản lý tiến độ, chất lượng, an toàn và chi...', location: 'Tokyo, Japan', type: 'Full-time', level: 'N3+', salary: '260,000' },
  { logo: '🔌', title: 'Kỹ sư quản lý thi công cơ điện', company: 'Denki Engineering', desc: 'Công ty cơ điện hơn 50 năm tuổi, chuyên lắp đặt thiết bị điện, điều hòa không khí cho nhà máy và tòa nhà, thang máy; hệ thống phát điện...', location: 'Yokohama, Japan', type: 'Full-time', level: 'N3+', salary: '240,000' },
  { logo: '🏠', title: 'TECHNOPRO - Kỹ sư thiết kế xây dựng', company: 'TechnoPro Construction', desc: 'Tuyển kỹ sư thiết kế xây dựng / thiết kế kiến trúc 2 đầu Việt Nhật. Yêu cầu trình độ N3, có kinh nghiệm 1 năm trở lên...', location: 'Việt Nam - Nhật Bản', type: 'Full-time', level: 'N3+', salary: '230,000' },
];

const FEATURES = [
  { icon: 'layers', title: 'Việc làm chất lượng', desc: 'Hàng trăm vị trí từ các doanh nghiệp Nhật Bản uy tín, được kiểm duyệt kỹ càng' },
  { icon: 'clock', title: 'Phản hồi nhanh chóng', desc: 'Kết nối trực tiếp với nhà tuyển dụng, nhận phản hồi trong thời gian ngắn nhất' },
  { icon: 'dollar', title: 'Hoa hồng hấp dẫn', desc: 'CTV nhận hoa hồng lên đến 15% khi giới thiệu ứng viên thành công' },
  { icon: 'users', title: 'Cộng đồng lớn mạnh', desc: 'Hơn 1000 CTV đang hoạt động, hỗ trợ lẫn nhau trong việc tuyển dụng' },
  { icon: 'lock', title: 'An toàn & Uy tín', desc: 'Thông tin được bảo mật tuyệt đối, quy trình tuyển dụng minh bạch' },
  { icon: 'message', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn nhiệt tình, sẵn sàng giải đáp mọi thắc mắc của bạn' },
];

const PROCESS_STEPS = [
  { num: 1, title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản CTV miễn phí chỉ trong 2 phút' },
  { num: 2, title: 'Tìm việc phù hợp', desc: 'Duyệt danh sách việc làm và chọn vị trí phù hợp' },
  { num: 3, title: 'Tiến cử ứng viên', desc: 'Gửi hồ sơ ứng viên cho nhà tuyển dụng' },
  { num: 4, title: 'Nhận hoa hồng', desc: 'Nhận thưởng khi ứng viên được tuyển dụng' },
];

const PARTNERS = ['Staff Service', 'BeNEXT', 'TechnoPro', 'Outsourcing', 'LinkTrust'];

const TESTIMONIALS = [
  { content: 'Mình đã giới thiệu thành công 15 ứng viên trong 6 tháng qua. Hoa hồng được thanh toán đúng hẹn, quy trình rất minh bạch. Recommend cho mọi người!', name: 'Anh Minh', role: 'CTV Top 5 - Hà Nội', letter: 'A' },
  { content: 'Giao diện dễ sử dụng, việc làm đa dạng và chất lượng. Team support rất nhiệt tình, luôn hỗ trợ mình trong quá trình tiến cử ứng viên.', name: 'Chị Hương', role: 'CTV - TP.HCM', letter: 'H' },
  { content: 'JobShare là cầu nối tuyệt vời giữa nhân tài Việt Nam và doanh nghiệp Nhật Bản. Rất tự hào khi được là một phần của cộng đồng này!', name: 'Anh Dũng', role: 'CTV - Đà Nẵng', letter: 'D' },
];

function SakuraPetals() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createPetal = () => {
      const el = document.createElement('div');
      el.className = 'sakura-petal';
      const size = Math.random() * 15 + 10;
      const startPos = Math.random() * window.innerWidth;
      const duration = Math.random() * 5 + 8;
      const delay = Math.random() * 5;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${startPos}px`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;
      el.style.opacity = Math.random() * 0.4 + 0.2;
      container.appendChild(el);
      setTimeout(() => el.remove(), (duration + delay) * 1000);
    };

    const interval = setInterval(createPetal, 800);
    for (let i = 0; i < 10; i++) setTimeout(createPetal, i * 200);
    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} className="sakura-container" aria-hidden="true" />;
}

function LandingPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [jobTab, setJobTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    document.querySelectorAll('.landing-fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => (e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-page min-h-screen bg-white text-[#343A40] overflow-x-hidden">
      <SakuraPetals />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] bg-white border-b transition-all duration-300 ${
          headerScrolled ? 'shadow-lg' : ''
        }`}
        style={{ borderColor: GRAY_200, boxShadow: headerScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : undefined }}
      >
        <div className="bg-[#212529] py-2 text-xs text-[#CED4DA] max-md:hidden">
          <div className="landing-container flex justify-between items-center">
            <span>Nền tảng kết nối việc làm Nhật thông qua cộng đồng giới thiệu nhân sự</span>
            <a href="tel:1900" className="hover:text-white transition-colors">Hotline: 1900 xxxx</a>
          </div>
        </div>
        <div className="landing-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 no-underline text-[#212529]">
            <div>
              <span className="text-[28px] font-extrabold tracking-tight text-[#212529]">Job<span style={{ color: RED }}>Share</span></span>
              <div className="text-[10px] text-[#ADB5BD] mt-0.5">powered by Workstation</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#jobs" onClick={scrollTo('jobs')} className="landing-nav-link no-underline font-medium text-sm transition-colors hover:text-[#ED212F]" style={{ color: GRAY_700 }}>Danh sách việc làm</a>
            <a href="#about" onClick={scrollTo('about')} className="landing-nav-link no-underline font-medium text-sm transition-colors hover:text-[#ED212F]" style={{ color: GRAY_700 }}>Giới thiệu</a>
            <a href="#partner" onClick={scrollTo('partner')} className="landing-nav-link no-underline font-medium text-sm transition-colors hover:text-[#ED212F]" style={{ color: GRAY_700 }}>Partner</a>
            <a href="#guide" onClick={scrollTo('guide')} className="landing-nav-link no-underline font-medium text-sm transition-colors hover:text-[#ED212F]" style={{ color: GRAY_700 }}>Hướng dẫn sử dụng</a>
            <a href="#faq" onClick={scrollTo('faq')} className="landing-nav-link no-underline font-medium text-sm transition-colors hover:text-[#ED212F]" style={{ color: GRAY_700 }}>FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden lg:inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border-2 transition-all hover:bg-[#ED212F]/5" style={{ borderColor: RED, color: RED }}>Đăng nhập</Link>
            <Link to="/register" className="hidden lg:inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: RED, color: WHITE }}>Đăng ký</Link>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F1F3F5] transition-colors flex flex-col justify-center items-center gap-1.5 w-10 h-10"
            >
              <span className={`w-5 h-0.5 rounded-full bg-[#212529] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
              <span className={`w-5 h-0.5 rounded-full bg-[#212529] transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 rounded-full bg-[#212529] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            </button>
          </div>
        </div>

        {/* Toggle menu chỉ trên mobile (nav + Đăng nhập / Đăng ký) */}
        <div
          className="lg:hidden overflow-hidden transition-all duration-300 ease-out border-t bg-white"
          style={{
            borderColor: GRAY_200,
            maxHeight: mobileMenuOpen ? '400px' : '0',
            opacity: mobileMenuOpen ? 1 : 0,
          }}
        >
          <nav className="landing-container py-4 flex flex-col gap-1">
            <a href="#jobs" onClick={scrollTo('jobs')} className="landing-nav-link py-3 px-2 rounded-lg font-medium text-sm hover:bg-[#ED212F]/5" style={{ color: GRAY_700 }}>Danh sách việc làm</a>
            <a href="#about" onClick={scrollTo('about')} className="landing-nav-link py-3 px-2 rounded-lg font-medium text-sm hover:bg-[#ED212F]/5" style={{ color: GRAY_700 }}>Giới thiệu</a>
            <a href="#partner" onClick={scrollTo('partner')} className="landing-nav-link py-3 px-2 rounded-lg font-medium text-sm hover:bg-[#ED212F]/5" style={{ color: GRAY_700 }}>Partner</a>
            <a href="#guide" onClick={scrollTo('guide')} className="landing-nav-link py-3 px-2 rounded-lg font-medium text-sm hover:bg-[#ED212F]/5" style={{ color: GRAY_700 }}>Hướng dẫn sử dụng</a>
            <a href="#faq" onClick={scrollTo('faq')} className="landing-nav-link py-3 px-2 rounded-lg font-medium text-sm hover:bg-[#ED212F]/5" style={{ color: GRAY_700 }}>FAQ</a>
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t" style={{ borderColor: GRAY_200 }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm border-2 hover:bg-[#ED212F]/5" style={{ borderColor: RED, color: RED }}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white hover:shadow-lg" style={{ background: RED }}>Đăng ký</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero - padding-top lớn hơn chiều cao navbar để không bị che */}
      <section id="hero-section" className="relative landing-hero-section pt-[120px] md:pt-[200px] pb-[80px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FFFFFF 50%)' }}>
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5c-3 0-5.5 2.5-5.5 5.5S27 16 30 16s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-8 3c-1.5 0-2.5 1-2.5 2.5S20.5 13 22 13s2.5-1 2.5-2.5S23.5 8 22 8zm16 0c-1.5 0-2.5 1-2.5 2.5S36.5 13 38 13s2.5-1 2.5-2.5S39.5 8 38 8z' fill='%23ED212F' fill-opacity='0.15'/%3E%3C/svg%3E")` }} />
        <div className="landing-container relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
          <div>
            <div className="landing-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-white/80 border border-[#E9ECEF]">
              <span>🇯🇵</span>
              <span>Số lượng CTV tuyển dụng kỹ sư cho doanh nghiệp Nhật <strong className="text-[#212529]">NO.1</strong></span>
            </div>
            <h1 className="landing-fade-in text-4xl md:text-5xl font-extrabold text-[#212529] leading-tight tracking-tight mb-6">
              KẾT NỐI CƠ HỘI<br />
              <span style={{ color: RED }}>NHÂN ĐÔI THÀNH CÔNG</span>
            </h1>
            <p className="landing-fade-in text-base text-[#868E96] max-w-lg mb-8 leading-relaxed">
              Nền tảng kết nối việc làm Nhật Bản hàng đầu Việt Nam. Cùng JobShare, mở ra cánh cửa sự nghiệp quốc tế với hàng trăm cơ hội việc làm chất lượng cao.
            </p>
            <div className="landing-fade-in flex flex-wrap gap-8 mb-8">
              {[
                { num: '200+', label: 'Việc làm đang tuyển' },
                { num: '50+', label: 'Đối tác Nhật Bản' },
                { num: '1000+', label: 'CTV đang hoạt động' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold" style={{ color: RED }}>{s.num}</div>
                  <div className="text-sm text-[#868E96]">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="landing-fade-in flex flex-wrap gap-4">
              <Link to="/agent/jobs" className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: RED, color: WHITE }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Xem việc làm ngay
              </Link>
              <a href="#about" onClick={scrollTo('about')} className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-lg font-semibold border-2 transition-all hover:bg-[#ED212F] hover:text-white" style={{ borderColor: RED, color: RED }}>Tìm hiểu thêm</a>
            </div>
          </div>
          <div className="landing-fade-in relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] mx-auto md:mx-0 md:ml-auto">
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {['👨‍💼', '👩‍💻', '👨‍🔧', '👩‍🔬'].map((emoji, i) => (
                <div key={i} className="aspect-square rounded-2xl flex items-center justify-center text-4xl sm:text-5xl md:text-6xl text-white shadow-lg" style={{ background: [RED, '#FFD93D', '#6BCB77', '#4D96FF'][i] }}>
                  {emoji}
                </div>
              ))}
            </div>
            <div className="absolute -top-5 right-5 bg-white rounded-xl shadow-lg flex items-center gap-3 px-5 py-3 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#ED212F] text-lg bg-[#ED212F]/10">✓</div>
              <div className="text-[13px]"><strong className="block font-bold text-[#212529]">+50 việc mới</strong><span className="text-[#ADB5BD] text-xs">Tuần này</span></div>
            </div>
            <div className="absolute -bottom-5 left-5 bg-white rounded-xl shadow-lg flex items-center gap-3 px-5 py-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#ED212F] text-lg bg-[#ED212F]/10">⭐</div>
              <div className="text-[13px]"><strong className="block font-bold text-[#212529]">98% hài lòng</strong><span className="text-[#ADB5BD] text-xs">Từ ứng viên</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="jobs" className="py-[100px] bg-[#F8F9FA] relative">
        <div className="absolute inset-0 pointer-events-none opacity-100" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5c-3 0-5.5 2.5-5.5 5.5S27 16 30 16s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-8 3c-1.5 0-2.5 1-2.5 2.5S20.5 13 22 13s2.5-1 2.5-2.5S23.5 8 22 8zm16 0c-1.5 0-2.5 1-2.5 2.5S36.5 13 38 13s2.5-1 2.5-2.5S39.5 8 38 8z' fill='%23ED212F' fill-opacity='0.03'/%3E%3C/svg%3E")` }} />
        <div className="landing-container relative">
          <div className="landing-fade-in text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-0.5 bg-[#ED212F]" /> Việc làm hot <span className="w-[30px] h-0.5 bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">Hơn 200 việc làm đang tìm kiếm nhân sự kỹ sư</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Đa dạng ngành nghề từ IT, Cơ khí, Xây dựng đến Điện - Điện tử với mức lương hấp dẫn</p>
          </div>
          <div className="landing-fade-in flex justify-start sm:justify-center gap-2 sm:gap-4 mb-12 flex-nowrap overflow-x-auto py-1 -mx-1 px-1 hide-scrollbar">
            {['Tuyển tại Nhật', 'Tuyển tại Việt Nam', 'Tuyển 2 đầu Việt - Nhật'].map((label, i) => (
              <button
                key={label}
                onClick={() => setJobTab(i)}
                className={`shrink-0 px-3 py-2 rounded-full font-semibold text-xs border-2 transition-all sm:px-5 sm:py-2.5 sm:text-sm md:px-8 md:py-3.5 ${
                  jobTab === i ? 'text-white border-[#ED212F]' : 'bg-white text-[#495057] border-transparent hover:border-[#ED212F] hover:text-[#ED212F]'
                }`}
                style={jobTab === i ? { background: RED } : {}}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOBS.map((job, i) => (
              <div key={i} className="landing-fade-in bg-white rounded-2xl overflow-hidden border border-[#E9ECEF] transition-all hover:-translate-y-2 hover:shadow-xl hover:border-[#ED212F]">
                <div className="p-6 border-b border-[#F1F3F5] flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F1F3F5] flex items-center justify-center text-2xl shrink-0">{job.logo}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold text-[#212529] mb-1 line-clamp-2">{job.title}</h3>
                    <p className="text-[13px] text-[#ADB5BD]">{job.company}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[13px] text-[#868E96] leading-relaxed mb-5 line-clamp-3">{job.desc}</p>
                  <div className="flex flex-wrap gap-3 mb-5">
                    <span className="flex items-center gap-1.5 text-xs text-[#868E96]"><span style={{ color: RED }}>📍</span> {job.location}</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#868E96]"><span style={{ color: RED }}>💼</span> {job.type}</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#868E96]"><span style={{ color: RED }}>📚</span> {job.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-extrabold" style={{ color: RED }}>{job.salary} <span className="text-[13px] font-medium text-[#ADB5BD]">yên</span></span>
                    <Link to="/agent/jobs" className="text-[13px] font-semibold flex items-center gap-1 hover:gap-2 transition-[gap]" style={{ color: RED }}>Xem chi tiết →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="landing-fade-in text-center mt-12">
            <Link to="/agent/jobs" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold border-2 transition-all hover:bg-[#ED212F] hover:text-white" style={{ borderColor: RED, color: RED }}>Xem tất cả việc làm →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-[100px] bg-white">
        <div className="landing-container">
          <div className="landing-fade-in text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-0.5 bg-[#ED212F]" /> Tại sao chọn chúng tôi <span className="w-[30px] h-0.5 bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">Ưu điểm vượt trội của JobShare</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Nền tảng được thiết kế tối ưu cho cả ứng viên và cộng tác viên</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="landing-fade-in text-center p-10 rounded-2xl transition-all hover:-translate-y-2 relative overflow-hidden group">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(237,33,47,0.02) 0%, transparent 100%)' }} />
                <div className="w-20 h-20 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mx-auto mb-6 transition-all group-hover:bg-[#ED212F] relative z-10">
                  <span className="text-3xl">{f.icon === 'layers' ? '📚' : f.icon === 'clock' ? '⏱' : f.icon === 'dollar' ? '💰' : f.icon === 'users' ? '👥' : f.icon === 'lock' ? '🔒' : '💬'}</span>
                </div>
                <h3 className="text-lg font-bold text-[#212529] mb-3 relative z-10">{f.title}</h3>
                <p className="text-sm text-[#868E96] leading-relaxed relative z-10">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-[100px] relative overflow-hidden" style={{ background: RED }}>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-100 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23fff' stroke-opacity='0.1' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23fff' stroke-opacity='0.1' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23fff' stroke-opacity='0.1' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />
        <div className="landing-container relative z-10">
          <div className="landing-fade-in text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4 text-white/80">
              <span className="w-[30px] h-0.5 bg-white/50" /> Quy trình <span className="w-[30px] h-0.5 bg-white/50" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">4 bước đơn giản để thành công</h2>
            <p className="text-base text-white/80 leading-relaxed">Quy trình ứng tuyển được tối giản, nhanh chóng và hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 relative">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="landing-fade-in text-center relative">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[28px] font-extrabold mx-auto mb-5 relative z-10" style={{ color: RED }}>{step.num}</div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-white/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partner" className="py-[60px] bg-[#F8F9FA]">
        <div className="landing-container text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-[#ADB5BD] mb-8">Đối tác tin cậy</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {PARTNERS.map((name, i) => (
              <div key={name} className="flex items-center gap-2 text-lg font-bold text-[#CED4DA] hover:text-[#868E96] transition-colors cursor-default">
                <div className="w-10 h-10 rounded-lg bg-[#E9ECEF] flex items-center justify-center text-xl">🏢</div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[100px] bg-white">
        <div className="landing-container">
          <div className="landing-fade-in text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-0.5 bg-[#ED212F]" /> Đánh giá <span className="w-[30px] h-0.5 bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">CTV nói gì về chúng tôi?</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Hàng nghìn CTV đã thành công cùng JobShare</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="landing-fade-in bg-[#F8F9FA] rounded-2xl p-8 relative transition-all hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute top-6 right-6 text-5xl opacity-20 font-serif leading-none" style={{ color: RED }}>"</div>
                <p className="text-sm text-[#868E96] leading-relaxed mb-6 relative z-10">{t.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: RED }}>{t.letter}</div>
                  <div>
                    <div className="text-[15px] font-bold text-[#212529]">{t.name}</div>
                    <div className="text-xs text-[#ADB5BD]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[100px] bg-[#212529] relative overflow-hidden">
        <div className="absolute inset-0 opacity-100 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M50 10c-5 0-9 4-9 9 0 3 1 5 3 7-3 1-5 4-5 7 0 4 3 8 8 8h6c5 0 8-4 8-8 0-3-2-6-5-7 2-2 3-4 3-7 0-5-4-9-9-9z' fill='%23ED212F' fill-opacity='0.1'/%3E%3C/svg%3E")`, backgroundSize: '150px 150px' }} />
        <div className="landing-container text-center relative z-10">
          <div className="max-w-[800px] mx-auto">
          <div className="landing-fade-in">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5">Sẵn sàng <span style={{ color: RED }}>bắt đầu</span> chưa?</h2>
            <p className="text-lg text-[#9CA3AF] mb-10 leading-relaxed">
              Đăng ký ngay hôm nay để trở thành CTV của JobShare và khám phá hàng trăm cơ hội việc làm Nhật Bản. Hoàn toàn miễn phí!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: RED, color: WHITE }}>Đăng ký ngay</Link>
              <a href="#partner" onClick={scrollTo('partner')} className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold bg-white transition-all hover:bg-[#F8F9FA] hover:-translate-y-0.5" style={{ color: RED }}>Liên hệ tư vấn</a>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212529] pt-20 pb-10 border-t border-white/10">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1.5 max-w-[280px]">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl font-extrabold text-white">Job<span style={{ color: RED }}>Share</span></span>
              </div>
              <p className="text-sm text-[#ADB5BD] leading-relaxed mb-5">
                Nền tảng kết nối việc làm Nhật Bản thông qua cộng đồng giới thiệu nhân sự. Powered by Workstation.
              </p>
              <div className="flex gap-3">
                {['f', 'Z', '✉', '▶'].map((c, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white text-lg no-underline transition-all hover:bg-[#ED212F] hover:-translate-y-1">{c}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Khám phá</h4>
              <ul className="list-none p-0 m-0">
                {['Danh sách việc làm', 'Giới thiệu', 'Partner', 'Blog'].map((label) => (
                  <li key={label} className="mb-3">
                    <a href="#" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Hỗ trợ</h4>
              <ul className="list-none p-0 m-0">
                {['Hướng dẫn sử dụng', 'FAQ', 'Tư liệu về chúng tôi', 'Liên hệ'].map((label) => (
                  <li key={label} className="mb-3">
                    <a href="#" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Liên hệ</h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-3"><a href="#" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">📍 Hà Nội, Việt Nam</a></li>
                <li className="mb-3"><a href="#" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">📧 contact@ws-jobshare.com</a></li>
                <li className="mb-3"><a href="#" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">📞 1900 xxxx</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-5">
            <p className="text-[13px] text-[#ADB5BD]">© 2024 JobShare. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-[13px] text-[#ADB5BD] no-underline transition-colors hover:text-white">Điều khoản sử dụng</a>
              <a href="#" className="text-[13px] text-[#ADB5BD] no-underline transition-colors hover:text-white">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
