import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';
import BlogSession1 from '../component/Blog/BlogSession1';
import BlogSession2 from '../component/Blog/BlogSession2';
import BlogDetail from '../component/Blog/BlogDetail';

const RED = '#ED212F';

const BlogPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get('post');

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (postId) {
      loadPostById(postId);
    } else {
      setSelectedPost(null);
    }
  }, [postId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getPublicPosts({ limit: 100, status: 2 });
      const list = res?.data?.posts ?? [];
      setPosts(list);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPostById = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiService.getPublicPostById(id);
      if (res?.data?.post) {
        setSelectedPost(res.data.post);
      } else {
        setSelectedPost(null);
        navigate('/blog', { replace: true });
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Không thể tải bài viết.');
      setSelectedPost(null);
      navigate('/blog', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/blog?post=${post.id}`, { replace: false });
  };

  const handleBack = () => {
    navigate('/blog', { replace: false });
    setTimeout(() => {
      const listEl = document.querySelector('[data-blog-session="list"]');
      if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white font-['Raleway',sans-serif]">
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white border-b border-[#E9ECEF] shadow-sm">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 no-underline text-[#212529]">
            <img src="/landing/jobshare-logo.png" alt="JobShare" className="h-9 md:h-10 w-auto block" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-[#495057] hover:text-[#ED212F] no-underline">Trang chủ</Link>
            <span className="text-sm font-semibold" style={{ color: RED }}>Blog</span>
            <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-lg border-2 no-underline" style={{ borderColor: RED, color: RED }}>Đăng nhập</Link>
            <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-lg text-white no-underline" style={{ background: RED }}>Đăng ký</Link>
          </nav>
        </div>
      </header>
      <div className="pt-[72px]">
        <BlogSession1 />
      {selectedPost ? (
        <BlogDetail post={selectedPost} onBack={handleBack} />
      ) : (
        <BlogSession2
          posts={posts}
          loading={loading}
          error={error}
          onPostClick={handlePostClick}
        />
      )}
      </div>
    </div>
  );
};

export default BlogPage;
