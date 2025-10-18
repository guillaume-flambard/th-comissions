import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon } from 'lucide-react';

/**
 * Type definition for referral status
 */
type ReferralStatus = 'pending' | 'validated' | 'paid' | 'disputed';

/**
 * Referral data structure
 */
export interface Referral {
    id: number;
    customer_name: string;
    partner_name: string;
    service_type: string;
    amount: number;
    commission: number;
    status: ReferralStatus;
    created_at: string;
}

interface RecentReferralsTableProps {
    /**
     * Array of recent referrals to display
     */
    referrals: Referral[];

    /**
     * Callback when "View All" is clicked
     */
    onViewAll?: () => void;

    /**
     * Maximum number of rows to show (default: 10)
     */
    maxRows?: number;
}

/**
 * RecentReferralsTable - Displays the most recent referrals in a clean, readable table
 *
 * Design decisions:
 * - Mobile-responsive: stacks into cards on small screens
 * - Status badges with color coding for quick identification
 * - Currency formatting in Thai Baht
 * - Hover states for better interactivity
 * - Empty state handled gracefully
 */
export function RecentReferralsTable({
    referrals,
    onViewAll,
    maxRows = 10,
}: RecentReferralsTableProps) {
    const displayReferrals = referrals.slice(0, maxRows);

    /**
     * Get badge variant based on referral status
     */
    const getStatusBadgeVariant = (
        status: ReferralStatus,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'paid':
                return 'default'; // Blue/green for success
            case 'validated':
                return 'secondary'; // Gray for in-progress
            case 'pending':
                return 'outline'; // Outlined for pending
            case 'disputed':
                return 'destructive'; // Red for issues
            default:
                return 'outline';
        }
    };

    /**
     * Format status text for display
     */
    const formatStatus = (status: ReferralStatus): string => {
        const statusMap: Record<ReferralStatus, string> = {
            pending: 'Pending',
            validated: 'Validated',
            paid: 'Paid',
            disputed: 'Disputed',
        };
        return statusMap[status];
    };

    /**
     * Format currency in Thai Baht
     */
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Empty state
    if (displayReferrals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                            <ArrowRightIcon className="size-8 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No referrals yet
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Start tracking referrals by generating QR codes for
                            your partners
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Referrals</CardTitle>
                {onViewAll && (
                    <Button variant="ghost" size="sm" onClick={onViewAll}>
                        View All
                        <ArrowRightIcon className="ml-1 size-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Partner
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Service
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Commission
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                {displayReferrals.map((referral) => (
                                    <tr
                                        key={referral.id}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                            {referral.customer_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {referral.partner_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {referral.service_type}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(referral.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(
                                                referral.commission,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge
                                                variant={getStatusBadgeVariant(
                                                    referral.status,
                                                )}
                                            >
                                                {formatStatus(referral.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-500">
                                            {formatDate(referral.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-3 md:hidden">
                    {displayReferrals.map((referral) => (
                        <div
                            key={referral.id}
                            className="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {referral.customer_name}
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                                        via {referral.partner_name}
                                    </p>
                                </div>
                                <Badge
                                    variant={getStatusBadgeVariant(
                                        referral.status,
                                    )}
                                >
                                    {formatStatus(referral.status)}
                                </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-500">
                                        Service
                                    </p>
                                    <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                                        {referral.service_type}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 dark:text-slate-500">
                                        Commission
                                    </p>
                                    <p className="mt-0.5 font-semibold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(referral.commission)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-500">
                                    Total: {formatCurrency(referral.amount)}
                                </span>
                                <span className="text-slate-500 dark:text-slate-500">
                                    {formatDate(referral.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
