import React, { useState } from 'react';
import { SendTokenService } from '../services/SendTokenService';

export const AirdropToken = ({ tokenMintAddress }) => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleAirdrop = async () => {
        if (!recipientAddress || !amount) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            setError('Số lượng token không hợp lệ');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const sendTokenService = new SendTokenService();
            const result = await sendTokenService.sendAirdrop(
                tokenMintAddress,
                recipientAddress,
                Number(amount)
            );

            setSuccess(`Đã gửi thành công ${amount} token đến địa chỉ ${recipientAddress}`);
            setRecipientAddress('');
            setAmount('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Gửi Token</h2>
                <p className="text-gray-600">Gửi token đến địa chỉ ví người nhận</p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa Chỉ Ví Người Nhận
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            placeholder="Nhập địa chỉ ví người nhận"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Lượng Token
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                            placeholder="Nhập số lượng token muốn gửi"
                            min="0"
                        />
                    </div>
                </div>

                <button
                    onClick={handleAirdrop}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 ${
                        isLoading 
                            ? 'bg-purple-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </div>
                    ) : (
                        'Gửi Token'
                    )}
                </button>

                {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 