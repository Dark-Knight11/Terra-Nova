import { ethers, BrowserProvider, Contract, parseEther } from 'ethers';

const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS || '';
const TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

const MARKETPLACE_ABI = [
    'function createFixedPriceListing(uint256 _projectId, uint256 _amount, uint256 _price) external returns (uint256)',
    'function buyFixedPrice(uint256 _listingId) external payable',
    'function cancelListing(uint256 _listingId) external',
    'event ListingCreated(uint256 indexed listingId, uint256 indexed projectId, address indexed seller, uint256 amount, uint256 startingPrice, uint8 auctionType)',
    'event FixedPriceSale(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price)'
];

const TOKEN_ABI = [
    'function setApprovalForAll(address operator, bool approved) external',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',
    'function balanceOf(address account, uint256 id) view returns (uint256)'
];

declare global {
    interface Window {
        ethereum: any;
    }
}

export class ContractService {
    private provider: BrowserProvider | null = null;
    private signer: any = null;
    private marketplaceContract: Contract | null = null;
    private tokenContract: Contract | null = null;

    constructor() {
        if (window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) throw new Error("No crypto wallet found");

        await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();

        this.marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, this.signer);
        this.tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, this.signer);

        return address;
    }

    async approveMarketplace(): Promise<void> {
        if (!this.tokenContract || !this.signer) await this.connectWallet();

        const address = await this.signer.getAddress();
        const isApproved = await this.tokenContract!.isApprovedForAll(address, MARKETPLACE_ADDRESS);

        if (!isApproved) {
            const tx = await this.tokenContract!.setApprovalForAll(MARKETPLACE_ADDRESS, true);
            await tx.wait();
        }
    }

    async createFixedPriceListing(projectId: string, amount: string, priceEth: string): Promise<string> {
        if (!this.marketplaceContract) await this.connectWallet();

        // Ensure approval first
        await this.approveMarketplace();

        const priceWei = parseEther(priceEth);
        const tx = await this.marketplaceContract!.createFixedPriceListing(projectId, amount, priceWei);
        await tx.wait();

        // Find ListingCreated event to get listingId
        // This is a bit complex without full ABI decoding, but for now we assume success
        return "Listing created";
    }

    async buyFixedPrice(listingId: string, priceEth: string): Promise<void> {
        if (!this.marketplaceContract) await this.connectWallet();

        const priceWei = parseEther(priceEth);
        const tx = await this.marketplaceContract!.buyFixedPrice(listingId, { value: priceWei });
        await tx.wait();
    }

    async cancelListing(listingId: string): Promise<void> {
        if (!this.marketplaceContract) await this.connectWallet();

        const tx = await this.marketplaceContract!.cancelListing(listingId);
        await tx.wait();
    }
}

export const contractService = new ContractService();
