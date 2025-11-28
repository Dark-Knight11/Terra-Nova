import React from 'react';
import CompanyDashboard from './dashboard/CompanyDashboard';
import AuditorDashboard from './dashboard/AuditorDashboard';
import RegistryDashboard from './dashboard/RegistryDashboard';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const DashboardView: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return (
            <div className="pt-32 px-6 pb-20 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShieldAlert size={48} className="mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-serif text-white mb-2">Access Denied</h2>
                    <p className="text-white/40">Please sign in to view your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 px-6 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-serif text-white mb-2">
                        {user.role === 'COMPANY' ? 'Company Dashboard' :
                            user.role === 'AUDITOR' ? 'Auditor Dashboard' :
                                user.role === 'REGISTRY' ? 'Registry Dashboard' : 'Dashboard'}
                    </h1>
                    <p className="text-white/40">
                        Welcome back, <span className="text-emerald-400">{user.email || 'User'}</span>.
                    </p>
                </div>

                <div className="animate-fade-in">
                    {user.role === 'COMPANY' && <CompanyDashboard />}
                    {user.role === 'AUDITOR' && <AuditorDashboard />}
                    {user.role === 'REGISTRY' && <RegistryDashboard />}
                    {!['COMPANY', 'AUDITOR', 'REGISTRY'].includes(user.role) && (
                        <div className="text-center py-20 bg-[#0a0a0a]/50 border border-white/10 rounded-xl">
                            <p className="text-white/40">No dashboard available for your role ({user.role}).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
