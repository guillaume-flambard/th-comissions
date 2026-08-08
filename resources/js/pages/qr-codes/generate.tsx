import { type Partner } from '@/components/partner-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CopyIcon, DownloadIcon, MailIcon, QrCodeIcon } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

/**
 * QR Code Generation page props
 */
interface QRCodeGenerateProps {
    /**
     * List of all partners to choose from
     */
    partners: Partner[];

    /**
     * Pre-selected partner ID (from query param)
     */
    partner_id?: number;

    /**
     * Generated QR code data URL
     */
    qr_code?: string;

    /**
     * QR code URL/link
     */
    qr_link?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Generate QR Code',
        href: '/qr-codes/generate',
    },
];

/**
 * QR size options
 */
const QR_SIZES = [
    { label: 'Small (256px)', value: '256' },
    { label: 'Medium (512px)', value: '512' },
    { label: 'Large (1024px)', value: '1024' },
];

/**
 * QR format options
 */
const QR_FORMATS = [
    { label: 'PNG Image', value: 'png' },
    { label: 'PDF Document', value: 'pdf' },
    { label: 'SVG Vector', value: 'svg' },
];

/**
 * QR Code Generation Page - Generate new QR codes for partners
 *
 * Design Philosophy:
 * - Simple, focused interface for QR code creation
 * - Large preview of generated QR code
 * - Easy customization options
 * - Multiple download and share options
 * - Clear campaign tracking with UTM parameters
 *
 * UX Decisions:
 * - Partner selection prominently placed
 * - Live preview updates as options change
 * - Size and format options for different use cases
 * - Campaign name for UTM tracking
 * - Download, copy link, and email share options
 * - Regenerate button for creating new codes
 */
export default function QRCodeGenerate({
    partners = [],
    partner_id,
    qr_code,
    qr_link,
}: QRCodeGenerateProps) {
    const { data, setData, post, processing } = useForm({
        partner_id: partner_id?.toString() || '',
        size: '512',
        format: 'png',
        campaign_name: '',
    });

    const [copied, setCopied] = useState(false);

    // Find selected partner
    const selectedPartner = partners.find(
        (p) => p.id.toString() === data.partner_id,
    );

    /**
     * Sync QR code and link from props (updated after generation)
     */
    useEffect(() => {
        // Props are automatically updated by Inertia after form submission
    }, [qr_code, qr_link]);

    /**
     * Handle form submission to generate QR code
     */
    const handleGenerate = (e: FormEvent) => {
        e.preventDefault();
        post('/qr-codes/generate');
    };

    /**
     * Handle download QR code
     */
    const handleDownload = () => {
        if (!qr_code || !selectedPartner) return;

        const link = document.createElement('a');
        link.href = qr_code;
        link.download = `${selectedPartner.name.replace(/\s+/g, '-')}-QR-${data.size}.${data.format}`;
        link.click();
    };

    /**
     * Handle copy link to clipboard
     */
    const handleCopyLink = async () => {
        if (!qr_link) return;

        try {
            await navigator.clipboard.writeText(qr_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    /**
     * Handle email share
     */
    const handleEmailShare = () => {
        if (!qr_link || !selectedPartner) return;

        const subject = encodeURIComponent(
            `Referral Link for ${selectedPartner.name}`,
        );
        const body = encodeURIComponent(
            `Hi,\n\nHere's your referral tracking link for ${selectedPartner.name}:\n\n${qr_link}\n\nShare this with customers to track commissions automatically.\n\nBest regards,\nTrackly`,
        );

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    /**
     * Auto-generate QR code when partner is pre-selected
     */
    useEffect(() => {
        if (partner_id && !qr_code) {
            // Auto-submit form to generate QR
            handleGenerate(new Event('submit') as any);
        }
    }, [partner_id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate QR Code" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        Generate QR Code
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Create a trackable QR code for your partner referrals
                    </p>
                </div>

                <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
                    {/* Left Column: Configuration Form */}
                    <div>
                        <form onSubmit={handleGenerate}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>QR Code Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Partner Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="partner_id">
                                            Select Partner{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.partner_id.toString()}
                                            onValueChange={(value) =>
                                                setData(
                                                    'partner_id',
                                                    value,
                                                )
                                            }
                                            required
                                        >
                                            <SelectTrigger id="partner_id">
                                                <SelectValue placeholder="Choose a partner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {partners.map((partner) => (
                                                    <SelectItem
                                                        key={partner.id}
                                                        value={partner.id.toString()}
                                                    >
                                                        {partner.name} (
                                                        {partner.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">
                                            QR code will track referrals from
                                            this partner
                                        </p>
                                    </div>

                                    {/* Campaign Name (UTM) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="campaign_name">
                                            Campaign Name (Optional)
                                        </Label>
                                        <Input
                                            id="campaign_name"
                                            type="text"
                                            placeholder="e.g., Summer-2025"
                                            value={data.campaign_name}
                                            onChange={(e) =>
                                                setData(
                                                    'campaign_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <p className="text-sm text-slate-500 dark:text-slate-500">
                                            Add a campaign identifier for
                                            tracking different promotions
                                        </p>
                                    </div>

                                    {/* QR Size */}
                                    <div className="space-y-2">
                                        <Label htmlFor="size">
                                            QR Code Size
                                        </Label>
                                        <Select
                                            value={data.size}
                                            onValueChange={(value) =>
                                                setData('size', value)
                                            }
                                        >
                                            <SelectTrigger id="size">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {QR_SIZES.map((size) => (
                                                    <SelectItem
                                                        key={size.value}
                                                        value={size.value}
                                                    >
                                                        {size.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* QR Format */}
                                    <div className="space-y-2">
                                        <Label htmlFor="format">
                                            File Format
                                        </Label>
                                        <Select
                                            value={data.format}
                                            onValueChange={(value) =>
                                                setData('format', value)
                                            }
                                        >
                                            <SelectTrigger id="format">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {QR_FORMATS.map((format) => (
                                                    <SelectItem
                                                        key={format.value}
                                                        value={format.value}
                                                    >
                                                        {format.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Generate Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={
                                            processing || !data.partner_id
                                        }
                                    >
                                        <QrCodeIcon className="mr-2 size-5" />
                                        {processing
                                            ? 'Generating...'
                                            : qr_code
                                              ? 'Regenerate QR Code'
                                              : 'Generate QR Code'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Right Column: QR Code Preview and Actions */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>
                                    {qr_code ? 'Your QR Code' : 'Preview'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {qr_code && selectedPartner ? (
                                    <div className="space-y-6">
                                        {/* QR Code Preview */}
                                        <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                                            <img
                                                src={qr_code}
                                                alt={`QR Code for ${selectedPartner.name}`}
                                                className="size-64 rounded-lg"
                                            />
                                            <p className="mt-4 text-center text-sm font-medium text-slate-900 dark:text-white">
                                                {selectedPartner.name}
                                            </p>
                                            {data.campaign_name && (
                                                <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-500">
                                                    Campaign:{' '}
                                                    {data.campaign_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Link Display */}
                                        {qr_link && (
                                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                                <Label className="mb-2 block text-xs">
                                                    Tracking Link
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={qr_link}
                                                        readOnly
                                                        className="bg-white dark:bg-slate-950"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleCopyLink}
                                                    >
                                                        <CopyIcon className="size-4" />
                                                    </Button>
                                                </div>
                                                {copied && (
                                                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                        Link copied to
                                                        clipboard!
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Button
                                                variant="default"
                                                onClick={handleDownload}
                                                className="w-full"
                                            >
                                                <DownloadIcon className="mr-2 size-4" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleEmailShare}
                                                className="w-full"
                                            >
                                                <MailIcon className="mr-2 size-4" />
                                                Email Link
                                            </Button>
                                        </div>

                                        {/* Info Box */}
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                                                How to use this QR code
                                            </h4>
                                            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                                                <li>
                                                    • Share with{' '}
                                                    {selectedPartner.name} to
                                                    display at their location
                                                </li>
                                                <li>
                                                    • Customers scan to book and
                                                    get tracked automatically
                                                </li>
                                                <li>
                                                    • Commissions are calculated
                                                    based on
                                                    {
                                                        selectedPartner.commission_rate
                                                    }
                                                    % rate
                                                </li>
                                                <li>
                                                    • Track all referrals in the
                                                    Referrals page
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    // Empty state
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-slate-100 p-6 dark:bg-slate-800">
                                            <QrCodeIcon className="size-16 text-slate-400" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            No QR Code Generated
                                        </h3>
                                        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                                            Select a partner and click "Generate
                                            QR Code" to create a trackable
                                            referral link
                                        </p>
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
