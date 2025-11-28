import { ethers, BrowserProvider, Contract, parseEther, formatEther } from 'ethers';

// Contract Addresses (Sepolia Testnet)
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS || '0x63CdAF5CC857105E7a0dAE9463Ef8E04dF5A3c8e';
const TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const NFT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0x15B2Ee2cc7069a6F9c74dC451CE56C6a7956f442';

// Chain ID for Sepolia
const SEPOLIA_CHAIN_ID = 11155111;

const MARKETPLACE_ABI = [
    // Fixed Price Listing
    'function createFixedPriceListing(uint256 _projectId, uint256 _amount, uint256 _price) external returns (uint256)',
    'function buyFixedPrice(uint256 _listingId) external payable',
    'function cancelListing(uint256 _listingId) external',

    // English Auction
    'function createEnglishAuction(uint256 _projectId, uint256 _amount, uint256 _startingPrice, uint256 _reservePrice, uint256 _duration) external returns (uint256)',
    'function placeBid(uint256 _listingId) external payable',
    'function finalizeAuction(uint256 _listingId) external',

    // Dutch Auction
    'function createDutchAuction(uint256 _projectId, uint256 _amount, uint256 _startingPrice, uint256 _reservePrice, uint256 _priceDecrement, uint256 _decrementInterval, uint256 _duration) external returns (uint256)',
    'function buyDutchAuction(uint256 _listingId) external payable',
    'function getCurrentDutchPrice(uint256 _listingId) external view returns (uint256)',

    // View Functions
    'function getListing(uint256 _listingId) external view returns (tuple(uint256 listingId, uint256 projectId, address seller, uint256 amount, uint256 startingPrice, uint256 reservePrice, uint256 currentPrice, address highestBidder, uint256 startTime, uint256 endTime, uint8 auctionType, uint8 status))',
    'function getSellerListings(address _seller) external view returns (uint256[])',
    'function getListingBids(uint256 _listingId) external view returns (tuple(address bidder, uint256 amount, uint256 timestamp)[])',
    'function withdraw() external',
    'function pendingWithdrawals(address) external view returns (uint256)',

    // Events
    'event ListingCreated(uint256 indexed listingId, uint256 indexed projectId, address indexed seller, uint256 amount, uint256 startingPrice, uint8 auctionType)',
    'event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount, uint256 timestamp)',
    'event AuctionCompleted(uint256 indexed listingId, address indexed winner, uint256 finalPrice, uint256 amount)',
    'event FixedPriceSale(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price)',
    'event AuctionCancelled(uint256 indexed listingId, address indexed seller)'
];

const TOKEN_ABI = [
    // ERC1155 Functions
    'function setApprovalForAll(address operator, bool approved) external',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',

    // Project Management
    'function submitProject(string memory _projectName, uint8 _category, uint8 _primaryGasType, string memory _country, string memory _registry, address _consultant, string memory _verificationDocHash, uint256 _vintageYear) external returns (uint256)',
    'function getProjectBasicInfo(uint256 _projectId) external view returns (tuple(uint256 projectId, string projectName, address projectDeveloper, address consultant, address auditor, uint8 category, uint8 primaryGasType))',
    'function getProjectDetailsStruct(uint256 _projectId) external view returns (tuple(string country, string registry, uint256 vintageYear, uint8 status, uint256 createdAt, uint256 approvedAt))',
    'function getProjectCredits(uint256 _projectId) external view returns (tuple(uint256 totalCreditsIssued, uint256 totalCreditsRetired, string verificationDocHash, string monitoringReportHash))',
    'function getDeveloperProjects(address _developer) external view returns (uint256[])',
    'function getTotalProjects() external view returns (uint256)',
    'function projectExists(uint256 _projectId) external view returns (bool)',

    // Admin Functions (for Registry role)
    'function mintCredits(uint256 _projectId, uint256 _amount, string memory _monitoringReportHash) external',
    'function approveProject(uint256 _projectId) external',
    'function assignAuditor(uint256 _projectId, address _auditor) external',

    // Events
    'event ProjectSubmitted(uint256 indexed projectId, address indexed developer, string projectName, uint8 category)',
    'event CreditMinted(address indexed to, uint256 amount, uint256 projectId)',
    'event ProjectApproved(uint256 indexed projectId, address indexed auditor, uint256 approvedAt)'
];

const NFT_ABI = [
    'function mintRetirementCertificate(address _to, uint256 _projectId, uint256 _amount, string memory _tokenURI) external returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)'
];

// Project Categories enum mapping
export const ProjectCategory = {
    RenewableEnergy: 0,
    Reforestation: 1,
    EnergyEfficiency: 2,
    WasteManagement: 3,
    OceanConservation: 4,
    SoilCarbon: 5,
    Other: 6
} as const;

// Gas Types enum mapping
export const GasType = {
    CO2: 0,
    Methane: 1,
    CO: 2,
    N2O: 3,
    Other: 4
} as const;

// Auction Types
export const AuctionType = {
    English: 0,
    Dutch: 1,
    FixedPrice: 2
} as const;

// Auction Status
export const AuctionStatus = {
    Active: 0,
    Completed: 1,
    Cancelled: 2
} as const;

// Project Status
export const ProjectStatus = {
    Submitted: 0,
    UnderAudit: 1,
    Approved: 2,
    Rejected: 3,
    Active: 4,
    Completed: 5
} as const;



export interface Listing {
    listingId: string;
    projectId: string;
    seller: string;
    amount: string;
    startingPrice: string;
    reservePrice: string;
    currentPrice: string;
    highestBidder: string;
    startTime: number;
    endTime: number;
    auctionType: number;
    status: number;
}

export interface ProjectInfo {
    projectId: string;
    projectName: string;
    projectDeveloper: string;
    consultant: string;
    auditor: string;
    category: number;
    primaryGasType: number;
    country: string;
    registry: string;
    vintageYear: number;
    status: number;
    createdAt: number;
    approvedAt: number;
    totalCreditsIssued: string;
    totalCreditsRetired: string;
}

export class ContractService {
    private provider: BrowserProvider | null = null;
    private signer: any = null;
    private marketplaceContract: Contract | null = null;
    private tokenContract: Contract | null = null;
    private nftContract: Contract | null = null;
    private connectedAddress: string | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum as any);
        }
    }

    // Check if wallet is available
    isWalletAvailable(): boolean {
        return typeof window !== 'undefined' && !!window.ethereum;
    }

    // Get current connected address
    getConnectedAddress(): string | null {
        return this.connectedAddress;
    }

    // Check if on correct network
    async checkNetwork(): Promise<boolean> {
        if (!this.provider) return false;
        const network = await this.provider.getNetwork();
        return Number(network.chainId) === SEPOLIA_CHAIN_ID;
    }

    // Switch to Sepolia network
    async switchToSepolia(): Promise<void> {
        if (!window.ethereum) throw new Error("No wallet found");

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
            });
        } catch (switchError: any) {
            // If chain not added, add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                });
            } else {
                throw switchError;
            }
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) throw new Error("No crypto wallet found. Please install MetaMask.");

        // Check network
        const isCorrectNetwork = await this.checkNetwork();
        if (!isCorrectNetwork) {
            await this.switchToSepolia();
            // Re-initialize provider after network switch
            this.provider = new ethers.BrowserProvider(window.ethereum as any);
        }

        await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        this.connectedAddress = await this.signer.getAddress();

        this.marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, this.signer);
        this.tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, this.signer);
        this.nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, this.signer);

        return this.connectedAddress!;
    }

    private async ensureConnected(): Promise<void> {
        if (!this.signer || !this.marketplaceContract || !this.tokenContract) {
            await this.connectWallet();
        }
    }

    // ==================== TOKEN CONTRACT FUNCTIONS ====================

    async approveMarketplace(): Promise<void> {
        await this.ensureConnected();

        const isApproved = await this.tokenContract!.isApprovedForAll(this.connectedAddress, MARKETPLACE_ADDRESS);

        if (!isApproved) {
            const tx = await this.tokenContract!.setApprovalForAll(MARKETPLACE_ADDRESS, true);
            await tx.wait();
        }
    }

    async getTokenBalance(projectId: string): Promise<string> {
        await this.ensureConnected();
        const balance = await this.tokenContract!['balanceOf(address,uint256)'](this.connectedAddress, projectId);
        return balance.toString();
    }

    async getTotalBalance(): Promise<string> {
        await this.ensureConnected();
        const balance = await this.tokenContract!['balanceOf(address)'](this.connectedAddress);
        return balance.toString();
    }

    async submitProject(
        projectName: string,
        category: number,
        primaryGasType: number,
        country: string,
        registry: string,
        consultant: string,
        verificationDocHash: string,
        vintageYear: number
    ): Promise<{ txHash: string; projectId: string }> {
        await this.ensureConnected();

        const tx = await this.tokenContract!.submitProject(
            projectName,
            category,
            primaryGasType,
            country,
            registry,
            consultant || ethers.ZeroAddress,
            verificationDocHash,
            vintageYear
        );
        const receipt = await tx.wait();

        // Parse ProjectSubmitted event to get projectId
        let projectId = '0';
        for (const log of receipt.logs) {
            try {
                const parsed = this.tokenContract!.interface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed?.name === 'ProjectSubmitted') {
                    projectId = parsed.args.projectId.toString();
                    break;
                }
            } catch { }
        }

        return { txHash: receipt.hash, projectId };
    }

    async getProjectInfo(projectId: string): Promise<ProjectInfo | null> {
        await this.ensureConnected();

        try {
            const exists = await this.tokenContract!.projectExists(projectId);
            if (!exists) return null;

            const basicInfo = await this.tokenContract!.getProjectBasicInfo(projectId);
            const details = await this.tokenContract!.getProjectDetailsStruct(projectId);
            const credits = await this.tokenContract!.getProjectCredits(projectId);

            return {
                projectId: basicInfo.projectId.toString(),
                projectName: basicInfo.projectName,
                projectDeveloper: basicInfo.projectDeveloper,
                consultant: basicInfo.consultant,
                auditor: basicInfo.auditor,
                category: Number(basicInfo.category),
                primaryGasType: Number(basicInfo.primaryGasType),
                country: details.country,
                registry: details.registry,
                vintageYear: Number(details.vintageYear),
                status: Number(details.status),
                createdAt: Number(details.createdAt),
                approvedAt: Number(details.approvedAt),
                totalCreditsIssued: credits.totalCreditsIssued.toString(),
                totalCreditsRetired: credits.totalCreditsRetired.toString()
            };
        } catch (error) {
            console.error('Error fetching project info:', error);
            return null;
        }
    }

    async getDeveloperProjects(): Promise<string[]> {
        await this.ensureConnected();
        const projectIds = await this.tokenContract!.getDeveloperProjects(this.connectedAddress);
        return projectIds.map((id: bigint) => id.toString());
    }

    async getTotalProjects(): Promise<number> {
        await this.ensureConnected();
        const total = await this.tokenContract!.getTotalProjects();
        return Number(total);
    }

    // ==================== MARKETPLACE CONTRACT FUNCTIONS ====================

    async createFixedPriceListing(projectId: string, amount: string, priceEth: string): Promise<{ txHash: string; listingId: string }> {
        await this.ensureConnected();
        await this.approveMarketplace();

        const priceWei = parseEther(priceEth);
        const tx = await this.marketplaceContract!.createFixedPriceListing(projectId, amount, priceWei);
        const receipt = await tx.wait();

        // Parse ListingCreated event
        let listingId = '0';
        for (const log of receipt.logs) {
            try {
                const parsed = this.marketplaceContract!.interface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed?.name === 'ListingCreated') {
                    listingId = parsed.args.listingId.toString();
                    break;
                }
            } catch { }
        }

        return { txHash: receipt.hash, listingId };
    }

    async createEnglishAuction(
        projectId: string,
        amount: string,
        startingPriceEth: string,
        reservePriceEth: string,
        durationSeconds: number
    ): Promise<{ txHash: string; listingId: string }> {
        await this.ensureConnected();
        await this.approveMarketplace();

        const startingPriceWei = parseEther(startingPriceEth);
        const reservePriceWei = parseEther(reservePriceEth);

        const tx = await this.marketplaceContract!.createEnglishAuction(
            projectId,
            amount,
            startingPriceWei,
            reservePriceWei,
            durationSeconds
        );
        const receipt = await tx.wait();

        let listingId = '0';
        for (const log of receipt.logs) {
            try {
                const parsed = this.marketplaceContract!.interface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed?.name === 'ListingCreated') {
                    listingId = parsed.args.listingId.toString();
                    break;
                }
            } catch { }
        }

        return { txHash: receipt.hash, listingId };
    }

    async createDutchAuction(
        projectId: string,
        amount: string,
        startingPriceEth: string,
        reservePriceEth: string,
        priceDecrementEth: string,
        decrementIntervalSeconds: number,
        durationSeconds: number
    ): Promise<{ txHash: string; listingId: string }> {
        await this.ensureConnected();
        await this.approveMarketplace();

        const tx = await this.marketplaceContract!.createDutchAuction(
            projectId,
            amount,
            parseEther(startingPriceEth),
            parseEther(reservePriceEth),
            parseEther(priceDecrementEth),
            decrementIntervalSeconds,
            durationSeconds
        );
        const receipt = await tx.wait();

        let listingId = '0';
        for (const log of receipt.logs) {
            try {
                const parsed = this.marketplaceContract!.interface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed?.name === 'ListingCreated') {
                    listingId = parsed.args.listingId.toString();
                    break;
                }
            } catch { }
        }

        return { txHash: receipt.hash, listingId };
    }

    async buyFixedPrice(listingId: string, priceEth: string): Promise<string> {
        await this.ensureConnected();

        const priceWei = parseEther(priceEth);
        const tx = await this.marketplaceContract!.buyFixedPrice(listingId, { value: priceWei });
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async placeBid(listingId: string, bidAmountEth: string): Promise<string> {
        await this.ensureConnected();

        const bidWei = parseEther(bidAmountEth);
        const tx = await this.marketplaceContract!.placeBid(listingId, { value: bidWei });
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async buyDutchAuction(listingId: string): Promise<string> {
        await this.ensureConnected();

        // Get current Dutch price
        const currentPrice = await this.marketplaceContract!.getCurrentDutchPrice(listingId);
        const tx = await this.marketplaceContract!.buyDutchAuction(listingId, { value: currentPrice });
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async finalizeAuction(listingId: string): Promise<string> {
        await this.ensureConnected();

        const tx = await this.marketplaceContract!.finalizeAuction(listingId);
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async cancelListing(listingId: string): Promise<string> {
        await this.ensureConnected();

        const tx = await this.marketplaceContract!.cancelListing(listingId);
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async getListing(listingId: string): Promise<Listing | null> {
        await this.ensureConnected();

        try {
            const listing = await this.marketplaceContract!.getListing(listingId);
            return {
                listingId: listing.listingId.toString(),
                projectId: listing.projectId.toString(),
                seller: listing.seller,
                amount: listing.amount.toString(),
                startingPrice: formatEther(listing.startingPrice),
                reservePrice: formatEther(listing.reservePrice),
                currentPrice: formatEther(listing.currentPrice),
                highestBidder: listing.highestBidder,
                startTime: Number(listing.startTime),
                endTime: Number(listing.endTime),
                auctionType: Number(listing.auctionType),
                status: Number(listing.status)
            };
        } catch {
            return null;
        }
    }

    async getSellerListings(): Promise<string[]> {
        await this.ensureConnected();
        const listingIds = await this.marketplaceContract!.getSellerListings(this.connectedAddress);
        return listingIds.map((id: bigint) => id.toString());
    }

    async getCurrentDutchPrice(listingId: string): Promise<string> {
        await this.ensureConnected();
        const price = await this.marketplaceContract!.getCurrentDutchPrice(listingId);
        return formatEther(price);
    }

    async withdrawFunds(): Promise<string> {
        await this.ensureConnected();
        const tx = await this.marketplaceContract!.withdraw();
        const receipt = await tx.wait();
        return receipt.hash;
    }

    async getPendingWithdrawals(): Promise<string> {
        await this.ensureConnected();
        const amount = await this.marketplaceContract!.pendingWithdrawals(this.connectedAddress);
        return formatEther(amount);
    }

    // ==================== NFT CONTRACT FUNCTIONS ====================

    async mintRetirementCertificate(projectId: string, amount: string, tokenURI: string): Promise<string> {
        await this.ensureConnected();

        // First approve NFT contract to burn tokens
        const isApproved = await this.tokenContract!.isApprovedForAll(this.connectedAddress, NFT_ADDRESS);
        if (!isApproved) {
            const approveTx = await this.tokenContract!.setApprovalForAll(NFT_ADDRESS, true);
            await approveTx.wait();
        }

        const tx = await this.nftContract!.mintRetirementCertificate(
            this.connectedAddress,
            projectId,
            amount,
            tokenURI
        );
        const receipt = await tx.wait();
        return receipt.hash;
    }

    // ==================== UTILITY FUNCTIONS ====================

    formatEther(wei: string): string {
        return formatEther(wei);
    }

    parseEther(eth: string): bigint {
        return parseEther(eth);
    }

    // Get contract addresses for display
    getContractAddresses() {
        return {
            token: TOKEN_ADDRESS,
            marketplace: MARKETPLACE_ADDRESS,
            nft: NFT_ADDRESS
        };
    }
}

export const contractService = new ContractService();
