import { useEffect, useState } from 'react';
import { Container, Stack, TextField, Button, Typography, Card, CardContent, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../components/themeContext';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function RestaurantSearchPage() {
  const {themeMode } = useThemeContext();
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  

  const navigate = useNavigate();

  const goToRestaurantInfo = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };
  

  const handleSearch = async (page = 1) => {
    setLoading(true);
    const pageSize = 10;
    try {
      const response = await fetch(`/searchRestaurant?searchStr=${encodeURIComponent(searchInput)}&page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json(); 
      setSearchResults(data.restaurants);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatTitle = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase())
      .join(' ');
  };

  const handlePageChange = (event, value) => {
    handleSearch(value);
  };

  return (
    <Container>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          textAlign: 'center',
          my: 4,
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
          color: 'primary.main', 
          textShadow: '1px 1px 2px #000000', 
        }}
      >
        Search for Safe Restaurants
      </Typography>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600, mx: 'auto', my: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search safe restaurant..."
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={() => handleSearch()} disabled={loading}>
            Search
          </Button>
        </Stack>
  
        {loading ? <Typography>Loading...</Typography> :
          <>
            <Stack spacing={2} sx={{ maxHeight: 500, overflowY: 'auto', mt: 2 }}>
              {searchResults.length > 0 ? searchResults.map((restaurant) => (
                <Card key={restaurant.restaurant_id} sx={{ mb: 1, overflow: 'visible' }} onClick={() => goToRestaurantInfo(restaurant.restaurant_id)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 80 }}>
                  <Typography variant="h6" noWrap sx={{
                    textTransform: 'capitalize',
                    textDecoration: 'underline',
                    color: themeMode === 'dark' ? 'white' : 'blue',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}>
                    {formatTitle(restaurant.restaurant_name)}
                  </Typography>
                  </CardContent>
                </Card>
              )) : (
                <Typography sx={{ textAlign: 'center', my: 2 }}>
                  No restaurants found. Try a different query.
                </Typography>
              )}
            </Stack>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} sx={{ display: searchResults.length ? 'flex' : 'none', justifyContent: 'center', mt: 2 }} />
          </>
        }
      </Stack>
    </Container>
  );
}  