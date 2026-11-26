import React from 'react';
import { Box, Paper } from '@mui/material';
import FiltersSection from './FiltersSection';
import TableView from './TableView';
import GridView from './GridView';
import Pagination from './Pagination';

const ChildrenTable = ({
  childrenData,
  viewMode,
  searchQuery,
  genderFilter,
  statusFilter,
  sortFilter,
  onSearchChange,
  onGenderChange,
  onStatusChange,
  onSortChange,
  onViewModeChange,
  onDeleteChild,
  onEditChild,
  loading,
  pagination,
  onPageChange
}) => {
  return (
    <Box sx={{ padding: 2, mt: 3 }}>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 1.5,
          overflow: 'hidden'
        }}
      >
        <FiltersSection
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortFilter={sortFilter}
          onSortChange={onSortChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          genderFilter={genderFilter}
          onGenderChange={onGenderChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        {/* Content Area - Toggle between Table and Grid */}
        {viewMode === 'list' ? (
          <TableView
            childrenData={childrenData}
            onDeleteChild={onDeleteChild}
            onEditChild={onEditChild}
            loading={loading}
          />
        ) : (
          <GridView
            childrenData={childrenData}
            onDeleteChild={onDeleteChild}
            onEditChild={onEditChild}
            loading={loading}
          />
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.pageSize}
            onPreviousPage={() => onPageChange(null, pagination.current - 1)}
            onNextPage={() => onPageChange(null, pagination.current + 1)}
            onPageChange={onPageChange}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ChildrenTable;