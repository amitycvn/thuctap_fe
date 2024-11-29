import React, { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const PhantomBalance = () => {
  const [balance, setBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Kiểm tra xem Phantom wallet có được cài đặt không
    const checkIfWalletIsConnected = async () => {
      try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
          // Lấy số dư
          await getBalance(response.publicKey.toString());
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const getBalance = async (address) => {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const publicKey = new PublicKey(address);

      // Lấy số dư SOL
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / 1000000000);

      // Lấy tất cả token accounts của user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      // Lọc và hiển thị tất cả USDC accounts (có thể có nhiều account USDC)
      const usdcAccounts = tokenAccounts.value.filter((account) => {
        const mintAddress = account.account.data.parsed.info.mint;
        const tokenBalance =
          account.account.data.parsed.info.tokenAmount.uiAmount;
        // Chỉ lấy những account có số dư > 0
        return tokenBalance > 0;
      });

      if (usdcAccounts.length > 0) {
        // Tính tổng số dư từ tất cả USDC accounts
        const totalUsdcBalance = usdcAccounts.reduce((total, account) => {
          return total + account.account.data.parsed.info.tokenAmount.uiAmount;
        }, 0);
        setUsdcBalance(totalUsdcBalance);

        // Log thông tin chi tiết về từng USDC account
        usdcAccounts.forEach((account) => {
          console.log("Token Account:", {
            mint: account.account.data.parsed.info.mint,
            balance: account.account.data.parsed.info.tokenAmount.uiAmount,
          });
        });
      } else {
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy số dư:", error);
    }
  };

  return (
    <div className="phantom-balance">
      <h2>Số dư ví Phantom</h2>
      {walletAddress ? (
        <div>
          <p>Địa chỉ ví: {walletAddress}</p>
          <p>
            Số dư SOL: {balance !== null ? `${balance} SOL` : "Đang tải..."}
          </p>
          <p>
            Số dư USDC:{" "}
            {usdcBalance !== null ? `${usdcBalance} USDC` : "Đang tải..."}
          </p>
        </div>
      ) : (
        <p>Vui lòng kết nối ví Phantom</p>
      )}
    </div>
  );
};

export default PhantomBalance;
