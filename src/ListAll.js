import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Container,
  Grid,
} from "@mui/material";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import axios from "axios";

const ListAll = () => {
  const xKey = "YPguVA8niasnf_7l";
  const [wallID, setWallID] = useState("");
  const [network, setNetwork] = useState("devnet");
  const [connStatus, setConnStatus] = useState(false);
  const navigate = useNavigate();
  const [userGameShift, setUserGameShift] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const checkedUserGameShift = async (walletId) => {
    const url = `https://api.gameshift.dev/nx/users/${walletId}`;
    const options = {
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        "x-api-key": process.env.REACT_APP_X_API_KEY,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data); // In dữ liệu nếu cần
      return response.data; // Trả về dữ liệu nhận được
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return null; // Trả về giá trị null hoặc một thông báo lỗi phù hợp
    }
  };

  const registerUserGameShift = async (walletId) => {
    const options = {
      method: "POST",
      url: "https://api.gameshift.dev/nx/users",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.REACT_APP_X_API_KEY,
        "content-type": "application/json",
      },
      data: {
        referenceId: walletId,
        email: email,
        externalWalletAddress: walletId,
      },
    };

    const response = await axios
      .request(options)
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
    return response;
  };

  const solanaConnect = async () => {
    setIsLoading(true);
    console.log("clicked solana connect");
    const { solana } = window;
    if (!solana) {
      setIsLoading(false);
      alert("Please Install Solana");
      return;
    }

    if (!email) {
      setIsLoading(false);
      alert("Please enter your email");
      return;
    }

    try {
      const phantom = new PhantomWalletAdapter();
      await phantom.connect();
      const rpcUrl = clusterApiUrl(network);
      const connection = new Connection(rpcUrl, "confirmed");
      const walletAddress = phantom.publicKey.toString();

      console.log("Wallet Address:", walletAddress);

      // Kiểm tra người dùng trên GameShift
      const checkedUser = await checkedUserGameShift(walletAddress);
      let userGameShiftData;

      if (!checkedUser) {
        // Nếu không tồn tại, đăng ký người dùng mới với email đã nhập
        userGameShiftData = await registerUserGameShift(walletAddress);
      } else {
        userGameShiftData = checkedUser;
      }

      // Lưu thông tin người dùng
      setUserGameShift(userGameShiftData);
      setWallID(walletAddress);
      sessionStorage.setItem("public_key", walletAddress); // Lưu khóa công khai
      sessionStorage.setItem("user_game_shift", userGameShiftData); //Lưu thông tin người dùng

      // Kiểm tra thông tin tài khoản trên Solana
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(walletAddress),
        "confirmed"
      );
      console.log("Account Info:", accountInfo);

      // Cập nhật trạng thái kết nối
      setConnStatus(true);
      navigate("/exam"); // Chuyển hướng sang trang "/exam"
    } catch (err) {
      console.error("Error connecting to Solana:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (!newEmail) {
      setEmailError("Email is required");
    } else if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              {!connStatus ? (
                <div className="text-center">
                  <Typography variant="h5" gutterBottom>
                    Connect Your Wallet
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    error={!!emailError}
                    helperText={emailError}
                    sx={{ mb: 2 }}
                    disabled={isLoading}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={solanaConnect}
                    disabled={isLoading || !email || !!emailError}
                    style={{ marginTop: "1rem" }}
                  >
                    {isLoading ? "Connecting..." : "Connect Phantom Wallet"}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Typography variant="h6" gutterBottom>
                    Wallet Connected
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Wallet ID"
                    value={wallID}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ListAll;
