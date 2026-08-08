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
        commissionsEarned: {
            value: number;
            trend: number;
            isPositive: boolean;
        };
        commissionsOwed: {
            value: number;
            trend: number;
            isPositive: boolean;
        };
        activePartners: {
            value: number;
        };
        pendingReferrals: {
            value: number;
        };
    };

    /**
     * Top 5 partners by PLV
     */
    topPartners: Array<{
        id: number;
        business_name: string;
        business_type: string;
        total_referrals: number;
        total_commissions_paid: number;
        calculated_plv: number;
        conversion_rate: number;
        is_active: boolean;
    }>;

    /**
     * Recent referrals (last 10)
     */
    recentReferrals: Array<{
        id: string;
        customer_name: string;
        service_type: string;
        service_amount: number;
        commission_amount: number;
        status: string;
        booking_date: string;
        referring_partner: {
            id: number;
            business_name: string;
        };
        receiving_partner: {
            id: number;
            business_name: string;
        };
        created_at: string;
    }>;

    /**
     * Monthly commission data for the last 6 months
     */
    monthlyData: Array<{
        month: string;
        earned: number;
        owed: number;
    }>;
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
        commissionsEarned: { value: 0, trend: 0, isPositive: true },
        commissionsOwed: { value: 0, trend: 0, isPositive: true },
        activePartners: { value: 0 },
        pendingReferrals: { value: 0 },
    },
    topPartners = [],
    recentReferrals = [],
    monthlyData = [],
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
        // Navigate to referrals list page (create form doesn't exist yet)
        router.visit('/referrals');
    };

    const handleViewPartners = () => {
        // Navigate to partners page
        router.visit('/admin/partners');
    };

    const handleAddPartner = () => {
        // Navigate to add partner page
        router.visit('/admin/partners/create');
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
                        value={formatCurrency(stats.commissionsEarned.value)}
                        icon={WalletIcon}
                        variant="blue"
                        trend={{
                            value: stats.commissionsEarned.trend,
                            isPositive: stats.commissionsEarned.isPositive,
                        }}
                        description="Total commissions received"
                    />

                    {/* Commissions Owed This Month */}
                    <StatCard
                        title="Owed This Month"
                        value={formatCurrency(stats.commissionsOwed.value)}
                        icon={BanknoteIcon}
                        variant="orange"
                        trend={{
                            value: stats.commissionsOwed.trend,
                            isPositive: stats.commissionsOwed.isPositive,
                        }}
                        description="Pending payments to partners"
                    />

                    {/* Active Partners */}
                    <StatCard
                        title="Active Partners"
                        value={stats.activePartners.value}
                        icon={HandshakeIcon}
                        variant="green"
                        description="Total partner relationships"
                    />

                    {/* Pending Referrals */}
                    <StatCard
                        title="Pending Referrals"
                        value={stats.pendingReferrals.value}
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
                                {topPartners.length > 0 && (
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
                                {topPartners.length === 0 ? (
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
                                            onClick={handleAddPartner}
                                        >
                                            Add Partner
                                        </Button>
                                    </div>
                                ) : (
                                    // Partner list
                                    <div className="space-y-4">
                                        {topPartners.map((partner, index) => (
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
                                                        {partner.business_name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                                        {partner.business_type} •{' '}
                                                        {partner.total_referrals}{' '}
                                                        {partner.total_referrals ===
                                                        1
                                                            ? 'referral'
                                                            : 'referrals'}
                                                    </p>
                                                </div>

                                                {/* PLV value */}
                                                <div className="text-right">
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(
                                                            partner.calculated_plv,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                                        PLV
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
                            referrals={recentReferrals.map((ref) => ({
                                id: ref.id,
                                customer: ref.customer_name,
                                service: ref.service_type,
                                amount: ref.service_amount,
                                commission: ref.commission_amount,
                                status: ref.status as
                                    | 'pending'
                                    | 'validated'
                                    | 'paid'
                                    | 'disputed'
                                    | 'cancelled',
                                date: ref.booking_date,
                                from: ref.referring_partner.business_name,
                                to: ref.receiving_partner.business_name,
                            }))}
                            onViewAll={handleViewAllReferrals}
                            maxRows={5}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
