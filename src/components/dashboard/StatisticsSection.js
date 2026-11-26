import React from 'react';
import { Grid } from '@mui/material';
import {
  ChildCareOutlined,
  AssessmentOutlined,
  DrawOutlined,
  GroupOutlined
} from '@mui/icons-material';
import StatisticsCard from './StatisticsCard';

const StatisticsSection = ({ statistics }) => {
  // Use backend data or default values
  const stats = statistics ? statistics.statistics : {};
  
  // Helper function to safely calculate and round percentages
  const calculatePercentage = (value, total) => {
    if (!value || !total || total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
  };

  // Helper function to format percentage change
  const formatChange = (change) => {
    if (!change || Math.abs(change) < 0.01) return 0;
    return Math.round(change * 100) / 100; // Round to 2 decimal places
  };

  const statisticsData = [
    {
      title: 'إجمالي عدد الأطفال',
      value: stats.totalChildren?.toString() || '0',
      change: formatChange(calculatePercentage(stats.recentChildren, stats.totalChildren)),
      icon: <GroupOutlined sx={{ fontSize: 20 }} />,
      color: '#818cf8'
    },
    {
      title: 'عدد الأطفال الجدد',
      value: stats.recentChildren?.toString() || '0',
      change: formatChange(stats.childrenChangePercent || 0),
      icon: <ChildCareOutlined sx={{ fontSize: 20 }} />,
      color: '#34d399'
    },
    {
      title: 'متوسط عدد التحليلات اليومية',
      value: Math.round((stats.analyzedDrawings || 0) / 7)?.toString() || '0',
      change: formatChange(stats.analysisRate ? (stats.analysisRate - 50) : 0),
      icon: <AssessmentOutlined sx={{ fontSize: 20 }} />,
      color: '#a78bfa'
    },
    {
      title: 'عدد الرسومات التي تم رفعها',
      value: stats.totalDrawings?.toString() || '0',
      change: formatChange(stats.drawingsChangePercent || 0),
      icon: <DrawOutlined sx={{ fontSize: 20 }} />,
      color: '#60a5fa'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statisticsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatisticsCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsSection;