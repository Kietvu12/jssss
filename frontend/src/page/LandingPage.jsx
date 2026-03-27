import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
  { icon: 'ai', title: 'AI hỗ trợ', desc: 'Hệ thống AI tự động phân tích, kết nối hồ sơ ứng viên với nhà tuyển dụng phù hợp' },
  { icon: 'dollar', title: 'Hoa hồng hấp dẫn', desc: 'CTV nhận hoa hồng lên đến 15% khi giới thiệu ứng viên thành công' },
  { icon: 'users', title: 'Cộng đồng lớn mạnh', desc: 'Hơn 1000 CTV đang hoạt động, hỗ trợ lẫn nhau trong việc tuyển dụng' },
  { icon: 'lock', title: 'An toàn & Uy tín', desc: 'Thông tin được bảo mật tuyệt đối, quy trình tuyển dụng minh bạch' },
  { icon: 'message', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn nhiệt tình, sẵn sàng giải đáp mọi thắc mắc của bạn' },
];

const PROCESS_STEPS = [
  { img: '/landing/step-1.jpg', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản CTV miễn phí chỉ trong 2 phút' },
  { img: '/landing/step-2.jpg', title: 'Tìm việc phù hợp', desc: 'Duyệt danh sách việc làm và chọn vị trí phù hợp' },
  { img: '/landing/step-3.png', title: 'Tiến cử ứng viên', desc: 'Gửi hồ sơ ứng viên cho nhà tuyển dụng' },
  { img: '/landing/step-4.png', title: 'Nhận hoa hồng', desc: 'Nhận thưởng khi ứng viên được tuyển dụng' },
];

const PARTNER_LOGOS = Array.from({ length: 18 }, (_, i) => `/landing/partner-${i + 1}.png`);

const TESTIMONIALS = [
  { content: 'Mình đã giới thiệu thành công 15 ứng viên trong 6 tháng qua. Hoa hồng được thanh toán đúng hẹn, quy trình rất minh bạch. Recommend cho mọi người!', name: 'Anh Minh', role: 'CTV Top 5 - Hà Nội', letter: 'A' },
  { content: 'Giao diện dễ sử dụng, việc làm đa dạng và chất lượng. Team support rất nhiệt tình, luôn hỗ trợ mình trong quá trình tiến cử ứng viên.', name: 'Chị Hương', role: 'CTV - TP.HCM', letter: 'H' },
  { content: 'JobShare là cầu nối tuyệt vời giữa nhân tài Việt Nam và doanh nghiệp Nhật Bản. Rất tự hào khi được là một phần của cộng đồng này!', name: 'Anh Dũng', role: 'CTV - Đà Nẵng', letter: 'D' },
];

const containerClass = 'max-w-[1300px] mx-auto px-6 lg:px-10';

const FREE_FEATURES = [
  {
    title: 'Truy cập kho dữ liệu việc làm',
    desc: 'Truy cập hàng nghìn cơ hội việc làm kỹ sư tại Nhật Bản và dễ dàng tìm kiếm vị trí phù hợp để giới thiệu ứng viên.',
    bullets: [
      'Xem và tìm kiếm các vị trí kỹ sư tại Nhật Bản theo ngành nghề, khu vực và yêu cầu',
      'Gợi ý việc làm phù hợp nhờ hệ thống AI matching',
      'Thông tin tuyển dụng chi tiết giúp tăng tỷ lệ tiến cử thành công',
    ],
  },
  {
    title: 'Quản lý hồ sơ ứng viên',
    desc: 'Quản lý thông tin ứng viên thông minh, giúp tiết kiệm thời gian và tăng hiệu quả tuyển dụng.',
    bullets: [
      'Tự động tạo hồ sơ ứng viên theo chuẩn format CV Nhật Bản bằng AI',
      'Lưu trữ và quản lý dữ liệu ứng viên không giới hạn',
      'Hệ thống gợi ý các vị trí phù hợp để tăng khả năng trúng tuyển',
    ],
  },
  {
    title: 'Quản lý tiến trình tuyển dụng',
    desc: 'Theo dõi toàn bộ quá trình tuyển dụng của ứng viên một cách tập trung và minh bạch.',
    bullets: [
      'Quản lý tiến độ tuyển dụng của từng ứng viên theo từng vòng phỏng vấn',
      'Dễ dàng trao đổi và phối hợp với đội ngũ Workstation trong quá trình tuyển dụng',
      'Tìm kiếm và lọc ứng viên theo trạng thái tuyển dụng',
    ],
  },
  {
    title: 'Cập nhật sự kiện tuyển dụng và đăng ký tham gia trực tiếp',
    desc: 'Cập nhật các sự kiện giới thiệu việc làm và chương trình đào tạo mới nhất dành riêng cho cộng tác viên JobShare.',
    bullets: [
      'Theo dõi các sự kiện giới thiệu việc làm tại Nhật Bản',
      'Tham gia các chương trình đào tạo và chia sẻ kinh nghiệm tuyển dụng',
      'Đăng ký tham gia sự kiện trực tiếp trên hệ thống',
    ],
  },
];

const NEWS = [
  { tag: 'Cộng tác viên', title: '5 cách bắt đầu làm CTV hiệu quả (dành cho người mới)', desc: 'Checklist nhanh giúp bạn có đơn đều, tránh sai lầm phổ biến khi mới tham gia.', date: '10/03/2026' },
  { tag: 'Thị trường Nhật', title: 'Những ngành kỹ sư đang tuyển nhiều tại Nhật 2026', desc: 'Tổng hợp xu hướng tuyển dụng và gợi ý cách chọn job phù hợp năng lực.', date: '08/03/2026' },
  { tag: 'Kỹ năng', title: 'Kịch bản tư vấn 3 phút: tăng tỉ lệ chốt hồ sơ', desc: 'Mẫu tin nhắn + câu hỏi lọc nhu cầu để bạn tư vấn nhanh, đúng trọng tâm.', date: '05/03/2026' },
];

function FeatureIcon({ type }) {
  const commonProps = {
    className: 'w-9 h-9',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (type === 'layers') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="12" height="8" rx="2" />
        <path d="M7 17h10v-8" />
      </svg>
    );
  }
  if (type === 'ai') {
    return (
      <svg {...commonProps}>
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
        <path d="M16 14l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z" />
      </svg>
    );
  }
  if (type === 'dollar') {
    return (
      <svg {...commonProps}>
        <path d="M12 3v18" />
        <path d="M9.5 7.5C9.5 6 10.5 5 12.25 5h.5C14.5 5 15.5 6 15.5 7.5 15.5 9 14.5 10 12.75 10h-1.5C9.5 10 8.5 11 8.5 12.5 8.5 14 9.5 15 11.25 15h.5C14 15 15 16 15 17.5" />
      </svg>
    );
  }
  if (type === 'users') {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.5" />
        <path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
        <path d="M13.5 18h5a3 3 0 0 0-3-3" />
      </svg>
    );
  }
  if (type === 'lock') {
    return (
      <svg {...commonProps}>
        <rect x="6" y="10" width="12" height="9" rx="2" />
        <path d="M9 10V8a3 3 0 0 1 6 0v2" />
        <circle cx="12" cy="14" r="1.2" />
      </svg>
    );
  }
  // message
  return (
    <svg {...commonProps}>
      <path d="M5 6h14a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H11l-3.5 2.5A1 1 0 0 1 6 17.2V15H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M8 10h8" />
      <path d="M8 12.5h4" />
    </svg>
  );
}

function JobIcon({ index }) {
  const commonProps = {
    className: 'w-7 h-7',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (index) {
    case 0:
      // building / office
      return (
        <svg {...commonProps}>
          <rect x="4" y="3" width="10" height="18" rx="1.5" />
          <path d="M14 8h4v13H8" />
          <path d="M8 7h2" />
          <path d="M8 11h2" />
          <path d="M8 15h2" />
        </svg>
      );
    case 1:
      // monitor / IT
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M9 19h6" />
          <path d="M12 16v3" />
        </svg>
      );
    case 2:
      // bolt / energy
      return (
        <svg {...commonProps}>
          <path d="M13 2 6 13h5l-1 9 7-11h-5z" />
        </svg>
      );
    case 3:
      // crane / construction
      return (
        <svg {...commonProps}>
          <path d="M3 20h18" />
          <path d="M6 20V8l7-3 4 2" />
          <path d="M6 12h6" />
          <rect x="14" y="10" width="4" height="5" rx="0.5" />
        </svg>
      );
    case 4:
      // cable / electric
      return (
        <svg {...commonProps}>
          <path d="M7 4v4" />
          <path d="M17 4v4" />
          <rect x="4" y="8" width="16" height="7" rx="2" />
          <path d="M12 15v5" />
        </svg>
      );
    default:
      // home / general
      return (
        <svg {...commonProps}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-4h4v4" />
        </svg>
      );
  }
}

function LandingPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [jobTab, setJobTab] = useState(0);
  const [featureTab, setFeatureTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroStatsReady, setHeroStatsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroStatsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

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
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            entry.target.classList.add('opacity-100', 'translate-y-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    document.querySelectorAll('.js-fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => (e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <div className="min-h-screen bg-white text-[#343A40] overflow-x-hidden font-['Montserrat',sans-serif]">
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes partners-marquee {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] bg-white border-b transition-all duration-300 ${
          headerScrolled ? 'shadow-lg' : ''
        }`}
        style={{ borderColor: GRAY_200, boxShadow: headerScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : undefined }}
      >
        <div className="bg-[#212529] py-2 text-xs text-[#CED4DA] max-md:hidden">
          <div className={`${containerClass} flex justify-between items-center`}>
            <span>Nền tảng kết nối việc làm Nhật thông qua cộng đồng giới thiệu nhân sự</span>
            <a href="tel:1900" className="hover:text-white transition-colors">Hotline: 1900 xxxx</a>
          </div>
        </div>
        <div className={`${containerClass} py-4 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-1 no-underline text-[#212529]">
            <img src="/landing/jobshare-logo.png" alt="JobShare" className="h-[38px] md:h-[44px] w-auto block" />
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#hero-section"
              onClick={scrollTo('hero-section')}
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              Trang chủ
            </a>
            <a
              href="#about"
              onClick={scrollTo('about')}
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              Giới thiệu
            </a>
            <a
              href="#features"
              onClick={scrollTo('features')}
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              Các tính năng
            </a>
            <a
              href="#news"
              onClick={scrollTo('news')}
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              Tin tức
            </a>
            <Link
              to="/blog"
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              Blog
            </Link>
            <a
              href="#faq"
              onClick={scrollTo('faq')}
              className="relative no-underline font-medium text-sm text-[#495057] transition-colors hover:text-[#ED212F] border-b-2 border-transparent hover:border-[#ED212F]"
            >
              FAQ
            </a>
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
          <nav className={`${containerClass} py-4 flex flex-col gap-1`}>
            <a
              href="#hero-section"
              onClick={scrollTo('hero-section')}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5"
            >
              Trang chủ
            </a>
            <a
              href="#about"
              onClick={scrollTo('about')}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5"
            >
              Giới thiệu
            </a>
            <a
              href="#features"
              onClick={scrollTo('features')}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5"
            >
              Các tính năng
            </a>
            <a
              href="#news"
              onClick={scrollTo('news')}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5"
            >
              Tin tức
            </a>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5 block"
            >
              Blog
            </Link>
            <a
              href="#faq"
              onClick={scrollTo('faq')}
              className="py-3 px-2 rounded-lg font-medium text-sm text-[#495057] hover:bg-[#ED212F]/5"
            >
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t" style={{ borderColor: GRAY_200 }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm border-2 hover:bg-[#ED212F]/5" style={{ borderColor: RED, color: RED }}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white hover:shadow-lg" style={{ background: RED }}>Đăng ký</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero - padding-top lớn hơn chiều cao navbar để không bị che */}
      <section id="hero-section" className="relative pt-[120px] md:pt-[200px] pb-[80px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FFFFFF 50%)' }}>
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5c-3 0-5.5 2.5-5.5 5.5S27 16 30 16s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-8 3c-1.5 0-2.5 1-2.5 2.5S20.5 13 22 13s2.5-1 2.5-2.5S23.5 8 22 8zm16 0c-1.5 0-2.5 1-2.5 2.5S36.5 13 38 13s2.5-1 2.5-2.5S39.5 8 38 8z' fill='%23ED212F' fill-opacity='0.15'/%3E%3C/svg%3E")` }} />
        <div className={`${containerClass} relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start`}>
          <div>
            <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-white/80 border border-[#E9ECEF]">
              <span>🇯🇵</span>
              <span>Số lượng CTV tuyển dụng kỹ sư cho doanh nghiệp Nhật <strong className="text-[#212529]">NO.1</strong></span>
            </div>
            <h1 className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#212529] leading-tight tracking-tight mb-6">
              KẾT NỐI CƠ HỘI<br />
              <span className="whitespace-nowrap" style={{ color: RED }}>NHÂN ĐÔI THÀNH CÔNG</span>
            </h1>
            <p className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-base text-[#868E96] max-w-lg mb-8 leading-relaxed">
              Nền tảng kết nối việc làm Nhật Bản hàng đầu Việt Nam. Cùng JobShare, mở ra cánh cửa sự nghiệp quốc tế với hàng trăm cơ hội việc làm chất lượng cao.
            </p>
            <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 flex flex-wrap gap-8 mb-8">
              {[
                { num: '200+', label: 'Việc làm đang tuyển' },
                { num: '50+', label: 'Đối tác Nhật Bản' },
                { num: '1000+', label: 'CTV đang hoạt động' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <div className="text-3xl font-extrabold min-h-[2.25rem] flex items-center" style={{ color: RED }}>
                    {!heroStatsReady ? (
                      <span
                        className="inline-block w-[28px] h-[28px] border-[8px] border-[rgba(237,33,47,0.2)] border-t-[#ED212F] rounded-full animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <span>{s.num}</span>
                    )}
                  </div>
                  <div className="text-sm text-[#868E96]">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 flex flex-wrap gap-4">
              <Link to="/agent/jobs" className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: RED, color: WHITE }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Xem việc làm ngay
              </Link>
              <a href="#about" onClick={scrollTo('about')} className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-lg font-semibold border-2 transition-all hover:bg-[#ED212F] hover:text-white" style={{ borderColor: RED, color: RED }}>Tìm hiểu thêm</a>
            </div>
          </div>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] mx-auto md:mx-0 md:ml-auto">
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {[
                { src: '/landing/tile-1.png', alt: 'Cộng tác viên 1' },
                { src: '/landing/tile-2.png', alt: 'Cộng tác viên 2' },
                { src: '/landing/tile-3.png', alt: 'Cộng tác viên 3' },
                { src: '/landing/tile-4.png', alt: 'Cộng tác viên 4' },
              ].map((img, i) => (
                <div
                  key={img.src}
                  className="bg-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] aspect-square rounded-2xl overflow-hidden"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover block"
                    loading={i < 2 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
            <div className="absolute -top-5 right-5 bg-white rounded-xl shadow-lg flex items-center gap-3 px-5 py-3 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#ED212F] text-lg bg-[#ED212F]/10">✓</div>
              <div className="text-[13px]"><strong className="block font-bold text-[#212529]">+50 việc mới</strong><span className="text-[#ADB5BD] text-xs">Tuần này</span></div>
            </div>
            <div className="absolute -bottom-5 left-5 bg-white rounded-xl shadow-lg flex items-center gap-3 px-5 py-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ED212F]/10 text-[#ED212F]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="text-[13px]"><strong className="block font-bold text-[#212529]">98% hài lòng</strong><span className="text-[#ADB5BD] text-xs">Từ ứng viên</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Community highlight above news */}
      <section className="py-10 md:py-14 bg-[#F8F9FA]">
        <div className={containerClass}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 max-w-4xl mx-auto">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <div className="h-24 sm:h-28 bg-gradient-to-r from-[#C41820] via-[#ED212F] to-[#FF6B6B]" />
                <div className="px-5 sm:px-10 pb-8 sm:pb-10 pt-14 sm:pt-16 text-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#212529] leading-snug mb-4">
                    Cộng đồng cộng tác viên tuyển dụng kỹ sư Nhật Bản{' '}
                    <span className="text-[#ED212F]">LỚN NHẤT VIỆT NAM</span>
                  </h2>
                  <p className="text-sm sm:text-base font-semibold text-[#1D4ED8] mb-3">
                    Miễn phí truy cập kho việc làm và quản lý tiến cử ứng viên.
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
                    Workstation JobShare là nền tảng kết nối cộng tác viên tuyển dụng và doanh nghiệp Nhật Bản,
                    tích hợp công nghệ và AI để hỗ trợ tuyển dụng hiệu quả hơn.
                  </p>
                </div>
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <img
                  src="/landing/icon-no1.png"
                  alt="No.1"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration promo above news */}
      <section className="py-10 md:py-14 bg-white">
        <div className={containerClass}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-10 items-center">
            <div className="max-w-md mx-auto md:mx-0">
              <img
                src="/landing/tile-1.png"
                alt="Đăng ký miễn phí xem việc làm"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-1.5 mb-4 rounded-full bg-[#E5F0FF] text-[11px] font-semibold tracking-[0.16em] uppercase text-[#1D4ED8]">
                Đăng ký
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-snug mb-3">
                Đăng ký miễn phí và<br className="hidden sm:block" />
                <span className="text-[#1D4ED8]">xem những công việc nào đang có sẵn!</span>
              </h2>
              <div className="space-y-2 text-[13px] sm:text-sm text-[#4B5563] mb-4 leading-relaxed">
                <p>
                  JobShare không thu phí gì từ việc bạn xem hoặc giới thiệu việc làm!
                </p>
                <p>
                  Tại sao không đăng ký miễn phí ngay bây giờ và tìm kiếm các công việc đang tuyển dụng?
                </p>
                <p>
                  Nếu bạn không có mã mời cần thiết để đăng ký, vui lòng liên hệ cuộc họp qua Zoom.
                  <span className="block text-[11px] text-[#9CA3AF] mt-1">
                    *Sẽ có quy trình sàng lọc trước khi đăng ký.
                  </span>
                </p>
              </div>
              <a
                href="/register"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D4ED8] hover:text-[#2563EB] transition-colors"
              >
                Nếu bạn muốn đăng ký, hãy nhấp vào đây.
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 tính năng miễn phí - tabs */}
      <section id="features" className="py-10 md:py-14 bg-[#F8F9FA]">
        <div className={containerClass}>
          <h2 className="text-center text-lg sm:text-xl font-extrabold tracking-wide uppercase mb-8" style={{ color: RED }}>
            4 TÍNH NĂNG MIỄN PHÍ CỦA WORKSTATION JOBSHARE
          </h2>
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[#E9ECEF] mb-6">
              {FREE_FEATURES.map((f, i) => (
                <button
                  key={f.title}
                  type="button"
                  onClick={() => setFeatureTab(i)}
                  className="px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px"
                  style={{
                    color: featureTab === i ? RED : '#6B7280',
                    borderColor: featureTab === i ? RED : 'transparent',
                  }}
                >
                  {i + 1}. {f.title}
                </button>
              ))}
            </div>
            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-6 sm:p-8">
              {(() => {
                const f = FREE_FEATURES[featureTab];
                return (
                  <>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-3">{f.title}</h3>
                    <p className="text-sm text-[#4B5563] leading-relaxed mb-5">{f.desc}</p>
                    <ul className="space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: RED }}>✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news" className="py-10 md:py-14 bg-white">
        <div className={containerClass}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-sm md:text-base font-extrabold tracking-wide md:tracking-[0.18em] uppercase" style={{ color: RED }}>
              JobShare News
            </h2>
            <button
              type="button"
              className="hidden md:inline-flex items-center gap-2 text-xs md:text-sm font-semibold transition-colors"
              style={{ color: RED }}
            >
              Xem tất cả tin tức
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 mb-4 text-xs md:text-sm text-[#868E96]">
            Cập nhật nhanh thông tin, mẹo làm CTV và xu hướng việc làm Nhật Bản.
          </div>

          <div className="divide-y divide-[#E9ECEF] border-y border-[#E9ECEF]">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 flex items-center gap-3 md:gap-4 py-3 md:py-3.5 cursor-pointer hover:bg-[#F8F9FA] px-0 md:px-1"
              >
                <span className="w-20 md:w-24 text-[11px] md:text-xs font-medium text-[#495057] shrink-0">
                  {n.date}
                </span>
                <span className="w-[7.5rem] md:w-32 shrink-0 flex">
                  <span className="text-[10px] md:text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FFE3E6] w-fit" style={{ color: RED }}>
                    {n.tag}
                  </span>
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm md:text-[15px] font-medium text-[#212529] leading-snug line-clamp-2">
                    {n.title}
                  </p>
                  {n.desc && (
                    <p className="hidden md:block text-xs text-[#868E96] mt-1 line-clamp-1">
                      {n.desc}
                    </p>
                  )}
                </div>
                <span className="text-[#ED212F] text-lg md:text-xl shrink-0" aria-hidden="true">
                  ›
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section id="jobs" className="py-[100px] bg-[#F8F9FA] relative">
        <div className="absolute inset-0 pointer-events-none opacity-100" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5c-3 0-5.5 2.5-5.5 5.5S27 16 30 16s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-8 3c-1.5 0-2.5 1-2.5 2.5S20.5 13 22 13s2.5-1 2.5-2.5S23.5 8 22 8zm16 0c-1.5 0-2.5 1-2.5 2.5S36.5 13 38 13s2.5-1 2.5-2.5S39.5 8 38 8z' fill='%23ED212F' fill-opacity='0.03'/%3E%3C/svg%3E")` }} />
        <div className={`${containerClass} relative`}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center max-w-[600px] mx-auto mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" /> Việc làm hot <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">Hơn 200 việc làm đang tìm kiếm nhân sự kỹ sư</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Đa dạng ngành nghề từ IT, Cơ khí, Xây dựng đến Điện - Điện tử với mức lương hấp dẫn</p>
          </div>
          {/* Trusted partners directly under jobs heading */}
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 max-w-[900px] mx-auto mb-10">
            <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#ADB5BD] mb-4 text-center">
              Đối tác tin cậy
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-10 gap-y-8 items-center justify-items-center md:justify-items-start">
              {PARTNER_LOGOS.map((src, i) => (
                <div key={src} className="flex items-center justify-center md:justify-start">
                  <img
                    src={src}
                    alt={`Đối tác tin cậy ${i + 1}`}
                    className="h-[34px] w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 flex justify-start sm:justify-center gap-2 sm:gap-4 mb-12 flex-nowrap overflow-x-auto py-1 -mx-1 px-1">
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
              <div key={i} className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 bg-white rounded-2xl overflow-hidden border border-[#E9ECEF] hover:-translate-y-2 hover:shadow-xl hover:border-[#ED212F]">
                <div className="p-6 border-b border-[#F1F3F5] flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F1F3F5] flex items-center justify-center text-[#ED212F] shrink-0">
                    <JobIcon index={i} />
                  </div>
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
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center mt-12">
            <Link to="/agent/jobs" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold border-2 transition-all hover:bg-[#ED212F] hover:text-white" style={{ borderColor: RED, color: RED }}>Xem tất cả việc làm →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-[100px] bg-white">
        <div className={containerClass}>
          <div id="features" />
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" /> Tại sao chọn chúng tôi <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">Ưu điểm vượt trội của JobShare</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Nền tảng được thiết kế tối ưu cho cả ứng viên và cộng tác viên</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center p-10 rounded-2xl hover:-translate-y-2 relative overflow-hidden group">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(237,33,47,0.02) 0%, transparent 100%)' }} />
                <div className="w-20 h-20 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mx-auto mb-6 transition-all group-hover:bg-[#ED212F] text-[#ED212F] group-hover:text-white relative z-10">
                  <FeatureIcon type={f.icon} />
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
        <div className={`${containerClass} relative z-10`}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4 text-white/80">
              <span className="w-[30px] h-1.5 rounded-full bg-white/50" /> Quy trình <span className="w-[30px] h-1.5 rounded-full bg-white/50" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">4 bước đơn giản để thành công</h2>
            <p className="text-base text-white/80 leading-relaxed">Quy trình ứng tuyển được tối giản, nhanh chóng và hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 relative">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white flex items-center justify-center mx-auto mb-5 relative z-10 ring-2 ring-white/30">
                  <img src={step.img} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-white/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[100px] bg-white">
        <div className={containerClass}>
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 text-center max-w-[600px] mx-auto mb-[60px]">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: RED }}>
              <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" /> Đánh giá <span className="w-[30px] h-1.5 rounded-full bg-[#ED212F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#212529] mb-4">CTV nói gì về chúng tôi?</h2>
            <p className="text-base text-[#868E96] leading-relaxed">Hàng nghìn CTV đã thành công cùng JobShare</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="js-fade-in opacity-0 translate-y-8 transition-all duration-700 bg-[#F8F9FA] rounded-2xl p-8 relative hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
              >
                <div className="absolute top-6 right-6 text-5xl opacity-20 font-serif leading-none" style={{ color: RED }}>
                  "
                </div>
                <p className="text-sm text-[#868E96] leading-relaxed mb-6 relative z-10 flex-1">
                  {t.content}
                </p>
                <div className="flex items-center gap-3 mt-auto pt-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: RED }}>
                    {t.letter}
                  </div>
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
      <section className="py-[100px] bg-[#212529]">
        <div className={`${containerClass} text-center`}>
          <div className="max-w-[800px] mx-auto">
          <div className="js-fade-in opacity-0 translate-y-8 transition-all duration-700">
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
      <footer className="bg-[#212529] pt-12 pb-10">
        <div className={containerClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1.5 max-w-[280px]">
              <div className="flex items-center gap-1 mb-4">
                <img src="/landing/jobshare-logo-white.png" alt="JobShare" className="h-10 w-auto block" />
              </div>
              <p className="text-sm text-[#ADB5BD] leading-relaxed mb-5">
                Nền tảng kết nối việc làm Nhật Bản thông qua cộng đồng giới thiệu nhân sự.
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
                <li className="mb-3"><Link to="/agent/jobs" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">Danh sách việc làm</Link></li>
                <li className="mb-3"><a href="#about" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">Giới thiệu</a></li>
                <li className="mb-3"><a href="#partner" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">Partner</a></li>
                <li className="mb-3"><Link to="/blog" className="text-sm text-[#ADB5BD] no-underline transition-all hover:text-white hover:pl-2">Blog</Link></li>
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
