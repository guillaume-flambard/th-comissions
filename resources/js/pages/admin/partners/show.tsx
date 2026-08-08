import { type Partner } from '@/components/partner-card';
import { type Referral } from '@/components/recent-referrals-table';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    BanknoteIcon,
    DownloadIcon,
    EditIcon,
    MailIcon,
    MoreVerticalIcon,
    PhoneIcon,
    QrCodeIcon,
    TrashIcon,
    TrendingUpIcon,
    UserIcon,
    WalletIcon,
} from 'lucide-react';

/**
 * Partner Detail page props
 */
interface PartnerShowProps {
    /**
     * Partner data
     */
    partner: Partner & {
        email?: string;
        phone?: string;
        promptpay_id?: string;
    };

    /**
     * All referrals from/to this partner
     */
    referrals: Referral[];

    /**
     * QR code data URL or path
     */
    qr_code?: string;

    /**
     * Statistics for this partner
     */
    stats: {
        total_paid: number;
        total_received: number;
        avg_commission_per_referral: number;
        pending_payments: number;
    };
}

/**
 * Partner Detail Page - Deep dive into a specific partner relationship
 *
 * Design Philosophy:
 * - Clear partner information display
 * - Prominent commission statistics
 * - QR code display and download
 * - Complete referral history
 * - Quick actions for common tasks
 *
 * UX Decisions:
 * - Info card at top for quick reference
 * - Stats cards for key metrics
 * - QR code prominently displayed for easy access
 * - Referrals table for detailed history
 * - Action buttons easily accessible
 */
export default function PartnerShow({
    partner,
    referrals = [],
    qr_code,
    stats,
}: PartnerShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Partners',
            href: '/admin/partners',
        },
        {
            title: partner.name,
            href: `/admin/partners/${partner.id}`,
        },
    ];

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
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    /**
     * Get status badge variant
     */
    const getStatusBadgeVariant = (
        status: string,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
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
     * Handle edit partner
     */
    const handleEdit = () => {
        router.visit(`/admin/partners/${partner.id}/edit`);
    };

    /**
     * Handle generate new QR code
     */
    const handleGenerateQR = () => {
        router.visit(`/qr-codes/generate?partner_id=${partner.id}`);
    };

    /**
     * Handle download QR code
     */
    const handleDownloadQR = () => {
        if (!qr_code) return;
        const link = document.createElement('a');
        link.href = qr_code;
        link.download = `${partner.name.replace(/\s+/g, '-')}-QR.png`;
        link.click();
    };

    /**
     * Handle delete partner
     */
    const handleDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete ${partner.name}? This action cannot be undone.`,
            )
        ) {
            router.delete(`/admin/partners/${partner.id}`, {
                onSuccess: () => router.visit('/admin/partners'),
            });
        }
    };

    /**
     * Handle mark payment
     */
    const handleMarkPayment = () => {
        router.visit(`/admin/partners/${partner.id}/mark-payment`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${partner.name} - Partner Details`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header with partner name and actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                                {partner.name}
                            </h1>
                            <Badge variant="outline">{partner.type}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Partner since {formatDate(partner.created_at)}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={handleGenerateQR}>
                            <QrCodeIcon className="mr-2 size-4" />
                            Generate QR
                        </Button>
                        <Button variant="outline" onClick={handleEdit}>
                            <EditIcon className="mr-2 size-4" />
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVerticalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleMarkPayment}>
                                    <BanknoteIcon className="mr-2 size-4" />
                                    Mark Payment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-red-600 dark:text-red-400"
                                >
                                    <TrashIcon className="mr-2 size-4" />
                                    Delete Partner
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Two-column layout: Info + QR | Stats */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Partner Info Card - Spans 1 column */}
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Partner Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Contact Person */}
                                {partner.contact_person && (
                                    <div className="flex items-start gap-3">
                                        <UserIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                Contact Person
                                            </p>
                                            <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                                                {partner.contact_person}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Phone */}
                                {partner.phone && (
                                    <div className="flex items-start gap-3">
                                        <PhoneIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                Phone Number
                                            </p>
                                            <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                                                {partner.phone}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                {partner.email && (
                                    <div className="flex items-start gap-3">
                                        <MailIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                Email Address
                                            </p>
                                            <p className="mt-0.5 truncate font-medium text-slate-900 dark:text-white">
                                                {partner.email}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* PromptPay ID */}
                                {partner.promptpay_id && (
                                    <div className="flex items-start gap-3">
                                        <WalletIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                PromptPay ID
                                            </p>
                                            <p className="mt-0.5 font-mono text-sm font-medium text-slate-900 dark:text-white">
                                                {partner.promptpay_id}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Commission Rate */}
                                {partner.default_commission_rate && (
                                    <div className="flex items-start gap-3">
                                        <TrendingUpIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                                Default Commission Rate
                                            </p>
                                            <p className="mt-0.5 text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {partner.default_commission_rate}%
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* QR Code Section */}
                                {qr_code && (
                                    <div className="border-t pt-4">
                                        <p className="mb-3 text-sm font-medium text-slate-900 dark:text-white">
                                            QR Code
                                        </p>
                                        <div className="flex flex-col items-center rounded-lg border bg-white p-4 dark:bg-slate-900">
                                            <img
                                                src={qr_code}
                                                alt={`QR Code for ${partner.name}`}
                                                className="size-48"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 w-full"
                                                onClick={handleDownloadQR}
                                            >
                                                <DownloadIcon className="mr-2 size-4" />
                                                Download QR Code
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Cards - Spans 2 columns */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Commission Statistics */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <StatCard
                                title="Total Paid"
                                value={formatCurrency(stats.total_paid)}
                                icon={BanknoteIcon}
                                variant="orange"
                                description="Commissions paid to this partner"
                            />
                            <StatCard
                                title="Total Received"
                                value={formatCurrency(stats.total_received)}
                                icon={WalletIcon}
                                variant="blue"
                                description="Commissions received from this partner"
                            />
                            <StatCard
                                title="Avg per Referral"
                                value={formatCurrency(
                                    stats.avg_commission_per_referral,
                                )}
                                icon={TrendingUpIcon}
                                variant="green"
                                description="Average commission value"
                            />
                            <StatCard
                                title="Pending Payments"
                                value={formatCurrency(stats.pending_payments)}
                                icon={BanknoteIcon}
                                variant="purple"
                                description="Outstanding commission payments"
                            />
                        </div>

                        {/* Referrals Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    All Referrals ({referrals.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {referrals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                            <TrendingUpIcon className="size-8 text-slate-400" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            No referrals yet
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            Referrals with this partner will
                                            appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-900">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                        Customer
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
                                                {referrals.map((referral) => (
                                                    <tr
                                                        key={referral.id}
                                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                                    >
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            {
                                                                referral.customer_name
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
                                                                {
                                                                    referral.status
                                                                }
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-500">
                                                            {formatDate(
                                                                referral.created_at,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
