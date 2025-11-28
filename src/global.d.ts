
interface EthereumProvider {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    [key: string]: any;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

export { };
