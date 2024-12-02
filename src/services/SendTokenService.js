import { 
    Connection, 
    Keypair, 
    clusterApiUrl,
    PublicKey 
} from '@solana/web3.js';
import { 
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getMint,
    getAssociatedTokenAddress
} from '@solana/spl-token';

export class SendTokenService {
    constructor() {
        this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    }

    async sendAirdrop(
        tokenMintAddress,
        recipientAddress,
        amount
    ) {
        try {
            // Private key của token owner (64 bytes)
            const privateKeyBytes = new Uint8Array([96,98,60,149,40,152,225,96,102,90,32,206,213,179,168,177,198,85,217,66,214,77,209,69,93,245,57,181,242,102,153,89,94,147,69,172,203,205,141,68,45,241,91,108,177,219,79,175,184,6,201,242,245,174,138,140,150,245,249,242,114,138,188,247]);

            // Tạo keypair từ private key
            const ownerKeypair = Keypair.fromSecretKey(privateKeyBytes);

            // Kiểm tra keypair
            const publicKey = ownerKeypair.publicKey.toBase58();
            console.log('Owner public key:', publicKey);

            // Chuyển đổi địa chỉ thành PublicKey
            const mint = new PublicKey(tokenMintAddress);
            const recipient = new PublicKey(recipientAddress);

            console.log('Bắt đầu quá trình airdrop...');
            console.log('Token Mint:', tokenMintAddress);
            console.log('Người nhận:', recipientAddress);

            // Lấy thông tin token
            const mintInfo = await getMint(this.connection, mint);
            console.log('Decimals của token:', mintInfo.decimals);

            // Tính toán số lượng token với decimals
            const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);
            console.log('Số lượng token đã điều chỉnh:', adjustedAmount);

            // Tạo hoặc lấy token account của người nhận
            const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                ownerKeypair,
                mint,
                recipient
            );

            console.log('Token account người nhận:', recipientTokenAccount.address.toBase58());

            // Thực hiện mint token cho người nhận
            const signature = await mintTo(
                this.connection,
                ownerKeypair,
                mint,
                recipientTokenAccount.address,
                ownerKeypair,
                adjustedAmount
            );

            console.log('Airdrop thành công! Chữ ký giao dịch:', signature);

            return {
                success: true,
                signature,
                recipientTokenAccount: recipientTokenAccount.address.toBase58(),
                amount: amount
            };

        } catch (error) {
            console.error('Lỗi trong quá trình airdrop:', error);
            if (error.logs) {
                console.error('Log giao dịch:', error.logs);
            }
            throw new Error(`Airdrop thất bại: ${error.message}`);
        }
    }

    // Phương thức kiểm tra số dư token
    async getTokenBalance(tokenAccountAddress) {
        try {
            const tokenAccountPublicKey = new PublicKey(tokenAccountAddress);
            const tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccountPublicKey);
            return tokenAccountInfo.value;
        } catch (error) {
            console.error('Lỗi khi kiểm tra số dư token:', error);
            throw error;
        }
    }

    // Phương thức kiểm tra token account
    async checkTokenAccount(tokenMintAddress, ownerAddress) {
        try {
            const mint = new PublicKey(tokenMintAddress);
            const owner = new PublicKey(ownerAddress);
            
            const tokenAccountAddress = await getAssociatedTokenAddress(
                mint,
                owner
            );
            
            const tokenAccountInfo = await this.connection.getAccountInfo(tokenAccountAddress);
            return !!tokenAccountInfo;
        } catch (error) {
            console.error('Lỗi khi kiểm tra token account:', error);
            return false;
        }
    }
}
