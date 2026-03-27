import React from 'react';
import { normalizePostImageUrl } from '../../services/api';

const RED = '#ED212F';
const GRAY_800 = '#212529';
const GRAY_600 = '#868E96';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23E9ECEF" width="400" height="300"/%3E%3Ctext fill="%23ADB5BD" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo image%3C/text%3E%3C/svg%3E';

const BlogDetail = ({ post, onBack }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    return normalizePostImageUrl(path) || defaultImage;
  };

  const getMainImage = () => getImageUrl(post?.thumbnail);

  const getShortDescription = () => {
    const content = post?.content || '';
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  };

  const title = post?.title || '';
  const publishedAt = post?.publishedAt || post?.createdAt;

  if (!post) {
    return (
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-lg text-red-600">Không tìm thấy bài viết</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="font-semibold hover:underline"
            style={{ color: RED }}
          >
            Blog
          </button>
          <span className="text-[#CED4DA]">/</span>
          <span className="font-semibold text-[#495057]">{title}</span>
        </nav>

        {/* Layout: title + date + desc | image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-5 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight font-['Raleway',sans-serif]" style={{ color: GRAY_800 }}>
              {title}
            </h1>
            <p className="text-base text-[#495057]">
              {formatDate(publishedAt)}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-[#495057]">
              {getShortDescription()}
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="w-full aspect-video max-h-[400px] rounded-xl overflow-hidden bg-[#F1F3F5]">
              <img
                src={getMainImage()}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>
          </div>
        </div>

        {/* HTML content */}
        {post.content && (
          <div className="mt-10 md:mt-14">
            <div
              className="prose prose-lg max-w-none text-[#495057] leading-relaxed blog-detail-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <style>{`
              .blog-detail-content {
                font-family: 'Raleway', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }
              .blog-detail-content h1,
              .blog-detail-content h2,
              .blog-detail-content h3,
              .blog-detail-content h4,
              .blog-detail-content h5,
              .blog-detail-content h6,
              .blog-detail-content strong,
              .blog-detail-content b {
                font-family: 'Raleway', system-ui, sans-serif;
              }
              .blog-detail-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 1rem 0;
              }
              .blog-detail-content a { color: ${RED}; }
              .blog-detail-content a:hover { text-decoration: underline; }
            `}</style>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogDetail;
