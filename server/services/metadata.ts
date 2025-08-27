// import type { UploadMetadataInput } from '@metaplex-foundation/js';
// import { MintBody } from '../types.js';

// export function transformToMetaplexMetadata(data: MintBody): UploadMetadataInput {
//   const { title, description, imageUrl, symbol, owners, trade } = data;

//   const json: UploadMetadataInput = {
//     name: title,
//     symbol: symbol || process.env.NFT_SYMBOL || 'OWN',
//     description,
//     image: imageUrl || '',
//     attributes: [
//       { trait_type: 'Exchange', value: trade.exchange },
//       { trait_type: 'Coin', value: trade.coin },
//       { trait_type: 'Direction', value: trade.direction },
//       { trait_type: 'Amount', value: trade.amountUSD },
//       { trait_type: 'Entry Price', value: trade.entryPrice },
//       { trait_type: 'Exit Price', value: trade.exitPrice ?? '' },
//       { trait_type: 'Profit/Loss', value: trade.profitLoss ?? '' },
//       { trait_type: 'Leverage', value: trade.leverage },
//       { trait_type: 'Entry Fees', value: trade.entryFees },
//       { trait_type: 'Exit Fees', value: trade.exitFees ?? '' },
//       { trait_type: 'Size', value: trade.size },
//       { trait_type: 'Transaction ID', value: trade.transactionId },
//       { trait_type: '% of Full Position', value: trade.pctOfFullPosition },
//       { trait_type: 'Split Approach', value: trade.splitApproach }
//     ],
//     properties: {
//       category: 'utility',
//       owners: owners || []
//     }
//   };

//   return json;
// }

// export function mergeMetadata(
//   current: UploadMetadataInput,
//   patch: Partial<MintBody>
// ): UploadMetadataInput {
//   const merged: UploadMetadataInput = { ...current };

//   if (patch.title) merged.name = patch.title;
//   if (patch.description) merged.description = patch.description;
//   if (patch.imageUrl !== undefined) merged.image = patch.imageUrl;
//   if (patch.symbol) merged.symbol = patch.symbol;

//   // Ensure properties exists
//   if (!merged.properties || typeof merged.properties !== 'object') {
//     merged.properties = {};
//   }
//   if (patch.owners) {
//     // UploadMetadataInput is index-signature-friendly
//     merged.properties.owners = patch.owners;
//   }

//   // Normalize attributes
//   const attrs = Array.isArray(merged.attributes) ? merged.attributes.slice() : [];

//   const setAttr = (trait_type: string, value: unknown) => {
//     if (value === undefined || value === null) return;
//     const strVal = String(value); // Metaplex expects string | undefined
//     const idx = attrs.findIndex((a: any) => a?.trait_type === trait_type);
//     if (idx >= 0) attrs[idx] = { ...attrs[idx], value: strVal };
//     else attrs.push({ trait_type, value: strVal });
//   };

//   if (patch.trade) {
//     const t = patch.trade;
//     setAttr('Exchange', t.exchange);
//     setAttr('Coin', t.coin);
//     setAttr('Direction', t.direction);
//     setAttr('Amount', t.amountUSD);
//     setAttr('Entry Price', t.entryPrice);
//     setAttr('Exit Price', t.exitPrice);
//     setAttr('Profit/Loss', t.profitLoss);
//     setAttr('Leverage', t.leverage);
//     setAttr('Entry Fees', t.entryFees);
//     setAttr('Exit Fees', t.exitFees);
//     setAttr('Size', t.size);
//     setAttr('Transaction ID', t.transactionId);
//     setAttr('% of Full Position', t.pctOfFullPosition);
//     setAttr('Split Approach', t.splitApproach);
//   }

//   merged.attributes = attrs;
//   return merged;
// }

import type { UploadMetadataInput } from '@metaplex-foundation/js';
import { MintBody } from '../types.js';

export function transformToMetaplexMetadata(data: MintBody): UploadMetadataInput {
  const { title, description, imageUrl, symbol, owners, trade } = data;

  const json: UploadMetadataInput = {
    name: title,
    symbol: symbol || process.env.NFT_SYMBOL || 'OWN',
    description,
    image: imageUrl || '',
    attributes: [
      { trait_type: 'Exchange', value: trade.exchange },
      { trait_type: 'Coin', value: trade.coin },
      { trait_type: 'Direction', value: trade.direction },
      { trait_type: 'Amount', value: trade.amountUSD },
      { trait_type: 'Entry Price', value: trade.entryPrice },
      { trait_type: 'Exit Price', value: trade.exitPrice ?? '' },
      { trait_type: 'Profit/Loss', value: trade.profitLoss ?? '' },
      { trait_type: 'Leverage', value: trade.leverage },
      { trait_type: 'Entry Fees', value: trade.entryFees },
      { trait_type: 'Exit Fees', value: trade.exitFees ?? '' },
      { trait_type: 'Size', value: trade.size },
      { trait_type: 'Transaction ID', value: trade.transactionId },
      { trait_type: '% of Full Position', value: trade.pctOfFullPosition },
      { trait_type: 'Split Approach', value: trade.splitApproach }
    ],
    properties: {
      category: 'utility',
      owners: owners || []
    }
  };

  return json;
}

export function mergeMetadata(
  current: UploadMetadataInput,
  patch: Partial<MintBody>
): UploadMetadataInput {
  const merged: UploadMetadataInput = { ...current };

  if (patch.title) merged.name = patch.title;
  if (patch.description) merged.description = patch.description;
  if (patch.imageUrl !== undefined) merged.image = patch.imageUrl;
  if (patch.symbol) merged.symbol = patch.symbol;

  if (!merged.properties || typeof merged.properties !== 'object') merged.properties = {};
  if (patch.owners) merged.properties.owners = patch.owners;

  const attrs = Array.isArray(merged.attributes) ? [...merged.attributes] : [];
  const setAttr = (trait_type: string, value: unknown) => {
    if (value === undefined || value === null) return;
    const strVal = String(value);
    const idx = attrs.findIndex(a => a?.trait_type === trait_type);
    if (idx >= 0) attrs[idx] = { ...attrs[idx], value: strVal };
    else attrs.push({ trait_type, value: strVal });
  };

  if (patch.trade) {
    const t = patch.trade;
    setAttr('Exchange', t.exchange);
    setAttr('Coin', t.coin);
    setAttr('Direction', t.direction);
    setAttr('Amount', t.amountUSD);
    setAttr('Entry Price', t.entryPrice);
    setAttr('Exit Price', t.exitPrice);
    setAttr('Profit/Loss', t.profitLoss);
    setAttr('Leverage', t.leverage);
    setAttr('Entry Fees', t.entryFees);
    setAttr('Exit Fees', t.exitFees);
    setAttr('Size', t.size);
    setAttr('Transaction ID', t.transactionId);
    setAttr('% of Full Position', t.pctOfFullPosition);
    setAttr('Split Approach', t.splitApproach);
  }

  merged.attributes = attrs;
  return merged;
}
