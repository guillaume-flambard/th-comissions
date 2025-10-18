import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DollarSign,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    CreditCard,
    AlertCircle,
} from 'lucide-react';

interface Partner {
    id: number;
    business_name: string;
}

interface Commission {
    id: number;
    partner: Partner;
    booking_reference: string;
    amount: number;
    commission_rate: number;
    currency: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    created_at: string;
    approved_at: string | null;
    paid_at: string | null;
    payment_method: string | null;
    invoice_number: string | null;
}

interface Props {
    commissions: {
        data: Commission[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        partner_id?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total_pending: number;
        total_approved: number;
        total_paid: number;
        pending_amount: number;
        approved_amount: number;
        paid_amount: number;
    };
    partners: Partner[];
}

export default function CommissionsIndex({ commissions, filters, stats, partners }: Props) {
    const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('admin.commissions.index'),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSelectAll = () => {
        if (selectedCommissions.length === commissions.data.length) {
            setSelectedCommissions([]);
        } else {
            setSelectedCommissions(commissions.data.map((c) => c.id));
        }
    };

    const handleSelectCommission = (commissionId: number) => {
        setSelectedCommissions((prev) =>
            prev.includes(commissionId)
                ? prev.filter((id) => id !== commissionId)
                : [...prev, commissionId]
        );
    };

    const handleBulkApprove = () => {
        if (selectedCommissions.length === 0) return;

        setIsProcessing(true);
        router.post(
            route('admin.commissions.bulk-approve'),
            { commission_ids: selectedCommissions },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedCommissions([]);
                    setIsProcessing(false);
                },
                onError: () => {
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleBulkPay = () => {
        if (selectedCommissions.length === 0) return;

        setIsProcessing(true);
        router.post(
            route('admin.commissions.bulk-pay'),
            { commission_ids: selectedCommissions },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedCommissions([]);
                    setIsProcessing(false);
                },
                onError: () => {
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleExportCsv = () => {
        router.get(route('admin.commissions.export'), filters, {
            preserveState: true,
        });
    };

    const getStatusConfig = (status: Commission['status']) => {
        const configs = {
            pending: {
                icon: Clock,
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                label: 'Pending',
            },
            approved: {
                icon: CheckCircle,
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                label: 'Approved',
            },
            paid: {
                icon: CreditCard,
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                label: 'Paid',
            },
            rejected: {
                icon: XCircle,
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                label: 'Rejected',
            },
        };
        return configs[status];
    };

    return (
        <>
            <Head title="Commission Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <DollarSign className="h-8 w-8 text-green-500" />
                            Commission Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {commissions.total} total commissions
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="overflow-hidden border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-br from-yellow-500 to-yellow-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Pending Approval
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.pending_amount)}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {stats.total_pending} commissions
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Approved
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.approved_amount)}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {stats.total_approved} commissions
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-br from-green-500 to-green-600 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-white/90">
                                        Paid Out
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-white/80" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.paid_amount)}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {stats.total_paid} commissions
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Bulk Actions */}
                    <Card className="mb-6 border-0 shadow-lg">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex gap-3">
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={(value) =>
                                            handleFilter('status', value === 'all' ? '' : value)
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.partner_id || 'all'}
                                        onValueChange={(value) =>
                                            handleFilter('partner_id', value === 'all' ? '' : value)
                                        }
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Partners</SelectItem>
                                            {partners.map((partner) => (
                                                <SelectItem key={partner.id} value={partner.id.toString()}>
                                                    {partner.business_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    {selectedCommissions.length > 0 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={handleBulkApprove}
                                                disabled={isProcessing}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve ({selectedCommissions.length})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleBulkPay}
                                                disabled={isProcessing}
                                            >
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Mark as Paid ({selectedCommissions.length})
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" onClick={handleExportCsv}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Commissions Table */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-green-500" />
                                Commission List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200 dark:border-gray-700">
                                        <tr className="text-left text-gray-500 dark:text-gray-400">
                                            <th className="w-12 pb-3">
                                                <Checkbox
                                                    checked={
                                                        selectedCommissions.length === commissions.data.length &&
                                                        commissions.data.length > 0
                                                    }
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="pb-3 font-medium">Booking Ref</th>
                                            <th className="pb-3 font-medium">Partner</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Rate</th>
                                            <th className="pb-3 font-medium">Created</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Payment Info</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {commissions.data.map((commission) => {
                                            const statusConfig = getStatusConfig(commission.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <tr
                                                    key={commission.id}
                                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="py-4">
                                                        <Checkbox
                                                            checked={selectedCommissions.includes(commission.id)}
                                                            onCheckedChange={() =>
                                                                handleSelectCommission(commission.id)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-4 font-mono text-xs">
                                                        {commission.booking_reference}
                                                    </td>
                                                    <td className="py-4 font-medium text-gray-900 dark:text-white">
                                                        {commission.partner.business_name}
                                                    </td>
                                                    <td className="py-4 text-lg font-bold text-green-600 dark:text-green-400">
                                                        {formatCurrency(commission.amount)}
                                                    </td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-400">
                                                        {commission.commission_rate}%
                                                    </td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-400">
                                                        {formatDate(commission.created_at)}
                                                    </td>
                                                    <td className="py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.color}`}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        {commission.invoice_number && (
                                                            <div className="text-xs">
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    {commission.invoice_number}
                                                                </div>
                                                                {commission.payment_method && (
                                                                    <div className="text-gray-500 dark:text-gray-400">
                                                                        {commission.payment_method}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex gap-2">
                                                            {commission.status === 'pending' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        router.post(
                                                                            route(
                                                                                'admin.commissions.approve',
                                                                                commission.id
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            {commission.status === 'approved' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        router.post(
                                                                            route(
                                                                                'admin.commissions.pay',
                                                                                commission.id
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    Mark Paid
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.get(
                                                                        route(
                                                                            'admin.commissions.show',
                                                                            commission.id
                                                                        )
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {commissions.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing{' '}
                                        {(commissions.current_page - 1) * commissions.per_page + 1} to{' '}
                                        {Math.min(
                                            commissions.current_page * commissions.per_page,
                                            commissions.total
                                        )}{' '}
                                        of {commissions.total} commissions
                                    </div>
                                    <div className="flex gap-2">
                                        {Array.from({ length: commissions.last_page }, (_, i) => i + 1).map(
                                            (page) => (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        page === commissions.current_page
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        router.get(
                                                            route('admin.commissions.index'),
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
