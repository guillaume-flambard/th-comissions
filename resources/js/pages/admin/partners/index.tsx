import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Search,
    Filter,
    Download,
    Plus,
    TrendingUp,
    TrendingDown,
    Activity,
    QrCode,
    AlertTriangle,
} from 'lucide-react';

interface PartnerTier {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface Partner {
    id: number;
    business_name: string;
    business_type: string;
    contact_name: string;
    email: string;
    phone: string;
    city: string;
    calculated_plv: number;
    total_referrals: number;
    successful_conversions: number;
    conversion_rate: number;
    total_revenue_generated: number;
    engagement_score: number;
    churn_rate: number;
    last_referral_at: string | null;
    is_active: boolean;
    joined_at: string;
    tier: PartnerTier | null;
}

interface Props {
    partners: {
        data: Partner[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        business_type?: string;
        tier?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    businessTypes: string[];
    tiers: PartnerTier[];
}

export default function PartnersIndex({ partners, filters, businessTypes, tiers }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('admin.partners.index'),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (sortBy: string) => {
        const direction =
            filters.sort_by === sortBy && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.partners.index'),
            { ...filters, sort_by: sortBy, sort_direction: direction },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const getStatusBadge = (partner: Partner) => {
        if (!partner.is_active) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                    Inactive
                </span>
            );
        }

        if (partner.churn_rate > 50) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    <AlertTriangle className="h-3 w-3" />
                    At Risk
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
            </span>
        );
    };

    const getEngagementIndicator = (score: number) => {
        if (score >= 80) {
            return (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{score.toFixed(0)}</span>
                </div>
            );
        }
        if (score >= 50) {
            return (
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">{score.toFixed(0)}</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">{score.toFixed(0)}</span>
            </div>
        );
    };

    return (
        <>
            <Head title="Partners Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                <Users className="h-8 w-8 text-blue-500" />
                                Partners Management
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {partners.total} partners " {partners.data.filter((p) => p.is_active).length} active
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.get(route('admin.partners.export'))}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button onClick={() => router.get(route('admin.partners.create'))}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Partner
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 border-0 shadow-lg">
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                {/* Search */}
                                <form onSubmit={handleSearch} className="lg:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search partners..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </form>

                                {/* Business Type Filter */}
                                <Select
                                    value={filters.business_type || 'all'}
                                    onValueChange={(value) =>
                                        handleFilter('business_type', value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Business Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {businessTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace('_', ' ').toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Tier Filter */}
                                <Select
                                    value={filters.tier || 'all'}
                                    onValueChange={(value) =>
                                        handleFilter('tier', value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Partner Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tiers</SelectItem>
                                        {tiers.map((tier) => (
                                            <SelectItem key={tier.id} value={tier.slug}>
                                                {tier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Status Filter */}
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilter('status', value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="at_risk">At Risk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Partners Table */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-blue-500" />
                                Partner List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200 dark:border-gray-700">
                                        <tr className="text-left text-gray-500 dark:text-gray-400">
                                            <th className="pb-3 font-medium">Partner</th>
                                            <th className="pb-3 font-medium">Tier</th>
                                            <th
                                                className="cursor-pointer pb-3 font-medium hover:text-gray-900 dark:hover:text-white"
                                                onClick={() => handleSort('calculated_plv')}
                                            >
                                                PLV {filters.sort_by === 'calculated_plv' && (filters.sort_direction === 'asc' ? '‘' : '“')}
                                            </th>
                                            <th
                                                className="cursor-pointer pb-3 font-medium hover:text-gray-900 dark:hover:text-white"
                                                onClick={() => handleSort('total_revenue_generated')}
                                            >
                                                Revenue {filters.sort_by === 'total_revenue_generated' && (filters.sort_direction === 'asc' ? '‘' : '“')}
                                            </th>
                                            <th className="pb-3 font-medium">Conversions</th>
                                            <th className="pb-3 font-medium">Engagement</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {partners.data.map((partner) => (
                                            <tr
                                                key={partner.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {partner.business_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {partner.business_type.replace('_', ' ')} " {partner.city}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {partner.tier ? (
                                                        <span
                                                            className="rounded-full px-3 py-1 text-xs font-medium"
                                                            style={{
                                                                backgroundColor: partner.tier.color + '20',
                                                                color: partner.tier.color,
                                                            }}
                                                        >
                                                            {partner.tier.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(partner.calculated_plv)}
                                                </td>
                                                <td className="py-4 font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(partner.total_revenue_generated)}
                                                </td>
                                                <td className="py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {partner.successful_conversions}/{partner.total_referrals}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {partner.conversion_rate.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {getEngagementIndicator(partner.engagement_score)}
                                                </td>
                                                <td className="py-4">{getStatusBadge(partner)}</td>
                                                <td className="py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.get(
                                                                    route('admin.partners.show', partner.id)
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.get(
                                                                    route('admin.partners.qr', partner.id)
                                                                )
                                                            }
                                                        >
                                                            <QrCode className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {partners.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {(partners.current_page - 1) * partners.per_page + 1} to{' '}
                                        {Math.min(partners.current_page * partners.per_page, partners.total)} of{' '}
                                        {partners.total} partners
                                    </div>
                                    <div className="flex gap-2">
                                        {Array.from({ length: partners.last_page }, (_, i) => i + 1).map(
                                            (page) => (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        page === partners.current_page ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        router.get(
                                                            route('admin.partners.index'),
                                                            { ...filters, page },
                                                            { preserveState: true, preserveScroll: true }
                                                        )
                                                    }
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
