import { useState } from "react";
import {
  Container,
  Card,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import axios from "axios";
import TransferNFT from "./TransferNFT";

const NFTDetail = ({ nft, onClose }) => {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const isListed = nft.forSale !== false;

  const handleListForSale = async () => {
    if (!price || isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    const options = {
      method: "POST",
      url: `https://api.gameshift.dev/nx/unique-assets/${nft.id}/list-for-sale`,
      headers: {
        accept: "application/json",
        "x-api-key": process.env.REACT_APP_X_API_KEY,
        "content-type": "application/json",
      },
      data: {
        price: {
          currencyId: "USDC",
          naturalAmount: price,
        },
      },
    };

    try {
      setLoading(true);
      setError(null);
      const response = await axios.request(options);

      if (response.data.consentUrl) {
        window.location.href = response.data.consentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to list NFT for sale");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelListing = async () => {
    const options = {
      method: "POST",
      url: `https://api.gameshift.dev/nx/unique-assets/${nft.id}/cancel-listing`,
      headers: {
        accept: "application/json",
        "x-api-key": process.env.REACT_APP_X_API_KEY,
      },
    };

    try {
      setLoading(true);
      setError(null);
      const response = await axios.request(options);

      if (response.data.consentUrl) {
        window.location.href = response.data.consentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel listing");
    } finally {
      setLoading(false);
    }
  };

  if (showTransfer) {
    return (
      <TransferNFT
        nftId={nft.id}
        nft={nft}
        onClose={() => setShowTransfer(false)}
      />
    );
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <Container sx={{ py: 4 }}>
        <Card sx={{ p: 3 }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={4}
          >
            {/* NFT Image */}
            <Box flex={1}>
              <Box
                component="img"
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  maxHeight: 400,
                  objectFit: "cover",
                }}
                src={nft.imageUrl}
                alt={nft.name}
              />
            </Box>

            {/* NFT Details */}
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4">{nft.name}</Typography>
                {isListed && (
                  <Chip label="Listed for Sale" color="primary" size="small" />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {nft.description}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Collection: {nft.collection.name}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                ID: {nft.id}
              </Typography>

              {nft.attributes && nft.attributes.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attributes:
                  </Typography>
                  {nft.attributes.map((attr, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                    >
                      {attr.traitType}: {attr.value}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Price Section */}
              <Box mt={3}>
                {isListed ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Listed Price
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {nft.priceCents / 100} USDC
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCancelListing}
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Hủy đăng bán"
                      )}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      List for Sale
                    </Typography>
                    <TextField
                      fullWidth
                      label="Price in USDC"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleListForSale}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "List for Sale"
                      )}
                    </Button>
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>
      <Box sx={{ p: 2 }}>
        {!isListed ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowTransfer(true)}
            fullWidth
          >
            Tặng NFT
          </Button>
        ) : (
          <Typography
            color="error"
            variant="body2"
            sx={{ textAlign: "center", fontStyle: "italic" }}
          >
            NFT đang được đăng bán không thể tặng
          </Typography>
        )}
      </Box>
    </Dialog>
  );
};

export default NFTDetail;
