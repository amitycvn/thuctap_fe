import React, { useState } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const CreateNFT = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [connStatus, setConnStatus] = useState(false);
    const [uri, setUri] = useState('');
    const network = WalletAdapterNetwork.Devnet;

    const connectWallet = async () => {
        const { solana } = window;
        if (solana && solana.isPhantom) {
            try {
                const wallet = new PhantomWalletAdapter();
                await wallet.connect();
                setWalletAddress(wallet.publicKey.toString());
                setConnStatus(true);
            } catch (err) {
                console.error("Wallet connection error: ", err);
            }
        } else {
            alert("Please install Phantom Wallet");
        }
    };

    const createNFT = async () => {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const wallet = new PhantomWalletAdapter();
        await wallet.connect();

        try {
            const myHeaders = new Headers();
            myHeaders.append("x-api-key", "YPguVA8niasnf_7l");
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                "network": "devnet",
                "metadata_uri": "https://brown-loyal-stoat-734.mypinata.cloud/ipfs/QmR5Tyx3MvpiCKtjTVC4wVzRigpujCv9bnvQKU4ZMQzN5N",
                "max_supply": 0,
                "collection_address": "3F3G122hfRQ6E7aRQLhdXvabxtfhGHF89UVLvHR4pmn9",
                "receiver": wallet.publicKey.toString(),
                "fee_payer": wallet.publicKey.toString(),
                "service_charge": {
                    "receiver": "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R",
                    "amount": 0.01
                },
                "priority_fee": 100
            });

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            const response = await fetch("https://api.shyft.to/sol/v1/nft/create_from_metadata", requestOptions);
            const result = await response.text();
            console.log(result);
            setUri(result);

        } catch (error) {
            console.error('Error creating NFT: ', error);
        }
    };

    return (
        <div>
            <h1>Create NFT using Phantom Wallet</h1>
            {!connStatus && (
                <button onClick={connectWallet}>Connect Phantom Wallet</button>
            )}
            {connStatus && (
                <div>
                    <p>Connected Wallet: {walletAddress}</p>
                    <button onClick={createNFT}>Create NFT</button>
                    {uri && (
                        <div>
                            <p>Metadata URI: {uri}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateNFT;
