import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Grid,
  Container,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Chip,
} from "@mui/material";
import NFTDetail from "./NFTDetail";

const ListNFT = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Thêm state cho phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 2; // Số items trên mỗi trang

  useEffect(() => {
    const fetchNFTs = async () => {
      // Lấy buyerId từ session storage
      const buyerId = sessionStorage.getItem("public_key");
      if (!buyerId) {
        setError("Please connect your wallet first");
        return;
      }
      const options = {
        method: "GET",
        url: "https://api.gameshift.dev/nx/items",
        params: {
          types: "",
          ownerReferenceId: buyerId,
          perPage: perPage,
          page: page,
        },
        headers: {
          accept: "application/json",
          "x-api-key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI5ZDE3NDg3MS01MDdjLTQyYWEtODU5ZS1kMmFiNDRjY2U5ZDEiLCJzdWIiOiI4OGQzOGNiNi1hOTI1LTRlMDQtYWExMC1mZTJmMDBhYWQ4YzIiLCJpYXQiOjE3MzE0Nzk0NjN9.1yYN2JyuD9SIiCPp1aaPa8MXtqZlJEAyiQ6Q8oA8Zic",
        },
      };

      try {
        setLoading(true);
        const response = await axios.request(options);
        const uniqueAssets = response.data.data
          .filter((item) => item.type === "UniqueAsset")
          .map((item) => item.item);
        setNfts(uniqueAssets);

        // Cập nhật tổng số trang
        setTotalPages(response.data.meta.totalPages);
      } catch (err) {
        setError("Failed to fetch NFTs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [page]); // Thêm page vào dependencies

  // Xử lý khi thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My NFTs
      </Typography>

      {/* NFTs Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {nfts.map((nft) => (
          <Grid item xs={12} sm={6} md={4} key={nft.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 2,
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
              onClick={() => setSelectedNFT(nft)}
            >
              {nft.imageUrl && (
                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                  src={nft.imageUrl}
                  alt={nft.name}
                />
              )}
              <Box sx={{ mt: 2 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" gutterBottom>
                    {nft.name}
                  </Typography>
                  {nft.priceCents !== null && (
                    <Chip
                      label={`${nft.priceCents / 100} USDC`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {nft.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Collection: {nft.collection.name}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {selectedNFT && (
        <NFTDetail nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </Container>
  );
};

export default ListNFT;
