import React, { useState } from "react";
import {
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const BuyNFT = () => {
  const [itemId, setItemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyNFT = async () => {
    // Kiểm tra input
    if (!itemId) {
      setError("Please enter Item ID");
      return;
    }

    // Lấy buyerId từ session storage
    const buyerId = sessionStorage.getItem("public_key");
    if (!buyerId) {
      setError("Please connect your wallet first");
      return;
    }

    const options = {
      method: "POST",
      url: `https://api.gameshift.dev/nx/unique-assets/${itemId}/buy`,
      headers: {
        accept: "application/json",
        "x-api-key":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI5ZDE3NDg3MS01MDdjLTQyYWEtODU5ZS1kMmFiNDRjY2U5ZDEiLCJzdWIiOiI4OGQzOGNiNi1hOTI1LTRlMDQtYWExMC1mZTJmMDBhYWQ4YzIiLCJpYXQiOjE3MzE0Nzk0NjN9.1yYN2JyuD9SIiCPp1aaPa8MXtqZlJEAyiQ6Q8oA8Zic",
        "content-type": "application/json",
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
      setError(err.response?.data?.message || "Failed to process purchase");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Buy NFT
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Item ID"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleBuyNFT}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Buy NFT"}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default BuyNFT;
