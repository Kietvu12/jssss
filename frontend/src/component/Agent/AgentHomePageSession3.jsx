import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Target, FileText, Star, ExternalLink, X, Briefcase, Building2, MapPin, DollarSign, Calendar, Users, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import { fetchInformationList, startInformationListPolling, stopInformationListPolling } from '../../store/actions/informationListActions';


const AgentHomePageSession3 = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { loading, loadingMore, data: tableData = [], pagination = {}, error } = useSelector(
    (state) => state.informationList || {}
  );
  
  // Debug: Log Redux state
  useEffect(() => {
    console.log('[Component] Redux state:', { 
      loading, 
      loadingMore, 
      tableDataLength: tableData?.length, 
      pagination, 
      error,
      tableData: tableData?.slice(0, 3) // Log first 3 items
    });
  }, [loading, loadingMore, tableData, pagination, error]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalJobs, setModalJobs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalPagination, setModalPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10
  });
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [hoveredLoadMoreButton, setHoveredLoadMoreButton] = useState(false);
  const [hoveredRetryButton, setHoveredRetryButton] = useState(false);
  const [hoveredCloseButton, setHoveredCloseButton] = useState(false);
  const [hoveredModalLoadMoreButton, setHoveredModalLoadMoreButton] = useState(false);
  const [hoveredJobCardIndex, setHoveredJobCardIndex] = useState(null);
  const [hoveredCloseModalButton, setHoveredCloseModalButton] = useState(false);

  // Fetch data on component mount and start polling
  useEffect(() => {
    dispatch(fetchInformationList(1, false));
    dispatch(startInformationListPolling(30000)); // Poll every 30 seconds
    
    // Cleanup: stop polling when component unmounts
    return () => {
      dispatch(stopInformationListPolling());
    };
  }, [dispatch]);

  // Calculate hasMore based on pagination
  const hasMore = React.useMemo(() => {
    const totalPages = Math.max(
      pagination.jobPickups?.totalPages || 0,
      pagination.campaigns?.totalPages || 0,
      pagination.posts?.totalPages || 0
    );
    return totalPages > 1;
  }, [pagination]);

  // Tách dữ liệu thành 3 nhóm: Campaign, Job pick up, News
  const campaigns = React.useMemo(
    () => (tableData || []).filter((item) => item.type === 'campaign'),
    [tableData]
  );
  const jobPickups = React.useMemo(
    () => (tableData || []).filter((item) => item.type === 'job-pickup'),
    [tableData]
  );
  const newsItems = React.useMemo(
    () => (tableData || []).filter((item) => item.type === 'news'),
    [tableData]
  );

  const loadMore = () => {
    const nextPage = Math.floor((tableData?.length || 0) / 20) + 1;
    dispatch(fetchInformationList(nextPage, true));
  };

  // Legacy loadData function - kept for backward compatibility but not used
  const loadData = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const limit = 20; // Tăng limit lên 20 items mỗi loại
      // Lấy items từ mỗi loại
      const [jobPickupsRes, campaignsRes, postsRes] = await Promise.all([
        apiService.getCTVJobPickups({ page, limit, sortBy: 'created_at', sortOrder: 'DESC' }).catch(() => ({ success: false, data: { pickups: [], pagination: {} } })),
        apiService.getCTVCampaigns({ page, limit, status: 1, sortBy: 'created_at', sortOrder: 'DESC' }).catch(() => ({ success: false, data: { campaigns: [], pagination: {} } })),
        apiService.getCTVPosts({ page, limit, status: 2, sortBy: 'published_at', sortOrder: 'DESC' }).catch(() => ({ success: false, data: { posts: [], pagination: {} } }))
      ]);

      const newData = [];
      const newPagination = { ...pagination };
      
      // Lưu pagination info
      if (jobPickupsRes.success && jobPickupsRes.data?.pagination) {
        newPagination.jobPickups = jobPickupsRes.data.pagination;
      }
      if (campaignsRes.success && campaignsRes.data?.pagination) {
        newPagination.campaigns = campaignsRes.data.pagination;
      }
      if (postsRes.success && postsRes.data?.pagination) {
        newPagination.posts = postsRes.data.pagination;
      }
      setPagination(newPagination);

      // Add job pickups
      if (jobPickupsRes.success && jobPickupsRes.data?.pickups) {
        jobPickupsRes.data.pickups.forEach((pickup) => {
          newData.push({
            id: `pickup-${pickup.id}`,
            type: 'job-pickup',
            originalId: pickup.id,
            tag: t.agentHomeJobPickup,
            tagColor: 'bg-yellow-100 text-yellow-700',
            tagIcon: Star,
            title: pickup.name || '',
            date: formatDate(pickup.createdAt),
            description: pickup.description || '',
            action: t.viewDetails || 'Xem chi tiết',
            url: `/agent/jobs?pickupId=${pickup.id}`,
            isNew: isRecent(pickup.createdAt),
          });
        });
      }

      // Add campaigns
      if (campaignsRes.success && campaignsRes.data?.campaigns) {
        console.log(`[Frontend] Campaigns received:`, campaignsRes.data.campaigns.length, campaignsRes.data.campaigns.map(c => ({ id: c.id, name: c.name })));
        campaignsRes.data.campaigns.forEach((campaign) => {
          newData.push({
            id: `campaign-${campaign.id}`,
            type: 'campaign',
            originalId: campaign.id,
            tag: t.agentHomeCampaign,
            tagColor: 'bg-purple-100 text-purple-700',
            tagIcon: Target,
            title: campaign.name || '',
            date: formatDate(campaign.startDate || campaign.createdAt),
            description: campaign.description || '',
            action: t.viewDetails || 'Xem chi tiết',
            url: `/agent/jobs?campaignId=${campaign.id}`,
            isNew: campaign.status === 1 && isRecent(campaign.startDate || campaign.createdAt),
          });
        });
      } else {
        console.log(`[Frontend] Campaigns response:`, campaignsRes);
      }

      // Add posts (news)
      if (postsRes.success && postsRes.data?.posts) {
        postsRes.data.posts.forEach((post) => {
          newData.push({
            id: `post-${post.id}`,
            type: 'news',
            originalId: post.id,
            tag: t.agentHomeNews,
            tagColor: 'bg-blue-100 text-blue-700',
            tagIcon: FileText,
            title: post.title || '',
            date: formatDate(post.publishedAt || post.createdAt),
            description: post.metaDescription || post.content?.substring(0, 100) || '',
            action: t.viewDetails || 'Xem chi tiết',
            url: `/agent/jobs?postId=${post.id}`,
            isNew: isRecent(post.publishedAt || post.createdAt),
          });
        });
      }

      // Sort by date (newest first) và loại bỏ duplicate
      newData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB - dateA;
      });

      // Loại bỏ duplicate dựa trên id
      const uniqueData = [];
      const seenIds = new Set();
      newData.forEach(item => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueData.push(item);
        } else {
          console.log(`[Frontend] Duplicate found and removed:`, item.id, item.title);
        }
      });
      
      console.log(`[Frontend] Total items before unique: ${newData.length}, after unique: ${uniqueData.length}`);
      console.log(`[Frontend] Campaigns in final data:`, uniqueData.filter(item => item.type === 'campaign').map(item => ({ id: item.id, title: item.title })));

      if (append) {
        setTableData(prev => {
          const combined = [...prev, ...uniqueData];
          // Loại bỏ duplicate trong combined data
          const seen = new Set();
          return combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        });
      } else {
        setTableData(uniqueData);
      }

      // Kiểm tra xem còn dữ liệu để load không
      const totalPages = Math.max(
        newPagination.jobPickups?.totalPages || 0,
        newPagination.campaigns?.totalPages || 0,
        newPagination.posts?.totalPages || 0
      );
      setHasMore(page < totalPages);
    } catch (error) {
      console.error('Error loading data:', error);
      if (!append) {
        setTableData([]);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'ja-JP',
      { year: 'numeric', month: '2-digit', day: '2-digit' }
    );
  };

  const isRecent = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // New if within 7 days
  };

  // Strip HTML tags and format text
  const stripHtml = (html) => {
    if (!html) return '';
    
    // Check if it's already plain text
    if (!html.includes('<')) return html;
    
    try {
      // Create a temporary div element
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      // Convert <ul><li> and <ol><li> to bullet points
      const lists = tmp.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        const bulletPoints = Array.from(items).map(li => {
          const text = li.textContent.trim();
          return text ? `• ${text}` : '';
        }).filter(Boolean).join('\n');
        
        if (bulletPoints) {
          const textNode = document.createTextNode(bulletPoints);
          if (list.parentNode) {
            list.parentNode.replaceChild(textNode, list);
          }
        } else {
          list.remove();
        }
      });
      
      // Convert <br> to newlines
      const breaks = tmp.querySelectorAll('br');
      breaks.forEach(br => {
        br.replaceWith('\n');
      });
      
      // Convert <p> to newlines
      const paragraphs = tmp.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          p.replaceWith(`\n${text}\n`);
        } else {
          p.remove();
        }
      });
      
      // Get text content
      let text = tmp.textContent || tmp.innerText || '';
      
      // Clean up extra whitespace and newlines
      text = text
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
        .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
        .trim();
      
      return text;
    } catch (error) {
      console.error('Error stripping HTML:', error);
      // Fallback: simple regex to remove HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  };

  const handleRowClick = async (item, page = 1) => {
    setSelectedItem(item);
    setShowModal(true);
    setModalLoading(true);
    setModalPage(page);
    
    if (page === 1) {
      setModalJobs([]);
    }

    try {
      let response;
      
      if (item.type === 'campaign') {
        // Lấy jobs từ campaign thông qua job_campaigns
        console.log(`[Frontend] Loading jobs for campaign ID: ${item.originalId}`);
        response = await apiService.getCTVJobsByCampaign(item.originalId, { 
          page, 
          limit: 10,
          sortBy: 'id',
          sortOrder: 'DESC'
        });
        console.log(`[Frontend] Campaign jobs response:`, response);
      } else if (item.type === 'job-pickup') {
        // Lấy jobs từ job pickup thông qua job_pickups_id
        console.log(`[Frontend] Loading jobs for job pickup ID: ${item.originalId}`);
        response = await apiService.getCTVJobsByJobPickup(item.originalId, { 
          page, 
          limit: 10,
          sortBy: 'id',
          sortOrder: 'DESC'
        });
        console.log(`[Frontend] Job pickup jobs response:`, response);
      } else if (item.type === 'news') {
        // Lấy jobs từ post (nếu có)
        const params = { page, limit: 10, postId: item.originalId };
        response = await apiService.getCTVJobs(params);
      } else {
        setModalJobs([]);
        setModalLoading(false);
        return;
      }
      
      if (response.success && response.data?.jobs) {
        if (page === 1) {
          setModalJobs(response.data.jobs);
        } else {
          setModalJobs(prev => [...prev, ...response.data.jobs]);
        }
        
        if (response.data?.pagination) {
          setModalPagination(response.data.pagination);
        }
      } else {
        if (page === 1) {
          setModalJobs([]);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      if (page === 1) {
        setModalJobs([]);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const loadMoreModalJobs = () => {
    if (selectedItem && modalPage < modalPagination.totalPages) {
      handleRowClick(selectedItem, modalPage + 1);
    }
  };

  const formatJob = (job) => {
    // Get commission info from jobValues
    // Cấu trúc: job có jobCommissionType ('fixed' hoặc 'percent')
    // jobValues có value (string) chứa giá trị cụ thể
    const jobValues = job.jobValues || job.profits || [];
    let commissionText = t.agentHomeContact;
    
    if (jobValues.length > 0) {
      // Lấy jobValue đầu tiên
      const firstJobValue = jobValues[0];
      
      // Lấy giá trị từ jobValue.value
      const value = firstJobValue.value;
      const commissionType = job.jobCommissionType || 'fixed';
      
      if (value) {
        if (commissionType === 'fixed' || commissionType === 'percent') {
          // Nếu là fixed, giá trị là số tiền
          if (commissionType === 'fixed') {
            const amount = parseInt(value) || 0;
            if (amount > 0) {
              commissionText = `${amount.toLocaleString('vi-VN')} yên`;
            }
          } else if (commissionType === 'percent') {
            // Nếu là percent, giá trị có thể là string như "5%" hoặc số
            if (typeof value === 'string' && value.includes('%')) {
              commissionText = value;
            } else {
              const percent = parseFloat(value) || 0;
              if (percent > 0) {
                commissionText = `${percent}%`;
              }
            }
          }
        }
      }
      
      // Fallback: Nếu có settings (cho tương thích với API cũ)
      if (commissionText === t.agentHomeContact && firstJobValue.settings && typeof firstJobValue.settings === 'object') {
        const settings = firstJobValue.settings;
        const settingKeys = Object.keys(settings);
        
        if (settingKeys.length > 0) {
          const firstValue = settings[settingKeys[0]];
          const type = firstJobValue.type;
          
          if (type === 1) {
            // Phí cố định
            const amount = parseInt(firstValue) || 0;
            if (amount > 0) {
              commissionText = `${amount.toLocaleString('vi-VN')} yên`;
            }
          } else if (type === 2) {
            // Phí %
            if (typeof firstValue === 'string') {
              commissionText = firstValue;
            } else {
              commissionText = `${firstValue}%`;
            }
          }
        }
      }
    }

    return {
      id: job.id,
      jobCode: job.jobCode || job.id,
      title: job.title || '',
      category: job.category?.name || '',
      company: job.company?.name || '',
      workLocation: stripHtml(job.workLocation || ''),
      estimatedSalary: stripHtml(job.estimatedSalary || ''),
      commission: commissionText,
      isHot: job.isHot,
      isPinned: job.isPinned,
    };
  };

  const getTagColorClass = (color) => {
    const colorMap = {
      green: 'bg-green-50 text-green-700 border-green-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colorMap[color] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTagInlineStyle = (tagColorClass) => {
    // Map các tagColor class từ code cũ sang inline styles
    if (tagColorClass.includes('bg-yellow-100')) {
      return { backgroundColor: '#fef3c7', color: '#a16207', borderColor: '#fde047' };
    } else if (tagColorClass.includes('bg-purple-100')) {
      return { backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' };
    } else if (tagColorClass.includes('bg-blue-100')) {
      return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' };
    } else if (tagColorClass.includes('bg-green-50')) {
      return { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' };
    } else if (tagColorClass.includes('bg-orange-50')) {
      return { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' };
    } else if (tagColorClass.includes('bg-blue-50')) {
      return { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' };
    } else {
      return { backgroundColor: '#f9fafb', color: '#374151', borderColor: '#e5e7eb' };
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
        <div className="border-b px-4 py-3" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
          <div className="h-6 rounded w-1/4 animate-pulse" style={{ backgroundColor: '#e5e7eb' }}></div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: '#f3f4f6' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="w-full rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
        <div className="border-b px-4 py-3" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
          <h3 className="text-base font-bold" style={{ color: '#111827' }}>{t.informationList || 'Danh sách thông tin'}</h3>
        </div>
        <div className="p-8 text-center">
          <p className="mb-2" style={{ color: '#dc2626' }}>{t.agentHomeErrorOccurred}</p>
          <p className="text-sm" style={{ color: '#6b7280' }}>{error}</p>
          <button
            onClick={() => dispatch(fetchInformationList(1, false))}
            onMouseEnter={() => setHoveredRetryButton(true)}
            onMouseLeave={() => setHoveredRetryButton(false)}
            className="mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredRetryButton ? '#b91c1c' : '#dc2626',
              color: 'white'
            }}
          >
            {t.agentHomeRetry}
          </button>
        </div>
      </div>
    );
  }

  // Render block Campaign hoặc News (cột dạng list) - gọn, tone đỏ
  const renderBlock = (title, items, defaultIcon) => (
    <div className="flex flex-col h-full min-h-0 rounded-lg border overflow-hidden" style={{ backgroundColor: '#fafafa', borderColor: '#e5e7eb' }}>
      <div className="flex items-center justify-between px-2 py-1.5 border-b flex-shrink-0" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
        <h3 className="text-[11px] font-bold" style={{ color: '#b91c1c' }}>{title}</h3>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: '#6b7280' }}>{items.length}{language === 'ja' ? '件' : ''}</span>
        )}
      </div>
      {items.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto max-h-[180px] sm:max-h-[200px]">
          <div className="grid grid-cols-1 gap-1.5 p-1.5">
            {items.map((item) => {
              const iconMap = { 'Star': Star, 'Target': Target, 'FileText': FileText };
              const Icon = iconMap[item.tagIcon] || defaultIcon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  onMouseEnter={() => setHoveredCardIndex(item.id)}
                  onMouseLeave={() => setHoveredCardIndex(null)}
                  className="border rounded-md p-2 transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'white',
                    borderColor: hoveredCardIndex === item.id ? '#fecaca' : '#e5e7eb',
                    boxShadow: hoveredCardIndex === item.id ? '0 1px 4px rgba(220,38,38,0.12)' : 'none'
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    <div className="p-1 rounded flex-shrink-0" style={getTagInlineStyle(item.tagColor)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-[11px] ${item.isNew ? 'font-semibold' : 'font-medium'} leading-tight line-clamp-1`} style={{ color: '#111827' }}>{item.title}</h4>
                      <span className="text-[10px] mt-0.5 block" style={{ color: '#6b7280' }}>{item.date}</span>
                      {item.description && (
                        <p className="text-[10px] leading-snug line-clamp-2 mt-0.5" style={{ color: '#6b7280' }}>{item.description}</p>
                      )}
                      {item.isNew && (
                        <span className="inline-block mt-1 px-1 py-0.5 text-white text-[9px] font-semibold rounded" style={{ backgroundColor: '#dc2626' }}>{t.new || 'Mới'}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-2">
          <p className="text-[10px]" style={{ color: '#9ca3af' }}>{t.noData || 'Không có dữ liệu'}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
      {/* Job pick up: flat cards gọn, tone đỏ */}
      {jobPickups.length > 0 && (
        <div className="px-2 pt-2 pb-1.5 border-b" style={{ borderColor: '#f3f4f6', backgroundColor: 'white' }}>
          <h3 className="text-[11px] font-bold mb-1.5 flex items-center gap-1" style={{ color: '#b91c1c' }}>
            <Star className="w-3.5 h-3.5" />
            {t.agentHomeJobPickup}
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-0.5 schedule-date-scroll">
            {jobPickups.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRowClick(item)}
                onMouseEnter={() => setHoveredCardIndex(item.id)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                className="flex-shrink-0 w-[148px] sm:w-[168px] rounded-lg border p-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: '#fef2f2',
                  borderColor: hoveredCardIndex === item.id ? '#dc2626' : '#fecaca',
                  boxShadow: hoveredCardIndex === item.id ? '0 2px 8px rgba(220, 38, 38, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className="p-1 rounded flex-shrink-0" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                    <Star className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[11px] ${item.isNew ? 'font-semibold' : 'font-medium'} leading-tight line-clamp-2`} style={{ color: '#111827' }}>{item.title}</h4>
                    <span className="text-[10px] mt-0.5 block" style={{ color: '#6b7280' }}>{item.date}</span>
                    {item.description && (
                      <p className="text-[10px] leading-snug line-clamp-2 mt-0.5" style={{ color: '#6b7280' }}>{item.description}</p>
                    )}
                    {item.isNew && (
                      <span className="inline-block mt-1 px-1 py-0.5 text-white text-[9px] font-semibold rounded" style={{ backgroundColor: '#dc2626' }}>{t.new || 'Mới'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign | News - 2 cột bên dưới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
        {renderBlock(t.campaign || 'Campaign', campaigns, Target)}
        {renderBlock(t.news || 'News', newsItems, FileText)}
      </div>

      {/* Load More - gọn, tone đỏ */}
      {hasMore && (
        <div className="px-2 py-1.5" style={{ backgroundColor: '#fff' }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            onMouseEnter={() => setHoveredLoadMoreButton(true)}
            onMouseLeave={() => setHoveredLoadMoreButton(false)}
            className="w-full px-2 py-1.5 text-[11px] font-medium border rounded-md transition-colors disabled:cursor-not-allowed"
            style={{
              color: '#dc2626',
              backgroundColor: hoveredLoadMoreButton ? '#fef2f2' : 'white',
              borderColor: '#fecaca',
              opacity: loadingMore ? 0.5 : 1
            }}
          >
            {loadingMore ? t.loading : t.agentHomeLoadMore}
          </button>
        </div>
      )}

      {/* Jobs Modal */}
          {showModal && selectedItem && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => setShowModal(false)}
            >
              <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
            {/* Modal Header */}
            <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b-2 gap-3" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(to right, #f9fafb, white)' }}>
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                {selectedItem.tagIcon && (() => {
                  const iconMap = {
                    'Star': Star,
                    'Target': Target,
                    'FileText': FileText
                  };
                  const IconComponent = iconMap[selectedItem.tagIcon] || FileText;
                  return (
                    <div className="p-2 sm:p-3 rounded-xl shadow-sm flex-shrink-0" style={getTagInlineStyle(selectedItem.tagColor)}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 break-words" style={{ color: '#111827' }}>{selectedItem.title}</h3>
                  <p className="text-xs sm:text-sm line-clamp-2" style={{ color: '#4b5563' }}>{selectedItem.description}</p>
                  {modalPagination.total > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      {t.agentHomeTotalJobs.replace('{count}', modalPagination.total)}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setModalPage(1);
                  setModalJobs([]);
                }}
                onMouseEnter={() => setHoveredCloseModalButton(true)}
                onMouseLeave={() => setHoveredCloseModalButton(false)}
                className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{
                  backgroundColor: hoveredCloseModalButton ? '#e5e7eb' : 'transparent'
                }}
              >
                <X className="w-5 h-5" style={{ color: '#4b5563' }} />
              </button>
            </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6" style={{ backgroundColor: '#f9fafb' }}>
                  {modalLoading && modalJobs.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div style={{ color: '#6b7280' }}>
                        {t.loading}
                      </div>
                    </div>
                  ) : modalJobs.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <p className="text-base sm:text-lg mb-2" style={{ color: '#6b7280' }}>
                          {t.agentHomeNoJobs}
                        </p>
                        <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
                          {t.agentHomeNoJobsRelated}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {modalJobs.map((job) => {
                          const formattedJob = formatJob(job);
                          return (
                            <div
                              key={job.id}
                              onClick={() => {
                                setShowModal(false);
                                setModalPage(1);
                                setModalJobs([]);
                                navigate(`/agent/jobs/${job.id}`);
                              }}
                              onMouseEnter={() => setHoveredJobCardIndex(job.id)}
                              onMouseLeave={() => setHoveredJobCardIndex(null)}
                              className="border-2 rounded-xl p-3 sm:p-5 shadow-sm transition-all cursor-pointer group"
                              style={{
                                backgroundColor: 'white',
                                borderColor: hoveredJobCardIndex === job.id ? '#fca5a5' : '#e5e7eb',
                                boxShadow: hoveredJobCardIndex === job.id ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                              }}
                            >
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            {/* Main Content */}
                            <div className="flex-1 space-y-3">
                              {/* Header: Job Code + Tags */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#6b7280', backgroundColor: '#f3f4f6' }}>
                                    {formattedJob.jobCode}
                                  </span>
                                  {formattedJob.isHot && (
                                    <span className="px-2.5 py-1 border rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                                      🔥 Hot
                                    </span>
                                  )}
                                  {formattedJob.isPinned && (
                                    <span className="px-2.5 py-1 border rounded-full text-xs font-semibold" style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' }}>
                                      📌 Pinned
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Job Title */}
                              <h4 className="text-lg font-bold leading-tight transition-colors" style={{ color: hoveredJobCardIndex === job.id ? '#dc2626' : '#111827' }}>
                                {formattedJob.title}
                              </h4>

                              {/* Info Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Job Category */}
                                {formattedJob.category && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                    <div className="text-sm" style={{ color: '#374151' }}>
                                      <span className="font-medium" style={{ color: '#6b7280' }}>{t.jobCategory || 'Ngành nghề'}:</span>{' '}
                                      <span style={{ color: '#111827' }}>{formattedJob.category}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Company */}
                                {formattedJob.company && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                    <div className="text-sm" style={{ color: '#374151' }}>
                                      <span className="font-medium" style={{ color: '#6b7280' }}>{t.hiringCompany || 'Công ty'}:</span>{' '}
                                      <span style={{ color: '#111827' }}>{formattedJob.company}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Work Location */}
                              {formattedJob.workLocation && (
                                <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: '#f3f4f6' }}>
                                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                  <div className="text-sm flex-1" style={{ color: '#374151' }}>
                                    <span className="font-medium" style={{ color: '#6b7280' }}>{t.workLocation || 'Địa điểm'}:</span>
                                    <div className="mt-1 whitespace-pre-line line-clamp-2" style={{ color: '#111827' }}>
                                      {formattedJob.workLocation}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Salary */}
                              {formattedJob.estimatedSalary && (
                                <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: '#f3f4f6' }}>
                                  <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                  <div className="text-sm flex-1" style={{ color: '#374151' }}>
                                    <span className="font-medium" style={{ color: '#6b7280' }}>{t.salary || 'Lương'}:</span>
                                    <div className="mt-1 whitespace-pre-line line-clamp-2" style={{ color: '#111827' }}>
                                      {formattedJob.estimatedSalary}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                                {/* Commission Section */}
                                <div className="w-full sm:w-48 flex-shrink-0">
                                  <div className="border-2 rounded-xl p-3 sm:p-4 h-full flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-0 shadow-sm" style={{ background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)', borderColor: '#fca5a5' }}>
                                    <div className="text-xs font-semibold sm:mb-2 uppercase tracking-wide" style={{ color: '#991b1b' }}>
                                      {t.companyCommission || 'Hoa hồng'}
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold" style={{ color: '#7f1d1d' }}>
                                      {formattedJob.commission}
                                    </div>
                                  </div>
                                </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Button for Modal */}
                  {modalPage < modalPagination.totalPages && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={loadMoreModalJobs}
                        disabled={modalLoading}
                        onMouseEnter={() => setHoveredModalLoadMoreButton(true)}
                        onMouseLeave={() => setHoveredModalLoadMoreButton(false)}
                        className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors disabled:cursor-not-allowed shadow-md"
                        style={{
                          backgroundColor: hoveredModalLoadMoreButton ? '#b91c1c' : '#dc2626',
                          opacity: modalLoading ? 0.5 : 1,
                          boxShadow: hoveredModalLoadMoreButton ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        {modalLoading 
                          ? (language === 'vi' ? 'Đang tải...' : language === 'en' ? 'Loading...' : '読み込み中...')
                          : (language === 'vi' ? `Xem thêm (${modalPagination.total - modalJobs.length} còn lại)` : language === 'en' ? `Load More (${modalPagination.total - modalJobs.length} remaining)` : `もっと見る (残り${modalPagination.total - modalJobs.length}件)`)
                        }
                      </button>
                    </div>
                  )}

                  {/* Pagination Info */}
                  {modalPagination.totalPages > 1 && (
                    <div className="mt-4 text-center text-sm" style={{ color: '#6b7280' }}>
                      {language === 'vi' 
                        ? `Trang ${modalPage} / ${modalPagination.totalPages} (${modalJobs.length} / ${modalPagination.total} việc làm)`
                        : language === 'en'
                        ? `Page ${modalPage} / ${modalPagination.totalPages} (${modalJobs.length} / ${modalPagination.total} jobs)`
                        : `ページ ${modalPage} / ${modalPagination.totalPages} (${modalJobs.length} / ${modalPagination.total} 件)`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
              <button
                onClick={() => setShowModal(false)}
                onMouseEnter={() => setHoveredCloseButton(true)}
                onMouseLeave={() => setHoveredCloseButton(false)}
                className="px-6 py-2 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: hoveredCloseButton ? '#d1d5db' : '#e5e7eb',
                  color: '#374151'
                }}
              >
                {language === 'vi' ? 'Đóng' : language === 'en' ? 'Close' : '閉じる'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentHomePageSession3;
