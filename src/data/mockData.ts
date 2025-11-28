export const credits = [
    {
        id: 1, title: "Amazonian Canopy", type: "Reforestation", price: "24.50", score: 98, location: "Brazil",
        image: "linear-gradient(135deg, #1a2a1a, #0f1f0f)",
        company: "EcoCorp Global",
        description: "A large-scale reforestation initiative restoring 50,000 hectares of degraded rainforest in the Amazon basin. This project not only sequesters carbon but also protects critical jaguar habitats and supports local indigenous communities.",
        vintage: "2023",
        volume: "50,000 tCO2e",
        methodology: "VM0007",
        wallet: "0x71C...9A2"
    },
    {
        id: 2, title: "Nordic Wind Farm", type: "Renewable Energy", price: "18.20", score: 95, location: "Norway",
        image: "linear-gradient(135deg, #1a2a3a, #0f1f2f)",
        company: "GreenChain Ltd",
        description: "Offshore wind farm project in the North Sea generating 500MW of clean energy. Replaces fossil-fuel based grid power and utilizes advanced turbine technology to minimize marine impact.",
        vintage: "2022",
        volume: "120,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x3B2...1F4"
    },
    {
        id: 3, title: "Sahara Solar Array", type: "Solar", price: "21.00", score: 92, location: "Morocco",
        image: "linear-gradient(135deg, #2a201a, #1f150f)",
        company: "Future Energy",
        description: "Concentrated solar power plant utilizing mirror technology to provide 24/7 renewable baseload power. Reduces dependency on imported coal.",
        vintage: "2023",
        volume: "85,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x9X1...8P0"
    },
    {
        id: 4, title: "Mangrove Shield", type: "Blue Carbon", price: "32.00", score: 99, location: "Indonesia",
        image: "linear-gradient(135deg, #1a2a2a, #0f1f1f)",
        company: "EcoCorp Global",
        description: "Restoration of coastal mangrove ecosystems. Mangroves sequester carbon up to 4x faster than tropical rainforests and provide essential storm surge protection.",
        vintage: "2024",
        volume: "15,000 tCO2e",
        methodology: "VM0033",
        wallet: "0x71C...9A2"
    },
    {
        id: 5, title: "Alaskan Carbon Sink", type: "Preservation", price: "28.50", score: 97, location: "USA",
        image: "linear-gradient(135deg, #1a2a2a, #2f3f3f)",
        company: "Arctic Trust",
        description: "Forest preservation project in the Alaskan interior preventing logging of old-growth boreal forests.",
        vintage: "2023",
        volume: "40,000 tCO2e",
        methodology: "VM0015",
        wallet: "0x2A5...7K9"
    },
    {
        id: 6, title: "Kenya Geothermal", type: "Renewable Energy", price: "19.75", score: 94, location: "Kenya",
        image: "linear-gradient(135deg, #2a1a1a, #3f2f1f)",
        company: "Rift Valley Power",
        description: "Geothermal expansion project harnessing the Great Rift Valley's heat to provide stable, clean electricity to the national grid.",
        vintage: "2022",
        volume: "60,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x8L4...2M1"
    },
];

export const wallets = [
    { id: "0x71C...9A2", entity: "EcoCorp Global", score: 98, volume: "125k", status: "Verified" },
    { id: "0x3B2...1F4", entity: "GreenChain Ltd", score: 94, volume: "84k", status: "Verified" },
    { id: "0x9X1...8P0", entity: "Future Energy", score: 82, volume: "12k", status: "Pending" },
];

export const proposals = [
    { id: 12, title: "Adjust Transaction Fee to 1.5%", status: "Active", votesFor: 65, votesAgainst: 35, end: "2 Days" },
    { id: 11, title: "Add 'Blue Carbon' Category", status: "Passed", votesFor: 88, votesAgainst: 12, end: "Closed" },
    { id: 10, title: "Whitelist 'EcoCorp' Verifier", status: "Rejected", votesFor: 42, votesAgainst: 58, end: "Closed" },
];
