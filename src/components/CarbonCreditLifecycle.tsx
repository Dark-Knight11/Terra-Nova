import React, { useState, useEffect } from 'react';
import { Coins, Shield, Store, TrendingUp, CheckCircle, Sparkles, FileText } from 'lucide-react';

interface LifecycleStage {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
    status: 'completed' | 'active' | 'pending';
}

interface LifecycleAddresses {
    developer?: string;
    auditor?: string;
    marketplace?: string;
    token?: string;
}

interface CarbonCreditLifecycleProps {
    currentStage?: number; // 1-5, defaults to showing all completed
    addresses?: LifecycleAddresses;
}

const CarbonCreditLifecycle: React.FC<CarbonCreditLifecycleProps> = ({ currentStage = 5, addresses }) => {
    const [hoveredStage, setHoveredStage] = useState<number | null>(null);
    const [revealedStages, setRevealedStages] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState(true);

    // Progressive reveal animation on mount
    useEffect(() => {
        const delays = [0, 300, 600, 900, 1200]; // Stagger each stage by 300ms

        stages.forEach((_stage, index) => {
            if (index < currentStage) {
                setTimeout(() => {
                    setRevealedStages(index + 1);
                }, delays[index]);
            }
        });

        // Mark animation as complete
        setTimeout(() => {
            setIsAnimating(false);
        }, delays[currentStage - 1] + 500);
    }, [currentStage]);


    const stages: LifecycleStage[] = [
        {
            id: 1,
            name: 'Initiation',
            description: 'Project proposal submitted by developer for initial review',
            icon: FileText,
            status: currentStage >= 1 ? (currentStage === 1 ? 'active' : 'completed') : 'pending',
        },
        {
            id: 2,
            name: 'Verification',
            description: 'AI-powered auditing validates authenticity and prevents double-counting',
            icon: Shield,
            status: currentStage >= 2 ? (currentStage === 2 ? 'active' : 'completed') : 'pending',
        },
        {
            id: 3,
            name: 'Minting',
            description: 'Carbon credits created on-chain via ERC-1155 smart contract standard',
            icon: Coins,
            status: currentStage >= 3 ? (currentStage === 3 ? 'active' : 'completed') : 'pending',
        },
        {
            id: 4,
            name: 'Listing',
            description: 'Project listed on decentralized marketplace for transparent trading',
            icon: Store,
            status: currentStage >= 4 ? (currentStage === 4 ? 'active' : 'completed') : 'pending',
        },
        {
            id: 5,
            name: 'Trading',
            description: 'Credits traded between verified buyers and sellers on the platform',
            icon: TrendingUp,
            status: currentStage >= 5 ? (currentStage === 5 ? 'active' : 'completed') : 'pending',
        },
    ];

    const getStageAddress = (stageId: number): string | undefined => {
        if (!addresses) return undefined;
        switch (stageId) {
            case 1: return addresses.developer;
            case 2: return addresses.auditor;
            case 3: return addresses.token;
            case 4: return addresses.marketplace;
            case 5: return addresses.marketplace;
            default: return undefined;
        }
    };

    const handleStageClick = (stageId: number) => {
        const address = getStageAddress(stageId);
        if (address && address !== '0x0000000000000000000000000000000000000000') {
            window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
        }
    };

    const getStageColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 shadow-emerald-500/20';
            case 'active':
                return 'border-blue-400/60 bg-gradient-to-br from-blue-500/20 to-blue-900/10 shadow-blue-500/30 shadow-lg';
            case 'pending':
                return 'border-white/10 bg-white/5';
            default:
                return '';
        }
    };

    const getIconColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-400';
            case 'active':
                return 'text-blue-400';
            case 'pending':
                return 'text-white/20';
            default:
                return '';
        }
    };

    const getConnectorGradient = (fromStatus: string, toStatus: string) => {
        if (fromStatus === 'completed' && (toStatus === 'completed' || toStatus === 'active')) {
            return 'linear-gradient(to right, rgb(52 211 153 / 0.6), rgb(52 211 153 / 0.6))';
        } else if (fromStatus === 'active') {
            return 'linear-gradient(to right, rgb(96 165 250 / 0.6), rgb(52 211 153 / 0.3))';
        } else if (fromStatus === 'completed' && toStatus === 'pending') {
            return 'linear-gradient(to right, rgb(52 211 153 / 0.6), rgb(255 255 255 / 0.1))';
        }
        return 'rgb(255 255 255 / 0.1)';
    };

    return (
        <div className="w-full py-10 px-4">
            {/* Header */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                    <Sparkles size={20} className="text-emerald-400" />
                    <h3 className="text-3xl md:text-4xl font-serif bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                        Carbon Credit Lifecycle
                    </h3>
                    <Sparkles size={20} className="text-blue-400" />
                </div>
                <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
                    Track the journey from creation to retirement with blockchain-backed transparency
                </p>
            </div>

            {/* Desktop Timeline - Horizontal */}
            <div className="hidden md:block">
                <div className="relative py-8">
                    {/* Background glow effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {stages.map((stage, index) => {
                            if (stage.status === 'active') {
                                return (
                                    <div
                                        key={`glow-${stage.id}`}
                                        className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
                                        style={{
                                            left: `${(index / (stages.length - 1)) * 100}%`,
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Connector Lines Container */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1" style={{ paddingLeft: '88px', paddingRight: '88px' }}>
                        <div className="relative h-full">
                            {stages.slice(0, -1).map((stage, index) => {
                                const isRevealed = revealedStages > index;
                                const nextStageRevealed = revealedStages > index + 1;

                                return (
                                    <div
                                        key={`connector-${stage.id}`}
                                        className="absolute h-full transition-all duration-700 ease-out rounded-full origin-left"
                                        style={{
                                            left: `${(index / (stages.length - 1)) * 100}%`,
                                            width: `${100 / (stages.length - 1)}%`,
                                            background: getConnectorGradient(stage.status, stages[index + 1].status),
                                            opacity: isRevealed ? (stage.status === 'completed' ? 1 : 0.5) : 0,
                                            transform: nextStageRevealed ? 'scaleX(1)' : 'scaleX(0)',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Stages */}
                    <div className="relative grid grid-cols-5 gap-6">
                        {stages.map((stage, index) => {
                            const Icon = stage.icon;
                            const isHovered = hoveredStage === stage.id;
                            const isRevealed = revealedStages > index;
                            const address = getStageAddress(stage.id);
                            const isClickable = !!address && address !== '0x0000000000000000000000000000000000000000';

                            return (
                                <div
                                    key={stage.id}
                                    className={`flex flex-col items-center transition-all duration-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                        } ${isClickable ? 'cursor-pointer' : ''}`}
                                    style={{
                                        transitionDelay: isAnimating ? `${index * 300}ms` : '0ms'
                                    }}
                                    onMouseEnter={() => setHoveredStage(stage.id)}
                                    onMouseLeave={() => setHoveredStage(null)}
                                    onClick={() => handleStageClick(stage.id)}
                                    title={isClickable ? `View on Etherscan: ${address}` : undefined}
                                >
                                    {/* Stage Icon Container */}
                                    <div className="relative mb-6 group">
                                        {/* Outer glow ring for active */}
                                        {stage.status === 'active' && isRevealed && (
                                            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl animate-pulse-slow scale-125" />
                                        )}

                                        {/* Main icon circle */}
                                        <div
                                            className={`
                                                relative w-24 h-24 rounded-full border-2 flex items-center justify-center 
                                                transition-all duration-500 backdrop-blur-xl z-10
                                                ${getStageColor(stage.status)}
                                                ${isHovered ? 'scale-110 -translate-y-1' : ''}
                                                ${stage.status === 'active' ? 'animate-pulse-slow' : ''}
                                            `}
                                        >
                                            {/* Inner glow */}
                                            {stage.status !== 'pending' && (
                                                <div className={`absolute inset-2 rounded-full ${stage.status === 'completed' ? 'bg-emerald-500/10' : 'bg-blue-500/10'} blur-sm`} />
                                            )}

                                            <Icon
                                                size={32}
                                                className={`relative z-10 ${getIconColor(stage.status)} ${isHovered ? 'scale-110' : ''} transition-transform duration-300`}
                                            />

                                            {/* Completion badge */}
                                            {stage.status === 'completed' && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg animate-fade-in">
                                                    <CheckCircle size={16} className="text-black" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stage Info */}
                                    <div className="text-center max-w-[160px] space-y-2">
                                        <div className={`font-semibold text-base transition-colors duration-300 ${stage.status === 'completed' ? 'text-white' :
                                            stage.status === 'active' ? 'text-blue-300' :
                                                'text-white/40'
                                            }`}>
                                            {stage.name}
                                        </div>

                                        {/* Description - always visible on desktop with better styling */}
                                        <p className={`text-xs leading-relaxed transition-all duration-300 ${isHovered ? 'text-white/80' : 'text-white/40'
                                            }`}>
                                            {stage.description}
                                        </p>

                                        {/* Status badge */}
                                        {stage.status === 'active' && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-xs font-medium rounded-full border border-blue-400/40 shadow-lg animate-fade-in backdrop-blur-sm">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                In Progress
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Timeline - Vertical */}
            <div className="md:hidden space-y-6">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isRevealed = revealedStages > index;

                    return (
                        <div
                            key={stage.id}
                            className={`relative transition-all duration-500 ${isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                }`}
                            style={{
                                transitionDelay: isAnimating ? `${index * 300}ms` : '0ms'
                            }}
                        >
                            {/* Connector Line */}
                            {index < stages.length - 1 && (
                                <div
                                    className="absolute left-9 top-20 w-1 rounded-full transition-all duration-700 origin-top"
                                    style={{
                                        height: 'calc(100% - 20px)',
                                        background: getConnectorGradient(stage.status, stages[index + 1].status),
                                        opacity: isRevealed ? (stage.status === 'completed' ? 1 : 0.5) : 0,
                                        transform: (revealedStages > index + 1) ? 'scaleY(1)' : 'scaleY(0)',
                                        transitionDelay: isAnimating ? `${(index + 1) * 300}ms` : '0ms',
                                    }}
                                />
                            )}

                            <div className="flex gap-5 items-start">
                                {/* Stage Icon */}
                                <div className="relative flex-shrink-0">
                                    {stage.status === 'active' && isRevealed && (
                                        <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg animate-pulse-slow scale-125" />
                                    )}

                                    <div
                                        className={`
                                            relative w-20 h-20 rounded-full border-2 flex items-center justify-center
                                            transition-all duration-500 backdrop-blur-xl
                                            ${getStageColor(stage.status)}
                                            ${stage.status === 'active' ? 'animate-pulse-slow' : ''}
                                        `}
                                    >
                                        {stage.status !== 'pending' && (
                                            <div className={`absolute inset-2 rounded-full ${stage.status === 'completed' ? 'bg-emerald-500/10' : 'bg-blue-500/10'} blur-sm`} />
                                        )}

                                        <Icon size={28} className={`relative z-10 ${getIconColor(stage.status)}`} />

                                        {stage.status === 'completed' && (
                                            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                                                <CheckCircle size={14} className="text-black" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stage Info */}
                                <div className="flex-1 pt-1 pb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className={`font-semibold text-base ${stage.status === 'completed' ? 'text-white' :
                                            stage.status === 'active' ? 'text-blue-300' :
                                                'text-white/40'
                                            }`}>
                                            {stage.name}
                                        </h4>

                                        {stage.status === 'active' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-xs font-medium rounded-full border border-blue-400/40">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-relaxed ${stage.status === 'pending' ? 'text-white/30' : 'text-white/60'
                                        }`}>
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Info Card */}
            <div className="mt-10 p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Shield size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Blockchain Verified</div>
                            <div className="text-xs text-white/50">Immutable transparency at every stage</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <span className="text-xs text-white/40">Current:</span>
                        <span className={`text-sm font-semibold ${stages[currentStage - 1]?.status === 'completed' ? 'text-emerald-400' :
                            stages[currentStage - 1]?.status === 'active' ? 'text-blue-400' :
                                'text-white/60'
                            }`}>
                            {stages[currentStage - 1]?.name || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarbonCreditLifecycle;
