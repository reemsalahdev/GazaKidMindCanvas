import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Header from './children-management/Header';
import GroupsSection from './children-management/GroupsSection';
import ChildrenTable from './children-management/ChildrenTable';
import AddChildDrawer from './children-management/AddChildDrawer';
import AddGroupDialog from './children-management/AddGroupDialog';
import SelectChildDialog from './children-management/SelectChildDialog';
import DeleteGroupDialog from './children-management/DeleteGroupDialog';
import childrenService from '../services/childrenService';

const ChildrenManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [viewMode, setViewMode] = useState('list');
  const [genderFilter, setGenderFilter] = useState('الجنس');
  const [statusFilter, setStatusFilter] = useState('الحالة');
  const [sortFilter, setSortFilter] = useState('درجة الخطر');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openAddGroup, setOpenAddGroup] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [openDeleteGroup, setOpenDeleteGroup] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [openSelectChildDialog, setOpenSelectChildDialog] = useState(false);
  const [openRecommendationsDialog, setOpenRecommendationsDialog] = useState(false);
  const [childToEdit, setChildToEdit] = useState(null);
  
  // Data management
  const [children, setChildren] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pages: 1
  });

  // Check navigation state and open appropriate modal
  useEffect(() => {
    if (location.state?.openAddChild) {
      setOpenAddChild(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.openUploadDrawing) {
      setOpenSelectChildDialog(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.openRecommendations) {
      setOpenRecommendationsDialog(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchChildrenData();
    fetchGroups();
  }, [searchQuery, genderFilter, statusFilter, sortFilter, pagination.current]);

  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchQuery,
        sortBy: sortFilter,
        sortOrder: 'asc'
      };

      // إضافة فلتر الجنس إذا لم يكن القيمة الافتراضية
      if (genderFilter !== 'الجنس') {
        params.gender = genderFilter;
      }

      // إضافة فلتر الحالة إذا لم يكن القيمة الافتراضية
      if (statusFilter !== 'الحالة') {
        params.status = statusFilter;
      }

      const response = await childrenService.getChildren(params);
      
      if (response.success) {
        // Map children data to ensure each child has an 'id' field
        const mappedChildren = response.data.map(child => ({
          ...child,
          id: child._id || child.id,
          status: child.emotionalStatus?.overall || 'مستقر',
          statusColor:
            child.emotionalStatus?.overall === 'سعيد' ? '#10b981' :
            child.emotionalStatus?.overall === 'قلق' ? '#f59e0b' :
            child.emotionalStatus?.overall === 'حزين' ? '#3b82f6' :
            '#6b7280'
        }));
        setChildren(mappedChildren);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('فشل في تحميل بيانات الأطفال');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await childrenService.getGroups();
      if (response.success) {
        setGroups(response.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  // Handle child addition/update
  const handleChildSubmit = async (childData, uploadedImage, childId) => {
    try {
      let response;
      
      if (childId) {
        // Update existing child
        response = await childrenService.updateChild(childId, childData);
      } else {
        // Create new child
        response = await childrenService.createChild(childData);
      }
      
      if (response.success) {
        const targetChildId = childId || response.data._id || response.data.id;
        
        // Upload profile image if provided (and it's a File object, not URL)
        if (uploadedImage && targetChildId && uploadedImage instanceof File) {
          try {
            await childrenService.uploadProfileImage(targetChildId, uploadedImage);
          } catch (imageErr) {
            console.error('Error uploading profile image:', imageErr);
            // Don't fail the entire operation if image upload fails
          }
        }
        
        await fetchChildrenData();
        await fetchGroups();
        setOpenAddChild(false);
        setChildToEdit(null);
      }
    } catch (err) {
      console.error('Error saving child:', err);
      setError(err.response?.data?.message || `حدث خطأ أثناء ${childId ? 'تحديث' : 'إضافة'} الطفل`);
      throw err; // Re-throw to be caught by AddChildDrawer
    }
  };

  // Handle child edit
  const handleEditChild = (child) => {
    setChildToEdit(child);
    setOpenAddChild(true);
  };

  // Handle group addition/edition
  const handleGroupSubmit = async (groupData) => {
    try {
      if (groupData.id) {
        // Edit existing group
        await childrenService.updateGroup(groupData.id, groupData);
      } else {
        // Create new group
        await childrenService.createGroup(groupData);
      }
      
      await fetchChildrenData();
      await fetchGroups();
      setOpenAddGroup(false);
      setGroupToEdit(null);
    } catch (err) {
      console.error('Error saving group:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المجموعة');
    }
  };

  // Handle group edit
  const handleEditGroup = (group) => {
    setGroupToEdit(group);
    setOpenAddGroup(true);
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupId) => {
    const group = groups.find(g =>
      (g.id || g._id) === groupId
    );
    if (group) {
      setGroupToDelete(group);
      setOpenDeleteGroup(true);
    }
  };

  // Confirm group deletion
  const confirmDeleteGroup = async () => {
    try {
      if (!groupToDelete) return;

      await childrenService.deleteGroup(groupToDelete._id || groupToDelete.id);
      
      await fetchChildrenData();
      await fetchGroups();
      setOpenDeleteGroup(false);
      setGroupToDelete(null);
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء حذف المجموعة');
    }
  };

  // Handle child deletion
  const handleDeleteChild = async (childId) => {
    try {
      const response = await childrenService.deleteChild(childId);
      if (response.success) {
        await fetchChildrenData();
      }
    } catch (err) {
      console.error('Error deleting child:', err);
    }
  };

  // Handle pagination
  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  if (loading && children.length === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pr: '270px' }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Header onAddChild={() => setOpenAddChild(true)} />
        
        <GroupsSection
          groups={groups}
          onAddGroup={() => {
            setGroupToEdit(null);
            setOpenAddGroup(true);
          }}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
        />
        
        <ChildrenTable
          childrenData={children}
          viewMode={viewMode}
          searchQuery={searchQuery}
          genderFilter={genderFilter}
          statusFilter={statusFilter}
          sortFilter={sortFilter}
          onSearchChange={setSearchQuery}
          onGenderChange={(value) => {
            setGenderFilter(value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          onSortChange={(value) => {
            setSortFilter(value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          onViewModeChange={setViewMode}
          onDeleteChild={handleDeleteChild}
          onEditChild={handleEditChild}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Box>

      <AddChildDrawer
        open={openAddChild}
        onClose={() => {
          setOpenAddChild(false);
          setChildToEdit(null);
        }}
        onSubmit={handleChildSubmit}
        groups={groups.map(g => g.name)}
        childToEdit={childToEdit}
      />

      <AddGroupDialog
        open={openAddGroup}
        onClose={() => {
          setOpenAddGroup(false);
          setGroupToEdit(null);
        }}
        onSubmit={handleGroupSubmit}
        groupToEdit={groupToEdit}
        childrenData={children}
      />

      {/* Select Child Dialog for Upload Drawing */}
      <SelectChildDialog
        open={openSelectChildDialog}
        onClose={() => setOpenSelectChildDialog(false)}
        childrenData={children}
        title="اختر طفل لرفع رسمة جديدة"
        description="يرجى اختيار الطفل الذي تريد رفع رسمة جديدة له"
        navigateTo={(childId) => ({
          pathname: `/child/${childId}`,
          state: { openAddDrawing: true }
        })}
      />

      {/* Select Child Dialog for Recommendations */}
      <SelectChildDialog
        open={openRecommendationsDialog}
        onClose={() => setOpenRecommendationsDialog(false)}
        childrenData={children}
        title="اختر طفل لعرض التوصيات الذكية"
        description="يرجى اختيار الطفل الذي تريد عرض التوصيات الذكية الخاصة به"
        navigateTo={(childId) => ({
          pathname: `/child/${childId}`,
          state: { activeTab: 2 }
        })}
      />

      {/* Delete Group Confirmation Dialog */}
      <DeleteGroupDialog
        open={openDeleteGroup}
        onClose={() => {
          setOpenDeleteGroup(false);
          setGroupToDelete(null);
        }}
        onConfirm={confirmDeleteGroup}
        groupName={groupToDelete?.name || ''}
        childrenCount={groupToDelete?.count || 0}
      />
    </DashboardLayout>
  );
};

export default ChildrenManagement;