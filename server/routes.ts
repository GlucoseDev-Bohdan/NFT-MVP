import { Router, Request, Response } from 'express';
import { MintRequest, UpdateRequest, BurnRequest, HistoryOperation } from './types.js';
import { mintNFT, updateNFT, burnNFT } from './services/solana.js';

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

    const result = await mintNFT(mintData, mintData.tokenOwner);
    
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

router.get('/history', (req: Request, res: Response) => {
  res.json(recentOps);
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    network: process.env.NETWORK || 'devnet',
    rpcUrl: new URL(process.env.RPC_URL || 'https://api.devnet.solana.com').host,
    mockMode: process.env.MOCK_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

export default router;