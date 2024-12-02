// components/SessionDisplay.js
import React from "react";
import PhantomBalance from "../views/PhantomBalance";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const SessionDisplay = () => {
  const navigate = useNavigate();
  const wallID = sessionStorage.getItem("public_key");

  const handleLogout = () => {
    // Xóa public_key khỏi sessionStorage
    sessionStorage.removeItem("public_key");
    // Chuyển hướng về trang chủ
    navigate("/");
  };

  if (!wallID) {
    return null;
  }

  return (
    <div className="session-display">
      {/* <p>Wallet ID: {wallID}</p> */}
      <PhantomBalance />
      <Button onClick={handleLogout} variant="contained" color="primary">
        Đăng xuất
      </Button>
    </div>
  );
};

export default SessionDisplay;
