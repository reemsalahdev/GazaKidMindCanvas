import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import DashboardLayout from '../DashboardLayout';
import WelcomeSection from './WelcomeSection';
import StatisticsSection from './StatisticsSection';
import PsychologicalChart from './PsychologicalChart';
import MentalHealthIndicators from './MentalHealthIndicators';
import dashboardService from '../../services/dashboardService';

const Dashboard = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [mentalHealthData, setMentalHealthData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for custom events to refresh dashboard
  useEffect(() => {
    const handleAnalysisComplete = () => {
      fetchDashboardData();
    };

    window.addEventListener('analysisComplete', handleAnalysisComplete);
    return () => {
      window.removeEventListener('analysisComplete', handleAnalysisComplete);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsResponse, mentalHealthResponse, chartResponse] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getMentalHealthIndicators(),
        dashboardService.getChartData('7days')
      ]);

      setStatistics(statsResponse.data);
      setMentalHealthData(mentalHealthResponse.data);
      setChartData(chartResponse.data);

      // Set initial selected children from the data
      if (statsResponse.data.childrenByGroup && statsResponse.data.childrenByGroup.length > 0) {
        // You might want to fetch actual children names here
        setSelectedChildren([]); // Will be populated when we integrate children service
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" onClose={() => fetchDashboardData()}>
            {error}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pr: '270px' }}>
        <WelcomeSection />
        <StatisticsSection statistics={statistics} />
        <PsychologicalChart 
          selectedChildren={selectedChildren} 
          setSelectedChildren={setSelectedChildren}
          chartData={chartData}
          onPeriodChange={(period) => {
            dashboardService.getChartData(period).then(response => {
              setChartData(response.data);
            });
          }}
        />
        <MentalHealthIndicators data={mentalHealthData} />
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;