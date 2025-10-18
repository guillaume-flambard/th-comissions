import {
    RecentReferralsTable,
    type Referral,
} from '@/components/recent-referrals-table';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRightIcon,
    BanknoteIcon,
    HandshakeIcon,
    QrCodeIcon,
    TrendingUpIcon,
    UsersIcon,
    WalletIcon,
} from 'lucide-react';

/**
 * Dashboard page props with commission and referral data
 */
interface DashboardProps {
    /**
     * Commission statistics
     */
    stats: {
        commissions_earned_month: number;
        commissions_owed_month: number;
        active_partners_count: number;
        pending_referrals_count: number;
        commissions_earned_change?: number; // Percentage change from last month
        commissions_owed_change?: number;
    };

    /**
     * Top 5 partners by commission value (Partner Lifetime Value preview)
     */
    top_partners: Array<{
        id: number;
        name: string;
        type: string;
        total_commission: number;
        referral_count: number;
    }>;

    /**
     * Recent referrals (last 10)
     */
    recent_referrals: Referral[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

/**
 * Dashboard Page - Main hub after login
 *
 * Design Philosophy:
 * - Mobile-first with clear visual hierarchy
 * - Large, scannable numbers for quick insights
 * - Quick action buttons for common tasks
 * - Recent activity for context
 * - Top partners preview to highlight valuable relationships
 *
 * UX Decisions:
 * - Stats at top for immediate visibility
 * - Quick actions prominently placed for efficiency
 * - Color-coded metrics (blue for earnings, orange for outstanding payments)
 * - Empty states handled gracefully with actionable CTAs
 * - Responsive grid layout that adapts to all screen sizes
 */
export default function Dashboard({
    stats = {
        commissions_earned_month: 0,
        commissions_owed_month: 0,
        active_partners_count: 0,
        pending_referrals_count: 0,
    },
    top_partners = [],
    recent_referrals = [],
}: DashboardProps) {
    /**
     * Format currency in Thai Baht with proper formatting
     */
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    /**
     * Navigation handlers for quick actions
     */
    const handleGenerateQR = () => {
        // Navigate to QR code generation page
        router.visit('/qr-codes/generate');
    };

    const handleLogReferral = () => {
        // Navigate to log referral page
        router.visit('/referrals/create');
    };

    const handleViewPartners = () => {
        // Navigate to partners page
        router.visit('/partners');
    };

    const handleViewAllReferrals = () => {
        router.visit('/referrals');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Track your commission performance and manage your
                        partner network
                    </p>
                </div>

                {/* Key Metrics - 4 stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Commissions Earned This Month */}
                    <StatCard
                        title="Earned This Month"
                        value={formatCurrency(stats.commissions_earned_month)}
                        icon={WalletIcon}
                        variant="blue"
                        change={stats.commissions_earned_change}
                        description="Total commissions received"
                    />

                    {/* Commissions Owed This Month */}
                    <StatCard
                        title="Owed This Month"
                        value={formatCurrency(stats.commissions_owed_month)}
                        icon={BanknoteIcon}
                        variant="orange"
                        change={stats.commissions_owed_change}
                        description="Pending payments to partners"
                    />

                    {/* Active Partners */}
                    <StatCard
                        title="Active Partners"
                        value={stats.active_partners_count}
                        icon={HandshakeIcon}
                        variant="green"
                        description="Total partner relationships"
                    />

                    {/* Pending Referrals */}
                    <StatCard
                        title="Pending Referrals"
                        value={stats.pending_referrals_count}
                        icon={TrendingUpIcon}
                        variant="purple"
                        description="Awaiting validation"
                    />
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Button
                                size="lg"
                                className="h-auto flex-col gap-2 py-6"
                                onClick={handleGenerateQR}
                            >
                                <QrCodeIcon className="size-6" />
                                <span>Generate QR Code</span>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-6"
                                onClick={handleLogReferral}
                            >
                                <TrendingUpIcon className="size-6" />
                                <span>Log Referral</span>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-auto flex-col gap-2 py-6"
                                onClick={handleViewPartners}
                            >
                                <UsersIcon className="size-6" />
                                <span>View Partners</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Two-column layout for Top Partners and Recent Referrals */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Top Partners - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Top Partners</CardTitle>
                                {top_partners.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleViewPartners}
                                    >
                                        View All
                                        <ArrowRightIcon className="ml-1 size-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {top_partners.length === 0 ? (
                                    // Empty state
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                            <HandshakeIcon className="size-8 text-slate-400" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            No partners yet
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            Add your first partner to start
                                            tracking commissions
                                        </p>
                                        <Button
                                            className="mt-4"
                                            onClick={handleViewPartners}
                                        >
                                            Add Partner
                                        </Button>
                                    </div>
                                ) : (
                                    // Partner list
                                    <div className="space-y-4">
                                        {top_partners.map((partner, index) => (
                                            <div
                                                key={partner.id}
                                                className="flex items-center gap-4"
                                            >
                                                {/* Rank indicator */}
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                                    {index + 1}
                                                </div>

                                                {/* Partner info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-slate-900 dark:text-white">
                                                        {partner.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                                        {partner.type} •{' '}
                                                        {partner.referral_count}{' '}
                                                        {partner.referral_count ===
                                                        1
                                                            ? 'referral'
                                                            : 'referrals'}
                                                    </p>
                                                </div>

                                                {/* Commission value */}
                                                <div className="text-right">
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(
                                                            partner.total_commission,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Referrals - Takes 3 columns on large screens */}
                    <div className="lg:col-span-3">
                        <RecentReferralsTable
                            referrals={recent_referrals}
                            onViewAll={handleViewAllReferrals}
                            maxRows={5}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
