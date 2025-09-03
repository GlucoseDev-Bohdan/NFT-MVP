import { Router, Request, Response } from 'express';
import { MintRequest, UpdateRequest, BurnRequest, TransferRequest, HistoryOperation } from './types.js';
import { mintNFT, updateNFT, burnNFT, transferNFT, uploadImageBase64ToIPFS } from './services/solana.js';
import { ENV } from './config.js';

const router = Router();
const recentOps: HistoryOperation[] = [];

function addToHistory(op: HistoryOperation) {
  recentOps.unshift(op);
  if (recentOps.length > 20) {
    recentOps.pop();
  }
}

router.post('/mint', async (req: Request, res: Response) => {
  try {
    const mintData: MintRequest = req.body;
    
    // Basic validation
    if (!mintData.title || !mintData.description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!mintData.trade || !mintData.trade.exchange || !mintData.trade.coin) {
      return res.status(400).json({ error: 'Trade details are required' });
    }

    const result = await mintNFT(mintData, mintData.tokenOwner || mintData.owners?.[0]);
    
    addToHistory({
      type: 'mint',
      mintAddress: result.mintAddress,
      signature: result.txSignature,
      when: new Date().toISOString(),
      explorerUrl: result.explorerUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Mint error:', error);
    res.status(500).json({ error: 'Failed to mint NFT: ' + (error as Error).message });
  }
});

router.post('/update', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateRequest = req.body;
    
    if (!updateData.mintAddress) {
      return res.status(400).json({ error: 'Mint address is required' });
    }

    const result = await updateNFT(updateData.mintAddress, updateData.patch);
    
    addToHistory({
      type: 'update',
      mintAddress: updateData.mintAddress,
      signature: result.txSignature,
      when: new Date().toISOString(),
      explorerUrl: result.explorerUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update NFT: ' + (error as Error).message });
  }
});

router.post('/burn', async (req: Request, res: Response) => {
  try {
    const burnData: BurnRequest = req.body;
    
    if (!burnData.mintAddress) {
      return res.status(400).json({ error: 'Mint address is required' });
    }

    const result = await burnNFT(burnData.mintAddress);
    
    addToHistory({
      type: 'burn',
      mintAddress: burnData.mintAddress,
      signature: result.burnSignature,
      when: new Date().toISOString(),
      explorerUrl: result.explorerUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Burn error:', error);
    res.status(500).json({ error: 'Failed to burn NFT: ' + (error as Error).message });
  }
});

router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const transferData: TransferRequest = req.body;

    if (!transferData.mintAddress || !transferData.toOwner) {
      return res.status(400).json({ error: 'Mint address and toOwner are required' });
    }

    const result = await transferNFT(transferData.mintAddress, transferData.toOwner);

    addToHistory({
      type: 'transfer',
      mintAddress: transferData.mintAddress,
      signature: result.txSignature,
      when: new Date().toISOString(),
      explorerUrl: result.explorerUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer NFT: ' + (error as Error).message });
  }
});



router.post('/upload-image', async (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body || {};
    if (!dataUrl) return res.status(400).json({ error: 'dataUrl is required' });

    const ipfsUri = await uploadImageBase64ToIPFS(dataUrl, filename || 'image.png');

    // Build optional HTTP gateway URL for convenience
    const gateway = ENV.PINATA_GATEWAY?.endsWith('/')
      ? ENV.PINATA_GATEWAY
      : (ENV.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/') + '/';
    const httpUrl = ipfsUri.replace('ipfs://', gateway);

    res.json({ ipfsUri, httpUrl });
  } catch (e:any) {
    res.status(500).json({ error: e?.message || 'Upload failed' });
  }
});

router.get('/history', (req: Request, res: Response) => {
  res.json(recentOps);
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    network: process.env.NETWORK || 'mainnet',
    rpcUrl: new URL(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com').host,
    mockMode: process.env.MOCK_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

export default router;