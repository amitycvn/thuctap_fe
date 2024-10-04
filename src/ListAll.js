import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Typography, TextField, Container, Grid } from '@mui/material';
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const ListAll = () => {
    const xKey = "YPguVA8niasnf_7l";
    const [wallID, setWallID] = useState("");
    const [network, setNetwork] = useState("devnet");
    const [connStatus, setConnStatus] = useState(false);
    const navigate = useNavigate();

    const solanaConnect = async () => {
        console.log('clicked solana connect');
        const { solana } = window;
        if (!solana) {
            alert("Please Install Solana");
            return;
        }

        try {
            const phantom = new PhantomWalletAdapter();
            await phantom.connect();
            const rpcUrl = clusterApiUrl(network);
            const connection = new Connection(rpcUrl, "confirmed");
            const wallet = {
                address: phantom.publicKey.toString(),
            };

            if (wallet.address) {
                console.log(wallet.address);
                setWallID(wallet.address);
                sessionStorage.setItem('public_key', wallet.address); // Save to session storage
                const accountInfo = await connection.getAccountInfo(new PublicKey(wallet.address), "confirmed");
                console.log(accountInfo);
                setConnStatus(true);
                navigate('/exam'); // Chuyển hướng sang /exam sau khi kết nối thành công
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            {!connStatus ? (
                                <div className="text-center">
                                    <Typography variant="h5" gutterBottom>
                                        Connect Your Wallet
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={solanaConnect}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        Connect Phantom Wallet
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
