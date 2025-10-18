import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import {
    EditIcon,
    MoreVerticalIcon,
    QrCodeIcon,
    TrashIcon,
    TrendingUpIcon,
} from 'lucide-react';

/**
 * Partner data structure
 */
export interface Partner {
    id: number;
    name: string;
    type: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    promptpay_id?: string;
    commission_rate: number;
    total_commission_paid: number;
    total_commission_received: number;
    referral_count: number;
    status: 'active' | 'inactive';
    created_at: string;
}

interface PartnerCardProps {
    /**
     * Partner data to display
     */
    partner: Partner;

    /**
     * View mode: grid or list
     */
    viewMode?: 'grid' | 'list';

    /**
     * Callback when edit is clicked
     */
    onEdit?: (partner: Partner) => void;

    /**
     * Callback when delete is clicked
     */
    onDelete?: (partner: Partner) => void;

    /**
     * Callback when generate QR is clicked
     */
    onGenerateQR?: (partner: Partner) => void;
}

/**
 * PartnerCard - Displays partner information in a beautiful card format
 *
 * Design decisions:
 * - Supports both grid and list views
 * - Quick action dropdown menu for common tasks
 * - Color-coded business type badges
 * - Prominent commission statistics
 * - Hover effects for better interactivity
 */
export function PartnerCard({
    partner,
    viewMode = 'grid',
    onEdit,
    onDelete,
    onGenerateQR,
}: PartnerCardProps) {
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
     * Get business type color variant
     */
    const getBusinessTypeVariant = (
        type: string,
    ): 'default' | 'secondary' | 'outline' => {
        const typeMap: Record<string, 'default' | 'secondary' | 'outline'> = {
            'dive shop': 'default',
            'kite school': 'secondary',
            hostel: 'outline',
            hotel: 'outline',
            'tour operator': 'secondary',
            'transfer service': 'secondary',
        };
        return typeMap[type.toLowerCase()] || 'outline';
    };

    /**
     * Handle view partner details
     */
    const handleViewDetails = () => {
        router.visit(`/partners/${partner.id}`);
    };

    /**
     * Handle edit partner
     */
    const handleEdit = () => {
        if (onEdit) {
            onEdit(partner);
        } else {
            router.visit(`/partners/${partner.id}/edit`);
        }
    };

    /**
     * Handle generate QR code
     */
    const handleGenerateQR = () => {
        if (onGenerateQR) {
            onGenerateQR(partner);
        } else {
            router.visit(`/qr-codes/generate?partner_id=${partner.id}`);
        }
    };

    /**
     * Handle delete partner
     */
    const handleDelete = () => {
        if (onDelete) {
            onDelete(partner);
        }
    };

    // Grid view layout
    if (viewMode === 'grid') {
        return (
            <Card className="group transition-all duration-200 hover:shadow-lg">
                <CardContent className="pt-6">
                    {/* Header with name and actions */}
                    <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                            <h3
                                className="cursor-pointer truncate text-lg font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                onClick={handleViewDetails}
                            >
                                {partner.name}
                            </h3>
                            <Badge
                                variant={getBusinessTypeVariant(partner.type)}
                                className="mt-2"
                            >
                                {partner.type}
                            </Badge>
                        </div>

                        {/* Actions dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <MoreVerticalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleViewDetails}>
                                    <TrendingUpIcon className="mr-2 size-4" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleGenerateQR}>
                                    <QrCodeIcon className="mr-2 size-4" />
                                    Generate QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <EditIcon className="mr-2 size-4" />
                                    Edit Partner
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

                    {/* Contact info */}
                    {partner.contact_person && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                            {partner.contact_person}
                        </p>
                    )}

                    {/* Commission stats */}
                    <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Commission Rate
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {partner.commission_rate}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Referrals
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {partner.referral_count}
                            </p>
                        </div>
                    </div>

                    {/* Total commissions */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Total Commission
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(
                                partner.total_commission_paid +
                                    partner.total_commission_received,
                            )}
                        </span>
                    </div>

                    {/* Quick actions */}
                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleViewDetails}
                        >
                            View Details
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={handleGenerateQR}
                        >
                            <QrCodeIcon className="mr-1 size-4" />
                            QR Code
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // List view layout
    return (
        <Card className="group transition-all duration-200 hover:shadow-md">
            <CardContent className="py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: Partner info */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3
                                    className="cursor-pointer truncate text-lg font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                    onClick={handleViewDetails}
                                >
                                    {partner.name}
                                </h3>
                                <Badge
                                    variant={getBusinessTypeVariant(
                                        partner.type,
                                    )}
                                >
                                    {partner.type}
                                </Badge>
                            </div>
                            {partner.contact_person && (
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    {partner.contact_person}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Center: Stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Commission Rate
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {partner.commission_rate}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Referrals
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {partner.referral_count}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Total Commission
                            </p>
                            <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                    partner.total_commission_paid +
                                        partner.total_commission_received,
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewDetails}
                        >
                            View Details
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleGenerateQR}
                        >
                            <QrCodeIcon className="mr-1 size-4" />
                            QR Code
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVerticalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEdit}>
                                    <EditIcon className="mr-2 size-4" />
                                    Edit Partner
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
            </CardContent>
        </Card>
    );
}
