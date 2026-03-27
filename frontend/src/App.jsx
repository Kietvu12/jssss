import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './component/ProtectedRoute';
import AgentLayout from './component/Layout/AgentLayout';
import AdminLayout from './component/Layout/AdminLayout';
import JobsListPage from './component/Shared/JobsListPage';
import JobDetailPage from './component/Shared/JobDetailPage';
import apiService from './services/api';
import HomePage from './page/Agent/HomePage';
import CandidatesPage from './page/Agent/CandidatesPage';
import NominationsPage from './page/Agent/NominationsPage';
import PaymentHistoryPage from './page/Agent/PaymentHistoryPage';
import AgentPaymentRequestDetailPage from './page/Agent/PaymentRequestDetailPage';
import ContactPage from './page/Agent/ContactPage';
import FAQPage from './page/Agent/FAQPage';
import TermsPage from './page/Agent/TermsPage';
import HotlinePage from './page/Agent/HotlinePage';
import AgentProfilePage from './page/Agent/AgentProfilePage';
import NotificationsPage from './page/Agent/NotificationsPage';
import AddCandidateForm from './component/Shared/AddCandidateForm';
import NominationPage from './page/Agent/NominationPage';
import CandidateDetail from './page/Agent/CandidateDetail';
import CandidateApplicationsPage from './page/Agent/CandidateApplicationsPage';
import NominationDetail from './page/Agent/NominationDetail';
import Dashboard from './page/Admin/Dashboard';
import CollaboratorsPage from './page/Admin/CollaboratorsPage';
import CollaboratorApprovalPage from './page/Admin/CollaboratorApprovalPage';
import AddCollaboratorPage from './page/Admin/AddCollaboratorPage';
import CollaboratorRankingPage from './page/Admin/CollaboratorRankingPage';
import AdminCollaboratorDetailPage from './page/Admin/AdminCollaboratorDetailPage';
import AdminCandidatesPage from './page/Admin/CandidatesPage';
import AdminCandidateDetailPage from './page/Admin/AdminCandidateDetailPage';
import AdminAddJobPage from './page/Admin/AddJobPage';
import AdminNominationsPage from './page/Admin/NominationsPage';
import AdminAddNominationPage from './page/Admin/AddNominationPage';
import AdminNominationPage from './page/Admin/AdminNominationPage';
import AdminNominationDetailPage from './page/Admin/AdminNominationDetailPage';
import PaymentsPage from './page/Admin/PaymentsPage';
import PaymentRequestDetailPage from './page/Admin/PaymentRequestDetailPage';
import CompaniesPage from './page/Admin/CompaniesPage';
import AddCompanyPage from './page/Admin/AddCompanyPage';
import AdminCompanyDetailPage from './page/Admin/AdminCompanyDetailPage';
import ReportsPage from './page/Admin/ReportsPage';
import AccountsPage from './page/Admin/AccountsPage';
import CampaignsPage from './page/Admin/CampaignsPage';
import AddCampaignPage from './page/Admin/AddCampaignPage';
import AdminCampaignDetailPage from './page/Admin/AdminCampaignDetailPage';
import SettingsPage from './page/Admin/SettingsPage';
import JobCategoriesPage from './page/Admin/JobCategoriesPage';
import AddJobCategoryPage from './page/Admin/AddJobCategoryPage';
import CollaboratorAssignmentsPage from './page/Admin/CollaboratorAssignmentsPage';
import MyAssignedCollaboratorsPage from './page/Admin/MyAssignedCollaboratorsPage';
import MyGroupPage from './page/Admin/MyGroupPage';
import GroupsPage from './page/Admin/GroupsPage';
import GroupDetailPage from './page/Admin/GroupDetailPage';
import AddGroupPage from './page/Admin/AddGroupPage';
import AddAdminPage from './page/Admin/AddAdminPage';
import GroupCandidatesPage from './page/Admin/GroupCandidatesPage';
import GroupCollaboratorsPage from './page/Admin/GroupCollaboratorsPage';
import EmailPage from './page/Admin/EmailPage';
import PostsPage from './page/Admin/PostsPage';
import EventsPage from './page/Admin/EventsPage';
import AddEventPage from './page/Admin/AddEventPage';
import EventDetailPage from './page/Admin/EventDetailPage';
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
import VerifyEmailPage from './page/VerifyEmailPage';
import LandingPage from './page/LandingPage';
import BlogPage from './page/BlogPage';
import AgentEventDetailPage from './page/Agent/EventDetailPage';

// Admin Job Detail: phân quyền Chỉnh sửa (chỉ SuperAdmin role=1, AdminBackOffice role=2)
const AdminJobDetailWrapper = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [backPath, setBackPath] = useState('/admin/jobs');
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getAdminProfile();
        if (res.success && res.data?.admin) setAdminProfile(res.data.admin);
      } catch (e) { console.error(e); }
    };
    load();
    const referrer = sessionStorage.getItem('jobDetailReferrer');
    if (referrer) setBackPath(referrer);
  }, []);
  const showEditButton = adminProfile?.role === 1 || adminProfile?.role === 2;
  return (
    <JobDetailPage
      getJobApi={apiService.getAdminJobById}
      backPath={backPath}
      showEditButton={showEditButton}
      editPath="/admin/jobs/:id/edit"
    />
  );
};

// Admin Group Jobs: header nhóm + danh sách job dùng chung
const GroupJobsListWrapper = () => {
  const [groupInfo, setGroupInfo] = useState(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getMyGroup();
        if (res.success && res.data?.group) setGroupInfo(res.data.group);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {groupInfo && (
        <div className="flex-shrink-0 mb-4 rounded-lg p-4 mx-4 mt-4" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', border: '1px solid' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1e3a8a' }}>Nhóm: {groupInfo.name}</h2>
          <p className="text-sm" style={{ color: '#1d4ed8' }}>Mã nhóm: {groupInfo.code} | Số admin: {groupInfo.admins?.length || 0}</p>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <JobsListPage jobsBasePath="/admin/jobs" useAdminAPI={true} showAdminToolbar={false} />
      </div>
    </div>
  );
};

// Route "/": hiển thị Landing page; nếu đã đăng nhập thì redirect về agent/admin
const RootRoute = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (token && userType) {
    if (userType === 'ctv') return <Navigate to="/agent" replace />;
    if (userType === 'admin') return <Navigate to="/admin" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
      <BrowserRouter basename="/">
        <Routes>
          {/* Login Routes */}
          <Route path="/login" element={<LoginPage defaultUserType="ctv" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/verify-email" element={<VerifyEmailPage />} />
          <Route path="/admin/login" element={<LoginPage defaultUserType="admin" />} />

          {/* Agent Routes - Yêu cầu đăng nhập với userType = 'ctv' */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute requiredUserType="ctv">
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<JobsListPage jobsBasePath="/agent/jobs" useAdminAPI={false} showAdminToolbar={false} />} />
            <Route path="jobs/:jobId" element={<JobDetailPage getJobApi={apiService.getJobById} backPath="/agent/jobs" showEditButton={false} />} />
            <Route path="jobs/:jobId/nominate" element={<NominationPage />} />
            <Route path="events/:eventId" element={<AgentEventDetailPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="candidates/create" element={<AddCandidateForm />} />
            <Route path="candidates/:candidateId" element={<CandidateDetail />} />
            <Route path="candidates/:candidateId/edit" element={<AddCandidateForm />} />
            <Route path="candidates/:candidateId/applications" element={<CandidateApplicationsPage />} />
            <Route path="nominations" element={<NominationsPage />} />
            <Route path="nominations/:nominationId" element={<NominationDetail />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="payment-history/:id" element={<AgentPaymentRequestDetailPage />} />
            <Route path="profile" element={<AgentProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="hotline" element={<HotlinePage />} />
          </Route>

          {/* Admin Routes - Yêu cầu đăng nhập với userType = 'admin' */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="collaborators" element={<CollaboratorsPage />} />
            <Route path="collaborators/approval" element={<CollaboratorApprovalPage />} />
            <Route path="collaborators/new" element={<AddCollaboratorPage />} />
            <Route path="collaborators/:collaboratorId" element={<AdminCollaboratorDetailPage />} />
            <Route path="collaborators/:collaboratorId/edit" element={<AddCollaboratorPage />} />
            <Route path="collaborators/ranking" element={<CollaboratorRankingPage />} />
            <Route path="candidates" element={<AdminCandidatesPage />} />
            <Route path="candidates/create" element={<AddCandidateForm isAdmin />} />
            <Route path="candidates/:candidateId" element={<AdminCandidateDetailPage />} />
            <Route path="candidates/:candidateId/applications" element={<CandidateApplicationsPage useAdminAPI />} />
            <Route path="candidates/:candidateId/edit" element={<AddCandidateForm isAdmin />} />
            <Route path="jobs" element={<JobsListPage jobsBasePath="/admin/jobs" useAdminAPI={true} showAdminToolbar={true} createPath="/admin/jobs/create" />} />
            <Route path="jobs/create" element={<AdminAddJobPage />} />
            <Route path="jobs/:jobId" element={<AdminJobDetailWrapper />} />
            <Route path="jobs/:jobId/edit" element={<AdminAddJobPage />} />
            <Route path="jobs/:jobId/nominate" element={<AdminNominationPage />} />
            <Route path="nominations" element={<AdminNominationsPage />} />
            <Route path="nominations/create" element={<AdminAddNominationPage />} />
            <Route path="nominations/:nominationId" element={<AdminNominationDetailPage />} />
            <Route path="nominations/:nominationId/edit" element={<AdminAddNominationPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments/:id" element={<PaymentRequestDetailPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/create" element={<AddCompanyPage />} />
            <Route path="companies/:companyId" element={<AdminCompanyDetailPage />} />
            <Route path="companies/:companyId/edit" element={<AddCompanyPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="accounts/new" element={<AddAdminPage />} />
            <Route path="accounts/:id/edit" element={<AddAdminPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/create" element={<AddCampaignPage />} />
            <Route path="campaigns/:campaignId" element={<AdminCampaignDetailPage />} />
            <Route path="campaigns/:campaignId/edit" element={<AddCampaignPage />} />
            <Route path="job-categories" element={<JobCategoriesPage />} />
            <Route path="job-categories/add" element={<AddJobCategoryPage />} />
            <Route path="job-categories/:categoryId/edit" element={<AddJobCategoryPage />} />
            <Route path="collaborator-assignments" element={<CollaboratorAssignmentsPage />} />
            <Route path="my-assigned-collaborators" element={<MyAssignedCollaboratorsPage />} />
            <Route path="my-group" element={<MyGroupPage />} />
            <Route path="group-collaborators" element={<GroupCollaboratorsPage />} />
            <Route path="group-jobs" element={<GroupJobsListWrapper />} />
            <Route path="group-candidates" element={<GroupCandidatesPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/new" element={<AddGroupPage />} />
            <Route path="groups/:id" element={<GroupDetailPage />} />
            <Route path="groups/:id/edit" element={<AddGroupPage />} />
            <Route path="emails" element={<EmailPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<AddEventPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="events/:eventId/edit" element={<AddEventPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="posts/create" element={<PostsPage />} />
            <Route path="posts/:id/edit" element={<PostsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Public Blog (no auth) */}
          <Route path="/blog" element={<BlogPage />} />

          {/* Root route - Landing page (nếu đã đăng nhập thì redirect agent/admin) */}
          <Route path="/" element={<RootRoute />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
