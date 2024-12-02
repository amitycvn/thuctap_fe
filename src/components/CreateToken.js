import React, { useState } from 'react';
import { Keypair } from '@solana/web3.js';
import { TokenService } from '../services/tokenService.js';
import { AirdropToken } from './AirdropToken.js';


export const CreateToken = () => {
    const [tokenInfo, setTokenInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateToken = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const ownerKeypair = Keypair.generate();
            const tokenService = new TokenService();
            const result = await tokenService.createNewToken(ownerKeypair);
            
            setTokenInfo(result);
        } catch (err) {
            if (err.message.includes('Insufficient SOL balance')) {
                setError(
                    <div>
                        <p>Insufficient SOL balance. Please follow these steps:</p>
                        <ol className="list-decimal ml-5 mt-2">
                            <li>Visit <a href="https://solfaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Solana Faucet</a></li>
                            <li>Enter your wallet address</li>
                            <li>Request SOL</li>
                            <li>Wait for the transaction to complete</li>
                            <li>Try creating the token again</li>
                        </ol>
                    </div>
                );
            } else {
                setError('Failed to create token: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Create New Token</h2>
                
                <button
                    onClick={handleCreateToken}
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Token'}
                </button>

                {error && (
                    <div className="mt-4 text-red-500">
                        {error}
                    </div>
                )}

                {tokenInfo && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Token Created Successfully!</h3>
                        <div className="mt-2">
                            <p className="text-sm">
                                <span className="font-medium">Token Address:</span>
                                <br />
                                {tokenInfo.tokenAddress}
                            </p>
                            <p className="text-sm mt-2">
                                <span className="font-medium">Token Account:</span>
                                <br />
                                {tokenInfo.tokenAccount}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <AirdropToken tokenMintAddress="EawY8hMipRETvdcX3RPqNPT2ziD3m6kSh5xg5Ypxsppc" />
           
        </div>
    );
}; 