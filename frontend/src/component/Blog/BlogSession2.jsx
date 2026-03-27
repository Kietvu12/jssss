import React, { useState, useEffect } from 'react';
import { normalizePostImageUrl } from '../../services/api';

const RED = '#ED212F';
const GRAY_800 = '#212529';
const GRAY_600 = '#868E96';

const defaultThumb = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"%3E%3Crect fill="%23E9ECEF" width="400" height="240"/%3E%3Ctext fill="%23ADB5BD" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E';

const BlogSession2 = ({ posts = [], loading = false, error = null, onPostClick }) => {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    let filtered = [...posts];
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const content = (p.content || '').replace(/<[^>]*>/g, '').toLowerCase();
        return title.includes(q) || content.includes(q);
      });
    }
    if (startDate) {
      filtered = filtered.filter((p) => {
        const d = new Date(p.publishedAt || p.createdAt);
        return d >= new Date(startDate);
      });
    }
    if (endDate) {
      filtered = filtered.filter((p) => {
        const d = new Date(p.publishedAt || p.createdAt);
        return d <= new Date(endDate);
      });
    }
    setFilteredPosts(filtered);
  }, [posts, search, startDate, endDate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPostImage = (post) => {
    const url = normalizePostImageUrl(post?.thumbnail);
    return url || defaultThumb;
  };

  const getShortDescription = (post) => {
    const content = post?.content || '';
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const getCategoryLabel = (categoryId) => {
    if (!categoryId || (typeof categoryId === 'string' && !categoryId.trim())) return 'Tin tức';
    if (typeof categoryId === 'string' && categoryId.startsWith('[')) {
      try {
        const arr = JSON.parse(categoryId);
        return Array.isArray(arr) && arr.length ? `Danh mục ${arr[0]}` : 'Tin tức';
      } catch {
        return categoryId;
      }
    }
    return categoryId;
  };

  const blocks = filteredPosts.map((p) => ({
    ...p,
    category: getCategoryLabel(p.categoryId),
    date: formatDate(p.publishedAt || p.createdAt),
    description: getShortDescription(p),
    image: getPostImage(p)
  }));

  const categoryMap = new Map();
  blocks.forEach((b) => {
    const cat = b.category || 'Tin tức';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat).push(b);
  });
  const sections = Array.from(categoryMap.entries()).map(([category, items], i) => ({
    id: i + 1,
    title: category,
    category,
    blocks: items
  }));

  const handleToggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: { expanded: !(prev[category]?.expanded), page: 1 }
    }));
  };

  const handleCategoryPageChange = (category, newPage) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: { ...prev[category], page: newPage }
    }));
  };

  const getCategoryData = (category, categoryBlocks) => {
    const state = expandedCategories[category] || { expanded: false, page: 1 };
    if (!state.expanded) {
      return {
        posts: categoryBlocks.slice(0, 3),
        totalPages: 0,
        currentPage: 1,
        hasMore: categoryBlocks.length > 3
      };
    }
    const perPage = 9;
    const start = (state.page - 1) * perPage;
    const totalPages = Math.ceil(categoryBlocks.length / perPage);
    return {
      posts: categoryBlocks.slice(start, start + perPage),
      totalPages,
      currentPage: state.page,
      hasMore: false
    };
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white" data-blog-session="list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-lg text-[#495057]">Đang tải bài viết...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white" data-blog-session="list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white" data-blog-session="list">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & filter */}
        <div className="mb-12 p-4 md:p-6 rounded-xl border border-[#E9ECEF] bg-[#F8F9FA]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#495057] mb-2">Tìm theo tiêu đề / nội dung</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập từ khóa..."
                className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ED212F]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#495057] mb-2">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ED212F]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#495057] mb-2">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#DEE2E6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ED212F]/30"
              />
            </div>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-[#495057]">
              {search || startDate || endDate ? 'Không tìm thấy bài viết phù hợp.' : 'Chưa có bài viết nào.'}
            </p>
            {(search || startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
                className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg border-2 hover:bg-[#F8F9FA]"
                style={{ borderColor: RED, color: RED }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          sections.map((section, sectionIndex) => {
            const data = getCategoryData(section.category, section.blocks);
            const isExpanded = expandedCategories[section.category]?.expanded || false;
            return (
              <div key={section.id} className={sectionIndex > 0 ? 'mt-16 md:mt-20' : ''}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: GRAY_800, fontFamily: "'Raleway', sans-serif" }}>
                    {section.title}
                  </h2>
                  {(data.hasMore || isExpanded) && (
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(section.category)}
                      className="flex items-center gap-1 text-sm font-semibold hover:underline"
                      style={{ color: RED }}
                    >
                      {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                      <span className="inline-block text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {data.posts.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => onPostClick && onPostClick(block)}
                      className="text-left flex flex-col rounded-xl overflow-hidden border border-[#E9ECEF] hover:shadow-lg hover:border-[#ED212F]/30 transition-all group"
                    >
                      <div className="w-full h-48 md:h-56 overflow-hidden bg-[#F1F3F5]">
                        <img
                          src={block.image}
                          alt={block.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = defaultThumb; }}
                        />
                      </div>
                      <div className="p-4 md:p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#ED212F] transition-colors" style={{ color: GRAY_800, fontFamily: "'Raleway', sans-serif" }}>
                          {block.title}
                        </h3>
                        <p className="text-xs text-[#ADB5BD] mb-2">{block.date}</p>
                        <p className="text-sm text-[#495057] leading-relaxed line-clamp-3">{block.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {isExpanded && data.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      type="button"
                      onClick={() => handleCategoryPageChange(section.category, data.currentPage - 1)}
                      disabled={data.currentPage === 1}
                      className="px-4 py-2 border border-[#DEE2E6] rounded-lg disabled:opacity-50 text-sm font-medium text-[#495057]"
                    >
                      Trước
                    </button>
                    {[...Array(data.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const show = pageNum === 1 || pageNum === data.totalPages || (pageNum >= data.currentPage - 2 && pageNum <= data.currentPage + 2);
                      if (!show) return pageNum === data.currentPage - 3 || pageNum === data.currentPage + 3 ? <span key={pageNum} className="px-2">...</span> : null;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handleCategoryPageChange(section.category, pageNum)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={data.currentPage === pageNum ? { background: RED, color: 'white' } : { border: '1px solid #DEE2E6', color: '#495057' }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleCategoryPageChange(section.category, data.currentPage + 1)}
                      disabled={data.currentPage === data.totalPages}
                      className="px-4 py-2 border border-[#DEE2E6] rounded-lg disabled:opacity-50 text-sm font-medium text-[#495057]"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default BlogSession2;
