import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../../services/api';
import AgentJobsPageSession1 from '../Agent/AgentJobsPageSession1';
import AgentJobsPageSession2 from '../Agent/AgentJobsPageSession2';
import { Plus, Settings, Building2, ChevronDown } from 'lucide-react';

/**
 * Component danh sách việc làm dùng chung cho Agent, Admin, Admin Group.
 * @param {string} jobsBasePath - Base path cho links (vd: '/agent/jobs', '/admin/jobs')
 * @param {boolean} useAdminAPI - Dùng API admin (get jobs admin) hay API CTV
 * @param {boolean} showAdminToolbar - Hiện toolbar Admin (Công ty Nguồn, campaign, Thêm job, Cài đặt)
 * @param {string} [createPath] - Đường dẫn trang thêm job (vd: '/admin/jobs/create')
 */
const JobsListPage = ({
  jobsBasePath = '/agent/jobs',
  useAdminAPI = false,
  showAdminToolbar = false,
  createPath = '/admin/jobs/create',
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyDropdownRef = useRef(null);
  const [jobs, setJobs] = useState(null);
  const [filters, setFilters] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companySearchText, setCompanySearchText] = useState('');
  const [hasCampaignOnly, setHasCampaignOnly] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    const articleId = searchParams.get('articleId');
    const eventId = searchParams.get('eventId');
    const pickupId = searchParams.get('pickupId');
    const postId = searchParams.get('postId');
    const isHot = searchParams.get('isHot') === 'true';
    const isPinned = searchParams.get('isPinned') === 'true';
    if (campaignId || articleId || eventId || pickupId || postId || isHot || isPinned) {
      setFilters({
        campaignId: campaignId ? parseInt(campaignId) : null,
        articleId: articleId ? parseInt(articleId) : null,
        eventId: eventId ? parseInt(eventId) : null,
        pickupId: pickupId ? parseInt(pickupId) : null,
        postId: postId ? parseInt(postId) : null,
        isHot: isHot || false,
        isPinned: isPinned || false,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (showAdminToolbar) loadCompanies();
  }, [showAdminToolbar]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target)) {
        setCompanyDropdownOpen(false);
      }
    };
    if (companyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [companyDropdownOpen]);

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies({ limit: 500 });
      if (response.success && response.data) {
        const list = response.data.companies || response.data.items || (Array.isArray(response.data) ? response.data : []);
        setCompanies(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSearch = (searchResults) => {
    setJobs(Array.isArray(searchResults) ? searchResults : []);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredCompanies = companySearchText.trim()
    ? companies.filter((c) =>
        (c.name || '').toLowerCase().includes(companySearchText.trim().toLowerCase())
      )
    : companies;

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-3 h-[calc(100vh-100px)] lg:h-[calc(100vh-100px)] overflow-hidden">
      <div className="w-full lg:w-1/4 flex-shrink-0 h-auto lg:h-full overflow-hidden flex flex-col gap-2">
        {showAdminToolbar && (
          <div className="rounded-lg p-3 border flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="space-y-2">
              <label className="block text-xs font-semibold" style={{ color: '#111827' }}>Công ty Nguồn</label>
              <div className="relative" ref={companyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="w-full px-3 py-2 pr-8 border rounded-lg text-xs text-left flex items-center gap-2"
                  style={{ borderColor: '#d1d5db', outline: 'none' }}
                >
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                  <span className="truncate">
                    {selectedCompany ? (companies.find((c) => c.id === selectedCompany)?.name || 'Chọn công ty') : 'Tất cả công ty'}
                  </span>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
                </button>
                {companyDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full border rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                    <div className="p-2 border-b" style={{ borderColor: '#e5e7eb' }}>
                      <input
                        type="text"
                        placeholder="Gõ để tìm nhanh công ty..."
                        value={companySearchText}
                        onChange={(e) => setCompanySearchText(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                        onClick={() => { setSelectedCompany(''); setCompanySearchText(''); setCompanyDropdownOpen(false); }}
                      >
                        Tất cả công ty
                      </button>
                      {filteredCompanies.map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => { setSelectedCompany(company.id); setCompanySearchText(''); setCompanyDropdownOpen(false); }}
                        >
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                          <span className="truncate">{company.name}</span>
                        </button>
                      ))}
                      {filteredCompanies.length === 0 && <div className="px-3 py-2 text-xs text-gray-500">Không tìm thấy</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => setHasCampaignOnly(!hasCampaignOnly)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: hasCampaignOnly ? '#2563eb' : '#f3f4f6', color: hasCampaignOnly ? 'white' : '#374151' }}
              >
                Tìm job đang có campaign
              </button>
              <button
                type="button"
                onClick={() => navigate(createPath)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{ backgroundColor: '#facc15', color: '#111827' }}
              >
                <Plus className="w-3.5 h-3.5" />+ Thêm job
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{ backgroundColor: '#1f2937', color: 'white' }}
              >
                <Settings className="w-3.5 h-3.5" />Cài đặt
              </button>
            </div>
          </div>
        )}

        <div className={showAdminToolbar ? 'flex-1 min-h-0 overflow-y-auto' : 'flex-1 min-h-0 overflow-hidden'}>
          <AgentJobsPageSession1
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            compact={true}
            useAdminAPI={useAdminAPI}
            adminCompanyId={showAdminToolbar ? selectedCompany : undefined}
            adminHasCampaign={showAdminToolbar ? hasCampaignOnly : undefined}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <AgentJobsPageSession2
          jobs={jobs}
          filters={filters}
          showAllJobs={true}
          enablePagination={true}
          useAdminAPI={useAdminAPI}
          onJobDeleted={useAdminAPI ? (id) => setJobs((prev) => (prev || []).filter((j) => j.id !== id)) : undefined}
        />
      </div>
    </div>
  );
};

export default JobsListPage;
