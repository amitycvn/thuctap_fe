import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  CardActionArea,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SellIcon from '@mui/icons-material/Sell';
import CollectionsIcon from '@mui/icons-material/Collections';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '75%', // 4:3 aspect ratio
  backgroundSize: 'cover',
});

const PriceChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 'bold',
}));

const Marketplace = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserPublicKey = sessionStorage.getItem('public_key') || '';

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const options = {
          method: 'GET',
          url: 'https://api.gameshift.dev/nx/items?forSale=true',
          headers: {
            accept: 'application/json',
            'x-api-key': process.env.REACT_APP_X_API_KEY
          }
        };
        
        const response = await axios(options);
        setNfts(response.data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const filteredNFTs = nfts.filter(nft => 
    nft.item.owner.referenceId !== currentUserPublicKey
  );

  const handleBuyNFT = async (itemId) => {
    // Lấy buyerId từ session storage
    const buyerId = sessionStorage.getItem('public_key');
    if (!buyerId) {
      setError("Please connect your wallet first");
      return;
    }

    const options = {
      method: 'POST',
      url: `https://api.gameshift.dev/nx/unique-assets/${itemId}/buy`,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.REACT_APP_X_API_KEY,
        'content-type': 'application/json',
      },
      data: { buyerId: buyerId },
    };

    try {
      setLoading(true);
      setError(null);
      const response = await axios.request(options);

      // Điều hướng đến trang consent
      if (response.data.consentUrl) {
        window.location.href = response.data.consentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process purchase');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          NFT Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and collect unique NFTs
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {filteredNFTs.map(nft => (
          <Grid item xs={12} sm={6} md={4} key={nft.item.id}>
            <StyledCard>
              <Box sx={{ position: 'relative' }}>
                <StyledCardMedia
                  image={nft.item.imageUrl}
                  title={nft.item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                  }}
                />
                <PriceChip
                  icon={<SellIcon />}
                  label={`${nft.item.price.naturalAmount} ${nft.item.price.currencyId}`}
                />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h6" component="h2">
                  {nft.item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {nft.item.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <CollectionsIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {nft.item.collection.name}
                  </Typography>
                </Box>
                {nft.item.attributes && nft.item.attributes.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {nft.item.attributes.map((attr, index) => (
                      <Chip
                        key={index}
                        label={`${attr.traitType}: ${attr.value}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleBuyNFT(nft.item.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </Button>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Marketplace; 