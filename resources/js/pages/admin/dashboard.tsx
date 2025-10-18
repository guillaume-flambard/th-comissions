import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Users, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';

interface Partner {
    id: number;
    business_name: string;
    business_type: string;
    plv: number;
    total_revenue: number;
    total_referrals: number;
    conversion_rate: number;
    engagement_score: number;
    tier: { name: string; color: string } | null;
}

interface AtRiskPartner {
    id: number;
    business_name: string;
    last_referral_at: string | null;
    engagement_score: number;
    churn_rate: number;
}

interface Booking {
    id: number;
    booking_reference: string;
    partner_name: string;
    service_name: string;
    amount: number;
    commission_amount: number;
    status: string;
    booking_date: string;
    customer_name: string;
}

interface Stats {
    total_partners: number;
    active_partners: number;
    total_bookings: number;
    completed_bookings: number;
    total_revenue: number;
    total_commissions_pending: number;
    total_commissions_paid: number;
    total_commissions_approved: number;
    month_revenue: number;
    month_bookings: number;
    month_new_partners: number;
    average_conversion_rate: number;
    average_plv: number;
}

interface Props {
    stats: Stats;
    topPartners: Partner[];
    atRiskPartners: AtRiskPartner[];
    recentBookings: Booking[];
    revenueByServiceType: Array<{ service_type: string; total: number; count: number }>;
}

export default function AdminDashboard({
    stats,
    topPartners,
    atRiskPartners,
    recentBookings,
    revenueByServiceType,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Commission Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Real-time analytics and partner performance metrics
                        </p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Revenue */}
                        <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.total_revenue)}
                                </div>
                                <div className="mt-2 flex items-center text-sm">
                                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {formatCurrency(stats.month_revenue)}
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Partners */}
                        <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-br from-purple-500 to-purple-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Active Partners
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatNumber(stats.active_partners)}
                                </div>
                                <div className="mt-2 flex items-center text-sm">
                                    <TrendingUpIcon className="mr-1 h-4 w-4 text-purple-500" />
                                    <span className="font-medium text-purple-600 dark:text-purple-400">
                                        +{stats.month_new_partners}
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">new this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Bookings */}
                        <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-br from-green-500 to-green-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Total Bookings
                                    </CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatNumber(stats.completed_bookings)}
                                </div>
                                <div className="mt-2 flex items-center text-sm">
                                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {stats.month_bookings}
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">this month</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Commissions */}
                        <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
                            <CardHeader className="bg-gradient-to-br from-amber-500 to-amber-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Pending Commissions
                                    </CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.total_commissions_pending)}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {formatCurrency(stats.total_commissions_paid)} paid
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column - 2/3 width */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Top Partners */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                                        Top Partners by PLV
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topPartners.map((partner, index) => (
                                            <div
                                                key={partner.id}
                                                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                                                    #{index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {partner.business_name}
                                                        </h3>
                                                        {partner.tier && (
                                                            <span
                                                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: partner.tier.color + '20',
                                                                    color: partner.tier.color,
                                                                }}
                                                            >
                                                                {partner.tier.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <span>{partner.total_referrals} referrals</span>
                                                        <span>{partner.conversion_rate.toFixed(1)}% conversion</span>
                                                        <span className="font-medium text-green-600">
                                                            {formatCurrency(partner.total_revenue)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">PLV</div>
                                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(partner.plv)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Bookings */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Recent Bookings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-gray-200 dark:border-gray-700">
                                                <tr className="text-left text-gray-500 dark:text-gray-400">
                                                    <th className="pb-3 font-medium">Reference</th>
                                                    <th className="pb-3 font-medium">Partner</th>
                                                    <th className="pb-3 font-medium">Service</th>
                                                    <th className="pb-3 font-medium">Amount</th>
                                                    <th className="pb-3 font-medium">Commission</th>
                                                    <th className="pb-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {recentBookings.map((booking) => (
                                                    <tr key={booking.id} className="text-gray-900 dark:text-white">
                                                        <td className="py-3 font-mono text-xs">
                                                            {booking.booking_reference}
                                                        </td>
                                                        <td className="py-3">{booking.partner_name}</td>
                                                        <td className="py-3">{booking.service_name}</td>
                                                        <td className="py-3 font-medium">
                                                            {formatCurrency(booking.amount)}
                                                        </td>
                                                        <td className="py-3 text-green-600">
                                                            {formatCurrency(booking.commission_amount)}
                                                        </td>
                                                        <td className="py-3">
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                                                            >
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - 1/3 width */}
                        <div className="space-y-8">
                            {/* At Risk Partners */}
                            <Card className="border-0 border-l-4 border-l-red-500 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        Partners at Risk
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {atRiskPartners.map((partner) => (
                                            <div
                                                key={partner.id}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {partner.business_name}
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-xs">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Last referral:{' '}
                                                        {partner.last_referral_at
                                                            ? new Date(partner.last_referral_at).toLocaleDateString()
                                                            : 'Never'}
                                                    </span>
                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                        {partner.churn_rate.toFixed(0)}% churn risk
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Revenue by Service Type */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Revenue by Service</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {revenueByServiceType.map((service) => {
                                            const percentage =
                                                (service.total / stats.total_revenue) * 100;
                                            return (
                                                <div key={service.service_type}>
                                                    <div className="mb-1 flex justify-between text-sm">
                                                        <span className="capitalize text-gray-700 dark:text-gray-300">
                                                            {service.service_type}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(service.total)}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {service.count} bookings
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
