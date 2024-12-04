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

const TransferNFT = ({ nftId, nft, onClose }) => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTransfer = async () => {
    if (nft.priceCents !== null) {
      setError("Cannot transfer NFT that is currently listed for sale");
      return;
    }

    if (!receiverAddress) {
      setError("Please enter receiver address");
      return;
    }

    const senderAddress = sessionStorage.getItem("public_key");
    if (!senderAddress) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        method: "POST",
        url: `https://api.gameshift.dev/nx/users/${senderAddress}/items/${nftId}/transfer`,
        headers: {
          accept: "application/json",
          "x-api-key": process.env.REACT_APP_X_API_KEY,
          "content-type": "application/json",
        },
        data: {
          destinationUserReferenceId: receiverAddress,
          quantity: "1",
        },
      });

      if (response.data.consentUrl) {
        window.location.href = response.data.consentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transfer NFT");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Transfer NFT
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Receiver Address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            placeholder="Enter receiver's wallet address"
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleTransfer}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Transfer NFT"}
            </Button>

            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Box>

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

export default TransferNFT;
