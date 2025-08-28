declare module 'ipfs-car/pack/index.js' {
    export function pack(options: {
      input: any[]
      blockstore: any
      wrapWithDirectory?: boolean
    }): Promise<{ root: { toString(): string }; out: AsyncIterable<any> }>
  }
  
  declare module 'ipfs-car/blockstore/memory/index.js' {
    export class MemoryBlockStore {
      put(key: any, value: any): Promise<void>
      get(key: any): Promise<any>
      close(): Promise<void>
    }
  }
  