import React from 'react';

const RED = '#ED212F';

const BlogSession1 = () => {
  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden bg-white">
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${RED} 0%, transparent 70%)` }} />
      <div className="relative max-w-[1300px] mx-auto px-6 lg:px-10 text-center">
        <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 text-white" style={{ background: RED }}>
          Tin tức & Bài viết
        </span>
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 text-[#212529] font-['Raleway',sans-serif]">
          Blog <span style={{ color: RED }}>JobShare</span>
        </h1>
        <div className="w-20 h-1 rounded-full mx-auto mb-6" style={{ background: RED }} />
        <p className="text-lg md:text-xl text-[#868E96] max-w-2xl mx-auto">
          Cập nhật tin tức, hướng dẫn và chia sẻ kinh nghiệm từ cộng đồng CTV JobShare
        </p>
      </div>
    </section>
  );
};

export default BlogSession1;
