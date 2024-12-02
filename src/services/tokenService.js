import { 
    Connection, 
    Keypair, 
    clusterApiUrl,
    LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from '@solana/spl-token';
import { Buffer } from 'buffer';

// Thêm polyfill cho Buffer
window.Buffer = Buffer;

export class TokenService {
    constructor() {
        this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    }

    async createNewToken(ownerKeypair, decimals = 9) {
        try {
            // Airdrop 2 SOL cho owner
            const airdropSignature = await this.connection.requestAirdrop(
                ownerKeypair.publicKey,
                2 * LAMPORTS_PER_SOL // 2 SOL
            );
            
            // Đợi cho transaction được confirm
            await this.connection.confirmTransaction(airdropSignature);
            
            console.log('Airdrop successful');

            // Tạo token mới
            const mint = await createMint(
                this.connection,
                ownerKeypair,
                ownerKeypair.publicKey,
                ownerKeypair.publicKey,
                decimals
            );

            console.log('Token created:', mint.toBase58());

            // Tạo token account cho owner
            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                this.connection,
                ownerKeypair,
                mint,
                ownerKeypair.publicKey
            );

            console.log('Token account created:', tokenAccount.address.toBase58());

            // Mint một số token ban đầu (ví dụ: 1000 tokens)
            const initialSupply = 1000 * Math.pow(10, decimals);
            await mintTo(
                this.connection,
                ownerKeypair,
                mint,
                tokenAccount.address,
                ownerKeypair,
                initialSupply
            );

            console.log('Initial supply minted');

            return {
                tokenAddress: mint.toBase58(),
                tokenAccount: tokenAccount.address.toBase58()
            };
        } catch (error) {
            console.error('Error creating token:', error);
            if (error.logs) {
                console.error('Transaction logs:', error.logs);
            }
            throw error;
        }
    }
} 