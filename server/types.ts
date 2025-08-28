export interface TradeDetails {
  exchange: string;
  coin: string;
  direction: 'Long' | 'Short';
  amountUSD: string;
  entryPrice: string;
  exitPrice?: string;
  profitLoss?: string;
  leverage: string;
  entryFees: string;
  exitFees?: string;
  size: string;
  transactionId: string;
  pctOfFullPosition: string;
  splitApproach: string;
}

export interface MintBody {
  title: string;
  description: string;
  imageUrl?: string;
  symbol?: string;
  owners?: string[];
  trade: TradeDetails;
}

export interface MetaplexMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    category: string;
    owners: string[];
  };
}

export interface MintRequest extends MintBody {
  tokenOwner?: string;
}

export interface UpdateRequest {
  mintAddress: string;
  patch: Partial<MintBody>;
}

export interface BurnRequest {
  mintAddress: string;
}

export interface MintResponse {
  txSignature: string;
  mintAddress: string;
  metadataUri: string;
  metadataHttpUri: string;
  explorerUrl: string;
}

export interface UpdateResponse {
  txSignature: string;
  newMetadataUri: string;
  metadataHttpUri: string;
  explorerUrl: string;
}

export interface BurnResponse {
  burnSignature: string;
  closeSignature: string;
  explorerUrl: string;
}

export interface HistoryOperation {
  type: 'mint' | 'update' | 'burn';
  mintAddress: string;
  signature: string;
  when: string;
  explorerUrl: string;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize?: number;
  Timestamp?: string;
}