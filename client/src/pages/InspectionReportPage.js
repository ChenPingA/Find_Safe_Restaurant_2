import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Container, Box, Paper, Typography, Button, Menu, MenuItem, Divider, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

export default function InspectionReportPage() {
  const {restaurant_id} = useParams();  // Using a hardcoded restaurant ID for demonstration
  const theme = useTheme();
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Loading...',
    address: 'Loading...',
    inspectionScore: 'Loading...'
  });
  const [inspections, setInspections] = useState([]);
  const [chartData, setChartData] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setAnchorEl(null);
    fetchInspectionDetails(year);
  };

  useEffect(() => {
    fetchRestaurantInfo();
    fetchInspectionScore();
    fetchInspectionDetails(2022); // For debugging purposes, remove or replace with dynamic year later
  }, []);
  

  const fetchInspectionScore = () => {
    fetch(`/getInspectionScore?resID=${restaurant_id}`)
      .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch inspection score');
        }
        return response.json();
      })
      .then(data => {
        // Check if data contains the inspectionScore and is not null
        if (data && data.inspectionScore !== undefined && data.inspectionScore !== null) {
          const roundedScore = parseFloat(data.inspectionScore).toFixed(2); // Round to two decimal places
          setRestaurantInfo(prevState => ({
            ...prevState,
            inspectionScore: roundedScore
          }));
        } else {
          setRestaurantInfo(prevState => ({
            ...prevState,
            inspectionScore: 'No score available'
          }));
        }
      })
      .catch(error => {
        console.error('Error fetching inspection score:', error);
        setRestaurantInfo(prevState => ({
          ...prevState,
          inspectionScore: 'Failed to load score'
        }));
      });
};


const fetchRestaurantInfo = () => {
    fetch(`/getRestaurantInfo?resID=${restaurant_id}`)
      .then(response => response.json())
      .then(data => {
        setRestaurantInfo({
          name: data.restaurant_name,
          address: data.restaurant_address,
          inspectionScore: 'Loading...' // Placeholder until the score is fetched
        });
        // Fetch inspection score after fetching restaurant info
        fetchInspectionScore();
      })
      .catch(error => console.error('Failed to fetch restaurant info:', error));
};

useEffect(() => {
    fetchRestaurantInfo();
    // Remove fetchInspectionDetails if it's only related to other details not the score
}, []);


  const fetchInspectionDetails = (year) => {
    fetch(`/getRestaurantInspection?resID=${restaurant_id}&year=${year}`)
      .then(response => response.json())
      .then(data => {
        setInspections(data);
        updateChartData(data);
      })
      .catch(error => {
        console.error('Error fetching inspection details:', error);
        setInspections([]);
      });
  };

  const updateChartData = (data) => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.inspection_result] = (acc[curr.inspection_result] || 0) + 1;
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['green', 'yellow', 'red'], // Colors for Pass, Conditional, Fail
      }]
    });
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
    <Box width="20%" minWidth="150px">
      <Button
        aria-controls="year-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ my: 2, width: '100%', bgcolor: theme.palette.background.paper, '&:hover': { bgcolor: theme.palette.action.hover } }}
      >
        Select Year
      </Button>
      <Typography
        variant="subtitle1"
        sx={{
          my: 2,
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
          paddingLeft: '16px' // Aligns text with the button text assuming default padding in theme
        }}
      >
        {selectedYear ? `Year: ${selectedYear}` : 'No year selected'}
      </Typography>
      <Menu
        id="year-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Array.from({ length: 10 }, (_, i) => 2012 + i).map(year => (
          <MenuItem key={year} onClick={() => handleYearSelect(year)}>
            {year}
          </MenuItem>
        ))}
      </Menu>
    </Box>

      <Box width="80%" sx={{ ml: 2 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {restaurantInfo.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {restaurantInfo.address}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Inspection Score: {restaurantInfo.inspectionScore}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {inspections.length > 0 ? (
            <List>
              {inspections.map((inspection, index) => (
                <ListItem key={index}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="body1">
                        {`${index + 1}. Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`}
                      </Typography>
                      <Typography variant="body1">
                        {`Risk Level: ${inspection.risk_level}`}
                      </Typography>
                      <Typography variant="body1">
                        {`Result: ${inspection.inspection_result}`}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Divider variant="inset" component="li" />
                </ListItem>
              ))}
            {/* Pie chart for visualizing inspection results */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Inspection Result Distribution:</Typography>
                <Pie data={chartData} />
              </Box>
            </List>
          ) : (
            <Typography sx={{ mt: 2 }}>No inspection data available for the selected year.</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}