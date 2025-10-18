import { type Referral } from '@/components/recent-referrals-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircleIcon,
    FilterIcon,
    PlusIcon,
    SearchIcon,
    TrendingUpIcon,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Referrals Index page props
 */
interface ReferralsIndexProps {
    /**
     * All referrals
     */
    referrals: Referral[];

    /**
     * Filters applied (from query params)
     */
    filters?: {
        search?: string;
        status?: string;
        direction?: 'received' | 'sent' | 'all';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Referrals',
        href: '/referrals',
    },
];

/**
 * Status options for filtering
 */
const STATUS_OPTIONS = [
    'All Statuses',
    'Pending',
    'Validated',
    'Paid',
    'Disputed',
];

/**
 * Referrals Index Page - View all referrals (sent and received)
 *
 * Design Philosophy:
 * - Clean, scannable list of referrals
 * - Tab navigation for received/sent/all
 * - Powerful filtering by status and search
 * - Bulk actions for efficiency
 * - Mobile-responsive card/table layout
 *
 * UX Decisions:
 * - Tabs at top for quick direction switching
 * - Search bar for finding specific referrals
 * - Status filter for focusing on specific workflow states
 * - Bulk select for marking multiple as paid
 * - Color-coded status badges for quick scanning
 * - Empty states with helpful CTAs
 */
export default function ReferralsIndex({
    referrals = [],
    filters = {},
}: ReferralsIndexProps) {
    // Direction tab state
    const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'all'>(
        filters.direction || 'all',
    );

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || 'All Statuses',
    );

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
            year: 'numeric',
        });
    };

    /**
     * Get status badge variant
     */
    const getStatusBadgeVariant = (
        status: string,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'default';
            case 'validated':
                return 'secondary';
            case 'pending':
                return 'outline';
            case 'disputed':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    /**
     * Format status for display
     */
    const formatStatus = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    /**
     * Filter referrals based on tab, search, and status
     */
    const filteredReferrals = referrals.filter((referral) => {
        // Tab filter (placeholder - would be handled by backend in real app)
        // For demo purposes, we're showing all

        // Search filter
        const matchesSearch =
            !searchQuery ||
            referral.customer_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            referral.partner_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            referral.service_type
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus =
            statusFilter === 'All Statuses' ||
            referral.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    /**
     * Handle tab change
     */
    const handleTabChange = (tab: 'received' | 'sent' | 'all') => {
        setActiveTab(tab);
        // TODO: Update URL with Inertia router
    };

    /**
     * Handle search
     */
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // TODO: Debounced search with Inertia
    };

    /**
     * Handle status filter change
     */
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        // TODO: Update URL with Inertia router
    };

    /**
     * Handle select/deselect referral
     */
    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    /**
     * Handle select all / deselect all
     */
    const handleToggleSelectAll = () => {
        if (selectedIds.length === filteredReferrals.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReferrals.map((r) => r.id));
        }
    };

    /**
     * Handle bulk mark as paid
     */
    const handleBulkMarkPaid = () => {
        if (selectedIds.length === 0) return;

        if (confirm(`Mark ${selectedIds.length} referrals as paid?`)) {
            router.post(
                '/referrals/bulk-mark-paid',
                {
                    ids: selectedIds,
                },
                {
                    onSuccess: () => {
                        setSelectedIds([]);
                    },
                },
            );
        }
    };

    /**
     * Handle add new referral
     */
    const handleAddReferral = () => {
        router.visit('/referrals/create');
    };

    // Empty state - No referrals
    if (referrals.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Referrals" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md text-center">
                        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                            <TrendingUpIcon className="size-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                            No referrals yet
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Start tracking referrals by logging your first
                            commission or sharing QR codes with partners
                        </p>
                        <Button
                            size="lg"
                            className="mt-6"
                            onClick={handleAddReferral}
                        >
                            <PlusIcon className="mr-2 size-5" />
                            Log Your First Referral
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Referrals" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                            Referrals
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Track and manage all your commission referrals
                        </p>
                    </div>
                    <Button size="lg" onClick={handleAddReferral}>
                        <PlusIcon className="mr-2 size-5" />
                        Log Referral
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleTabChange('received')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'received'
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Received
                    </button>
                    <button
                        onClick={() => handleTabChange('sent')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'sent'
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Sent
                    </button>
                </div>

                {/* Filters and Bulk Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search and Status Filter */}
                    <div className="flex flex-1 gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:max-w-sm">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search referrals..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleBulkMarkPaid}
                            >
                                <CheckCircleIcon className="mr-2 size-4" />
                                Mark as Paid
                            </Button>
                        </div>
                    )}
                </div>

                {/* Referrals Count */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredReferrals.length} of {referrals.length}{' '}
                    {referrals.length === 1 ? 'referral' : 'referrals'}
                </div>

                {/* Referrals Table/List */}
                {filteredReferrals.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                        <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <FilterIcon className="size-8 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No referrals found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Try adjusting your search or filters
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('All Statuses');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <Card className="hidden md:block">
                            <CardContent className="p-0">
                                <div className="overflow-hidden rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-900">
                                            <tr>
                                                <th className="w-12 px-4 py-3">
                                                    <Checkbox
                                                        checked={
                                                            selectedIds.length ===
                                                            filteredReferrals.length
                                                        }
                                                        onCheckedChange={
                                                            handleToggleSelectAll
                                                        }
                                                    />
                                                </th>
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
                                            {filteredReferrals.map(
                                                (referral) => (
                                                    <tr
                                                        key={referral.id}
                                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <Checkbox
                                                                checked={selectedIds.includes(
                                                                    referral.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handleToggleSelect(
                                                                        referral.id,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            {
                                                                referral.customer_name
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                referral.partner_name
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                            {
                                                                referral.service_type
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                                                            {formatCurrency(
                                                                referral.amount,
                                                            )}
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
                                                                {formatStatus(
                                                                    referral.status,
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-500">
                                                            {formatDate(
                                                                referral.created_at,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile Card View */}
                        <div className="space-y-3 md:hidden">
                            {filteredReferrals.map((referral) => (
                                <Card key={referral.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    referral.id,
                                                )}
                                                onCheckedChange={() =>
                                                    handleToggleSelect(
                                                        referral.id,
                                                    )
                                                }
                                                className="mt-0.5"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {
                                                                referral.customer_name
                                                            }
                                                        </p>
                                                        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                                                            via{' '}
                                                            {
                                                                referral.partner_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={getStatusBadgeVariant(
                                                            referral.status,
                                                        )}
                                                    >
                                                        {formatStatus(
                                                            referral.status,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-slate-500 dark:text-slate-500">
                                                            Service
                                                        </p>
                                                        <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                                                            {
                                                                referral.service_type
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-slate-500 dark:text-slate-500">
                                                            Commission
                                                        </p>
                                                        <p className="mt-0.5 font-semibold text-blue-600 dark:text-blue-400">
                                                            {formatCurrency(
                                                                referral.commission,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-500">
                                                        Total:{' '}
                                                        {formatCurrency(
                                                            referral.amount,
                                                        )}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-slate-500">
                                                        {formatDate(
                                                            referral.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
