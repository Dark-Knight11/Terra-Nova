import React, { useMemo } from 'react';
import { Globe, Shield, ChevronRight } from 'lucide-react';

interface MarketCardProps {
    credit: any;
    className?: string;
    onClick: () => void;
}

const PatternBackground: React.FC<{ type: string; id: string | number }> = ({ type, id }) => {
    // Generate a numeric seed from the ID
    const numericId = useMemo(() => {
        if (typeof id === 'number') return id;
        let hash = 0;
        const str = String(id);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }, [id]);

    // Deterministic random number generator based on ID
    const random = (seed: number) => {
        const x = Math.sin(numericId * seed) * 10000;
        return x - Math.floor(x);
    };

    const pattern = useMemo(() => {
        const typeLower = type.toLowerCase();

        // Reforestation / Preservation - Organic Circles (Emerald/Green)
        if (typeLower.includes('reforestation') || typeLower.includes('preservation')) {
            return (
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <radialGradient id={`grad-${id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="#022c22" />
                    {[...Array(6)].map((_, i) => (
                        <circle
                            key={i}
                            cx={random(i + 1) * 400}
                            cy={random(i + 2) * 200}
                            r={40 + random(i + 3) * 60}
                            fill={`url(#grad-${id})`}
                            opacity={0.3 + random(i + 4) * 0.3}
                        />
                    ))}
                </svg>
            );
        }

        // Renewable Energy / Wind - Kinetic Lines (Cyan/Sky)
        if (typeLower.includes('wind') || typeLower.includes('energy')) {
            return (
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                    <rect width="100%" height="100%" fill="#083344" />
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={i}
                            x1={random(i) * 400 - 50}
                            y1={random(i + 1) * 200 + 50}
                            x2={random(i) * 400 + 150}
                            y2={random(i + 1) * 200 - 150}
                            stroke="#0EA5E9"
                            strokeWidth={1 + random(i + 2) * 2}
                            opacity={0.2 + random(i + 3) * 0.4}
                        />
                    ))}
                </svg>
            );
        }

        // Solar - Geometric/Radial (Amber/Orange)
        if (typeLower.includes('solar')) {
            return (
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                    <rect width="100%" height="100%" fill="#451a03" />
                    <circle cx="350" cy="50" r="100" fill="#F59E0B" opacity="0.2" />
                    {[...Array(5)].map((_, i) => (
                        <circle
                            key={i}
                            cx="350"
                            cy="50"
                            r={40 + i * 30}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="1"
                            opacity={0.1 + (5 - i) * 0.05}
                        />
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <path
                            key={i}
                            d={`M350 50 L${350 - 200 * Math.cos(i * 0.5)} ${50 + 200 * Math.sin(i * 0.5)}`}
                            stroke="#F59E0B"
                            strokeWidth="1"
                            opacity="0.1"
                        />
                    ))}
                </svg>
            );
        }

        // Blue Carbon - Fluid Waves (Blue/Indigo)
        if (typeLower.includes('blue') || typeLower.includes('water')) {
            return (
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <rect width="100%" height="100%" fill="#172554" />
                    {[...Array(4)].map((_, i) => (
                        <path
                            key={i}
                            d={`M0 ${100 + i * 20} Q 100 ${80 + i * 20 - random(i) * 40} 200 ${100 + i * 20} T 400 ${100 + i * 20}`}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            opacity={0.3 + i * 0.1}
                            className="animate-pulse"
                            style={{ animationDuration: `${3 + i}s` }}
                        />
                    ))}
                </svg>
            );
        }

        // Default - Grid
        return (
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
                <defs>
                    <pattern id={`grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#171717" />
                <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
            </svg>
        );
    }, [type, id]);

    return pattern;
};

const MarketCard: React.FC<MarketCardProps> = ({ credit, className, onClick }) => (
    <div onClick={onClick} className={`${className} group relative bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer`}>
        <div className="h-48 w-full relative overflow-hidden">
            <PatternBackground type={credit.type} id={credit.id} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs border border-white/10 text-emerald-400">
                Grade A+
            </div>
        </div>
        <div className="p-5">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{credit.type}</div>
            <h3 className="font-serif text-xl mb-3 group-hover:text-emerald-400 transition-colors">{credit.title}</h3>
            <div className="flex justify-between items-center text-sm text-white/70 mb-4">
                <span className="flex items-center gap-1"><Globe size={14} /> {credit.location}</span>
                <span className="flex items-center gap-1"><Shield size={14} className="text-emerald-500" /> {credit.score}/100</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                    <div className="text-xs text-white/40">Price / Ton</div>
                    <div className="font-mono text-lg">${credit.price}</div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-emerald-400 transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    </div>
);

export default MarketCard;
