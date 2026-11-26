import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartLegend from './ChartLegend';
import childrenService from '../../services/childrenService';

const PsychologicalChart = ({ selectedChildren, setSelectedChildren, chartData, onPeriodChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('7days');
  const [availableChildren, setAvailableChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // Period options
  const periodOptions = [
    { value: '7days', label: 'آخر 7 أيام' },
    { value: '30days', label: 'آخر 30 يوم' },
    { value: '6months', label: 'آخر 6 أشهر' }
  ];

  useEffect(() => {
    fetchAvailableChildren();
  }, []);

  const fetchAvailableChildren = async () => {
    try {
      setLoading(true);
      const response = await childrenService.getChildren({ limit: 10 });
      if (response.data && response.data.data) {
        setAvailableChildren(response.data.data.slice(0, 4)); // Get first 4 children
        // Select first 3 children by default
        setSelectedChildren(response.data.data.slice(0, 3).map(child => child._id));
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate date range for the selected period
  const generateDateRange = (period) => {
    const dates = [];
    const endDate = new Date();
    let startDate = new Date();
    let dayInterval = 1;

    if (period === '7days') {
      startDate.setDate(endDate.getDate() - 7);
      dayInterval = 1;
    } else if (period === '30days') {
      startDate.setDate(endDate.getDate() - 30);
      dayInterval = 3; // Show every 3 days for 30 days
    } else if (period === '6months') {
      startDate.setMonth(endDate.getMonth() - 6);
      dayInterval = 15; // Show every 15 days for 6 months
    }

    // Generate date points
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push({
        date: currentDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        dateString: currentDate.toISOString().split('T')[0],
        avgHappiness: 0,
        avgSadness: 0,
        avgAnger: 0,
        avgFear: 0,
        avgAnxiety: 0
      });
      currentDate.setDate(currentDate.getDate() + dayInterval);
    }

    return dates;
  };

  // Process chart data from backend
  const processChartData = () => {
    // Generate date range for the selected period
    const dateRange = generateDateRange(currentPeriod);

    if (!chartData || !chartData.chartData || chartData.chartData.length === 0) {
      // Return empty data points for the date range
      return dateRange;
    }

    // Create a map of existing data
    const dataMap = {};
    chartData.chartData.forEach(item => {
      const dateKey = item._id;
      dataMap[dateKey] = {
        avgHappiness: Math.round(item.avgHappiness || 0),
        avgSadness: -Math.round(item.avgSadness || 0), // Negative for visualization
        avgAnger: -Math.round(item.avgAnger || 0),
        avgFear: -Math.round(item.avgFear || 0),
        avgAnxiety: -Math.round(item.avgAnxiety || 0)
      };
    });

    // Merge actual data with date range
    return dateRange.map(datePoint => {
      const data = dataMap[datePoint.dateString] || {
        avgHappiness: 0,
        avgSadness: 0,
        avgAnger: 0,
        avgFear: 0,
        avgAnxiety: 0
      };

      const dataPoint = {
        ...datePoint,
        ...data
      };

      // Calculate overall emotional score (simplified)
      const overallScore = data.avgHappiness > 0 ? (
        dataPoint.avgHappiness -
        (Math.abs(dataPoint.avgSadness) + Math.abs(dataPoint.avgAnger) +
         Math.abs(dataPoint.avgFear) + Math.abs(dataPoint.avgAnxiety)) / 4
      ) / 10 : 0; // Scale to -10 to 10

      return {
        ...dataPoint,
        overallScore: Math.max(-10, Math.min(10, overallScore))
      };
    });
  };

  const handlePeriodClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePeriodClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodSelect = (period) => {
    setCurrentPeriod(period);
    onPeriodChange(period);
    handlePeriodClose();
  };

  const processedData = processChartData();
  const currentPeriodLabel = periodOptions.find(opt => opt.value === currentPeriod)?.label || 'آخر 7 أيام';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 1.5
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.125rem', color: '#1f2937' }}>
            تحليل التغيرات النفسية الزمنية للأطفال
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
            مراقبة تحسن أو تدهور الحالة النفسية للأطفال مع مرور الوقت بناءً على رسوماتهم
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          onClick={handlePeriodClick}
          endIcon={<span style={{ fontSize: '0.75rem' }}>▼</span>}
          sx={{ 
            color: '#6b7280', 
            textTransform: 'none', 
            fontSize: '0.813rem',
            backgroundColor: '#f9fafb',
            px: 2,
            '&:hover': {
              backgroundColor: '#f3f4f6'
            }
          }}
        >
          {currentPeriodLabel}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePeriodClose}
        >
          {periodOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              onClick={() => handlePeriodSelect(option.value)}
              selected={currentPeriod === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.813rem' }}>
            حدد الأطفال (حد أقصى 3 أطفال)
          </Typography>
          <Stack direction="row" spacing={1}>
            {loading ? (
              <Chip label="جاري التحميل..." size="small" disabled />
            ) : (
              availableChildren.map((child) => (
                <Chip
                  key={child._id}
                  label={child.name}
                  onClick={() => {
                    setSelectedChildren(prev => {
                      const isSelected = prev.includes(child._id);
                      if (isSelected) {
                        return prev.filter(id => id !== child._id);
                      } else if (prev.length < 3) {
                        return [...prev, child._id];
                      }
                      return prev;
                    });
                  }}
                  size="small"
                  sx={{
                    backgroundColor: selectedChildren.includes(child._id) ? '#7c3aed' : '#f3f4f6',
                    color: selectedChildren.includes(child._id) ? '#fff' : '#374151',
                    border: 'none',
                    '&:hover': {
                      backgroundColor: selectedChildren.includes(child._id) ? '#6d28d9' : '#e5e7eb'
                    },
                    fontSize: '0.75rem',
                    height: 26,
                    fontWeight: selectedChildren.includes(child._id) ? 600 : 400
                  }}
                />
              ))
            )}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
          {`${processedData.length} نقاط بيانات`}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {processedData.length === 0 ? (
          <Box sx={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: 1
          }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد بيانات متاحة للفترة المحددة
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[-100, 100]}
                ticks={[-100, -50, 0, 50, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
                formatter={(value) => `${Math.round(Math.abs(value))}%`}
              />
              <Line 
                type="monotone" 
                dataKey="avgHappiness" 
                name="السعادة"
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ fill: '#10b981', r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgSadness" 
                name="الحزن"
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgAnger" 
                name="الغضب"
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={{ fill: '#ef4444', r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgFear" 
                name="الخوف"
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={{ fill: '#8b5cf6', r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgAnxiety" 
                name="القلق"
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={{ fill: '#f59e0b', r: 3 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      <ChartLegend
        selectedChildren={selectedChildren}
        availableChildren={availableChildren}
      />
    </Paper>
  );
};

export default PsychologicalChart;