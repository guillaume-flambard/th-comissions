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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, DollarSignIcon, UserIcon } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

/**
 * Partner type for selection
 */
interface Partner {
    id: number;
    business_name: string;
    business_type: string;
    default_commission_rate: number;
}

/**
 * Create Referral Page Props
 */
interface CreateReferralProps {
    partners: Partner[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Referrals', href: '/referrals' },
    { title: 'Create', href: '/referrals/create' },
];

const SERVICE_TYPES = [
    { value: 'diving', label: 'Diving Course' },
    { value: 'kite_lesson', label: 'Kite Lesson' },
    { value: 'transfer', label: 'Transfer Service' },
    { value: 'tour', label: 'Tour Package' },
    { value: 'accommodation', label: 'Accommodation' },
];

/**
 * Create Referral Page
 *
 * Allows users to manually log a referral when tracking links weren't used.
 * This is essential for offline bookings or when customers book directly.
 */
export default function CreateReferral({ partners }: CreateReferralProps) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_type: '',
        service_amount: '',
        referring_partner_id: '',
        receiving_partner_id: '',
        booking_date: new Date().toISOString().split('T')[0],
        service_date: '',
        service_description: '',
        commission_rate: '',
        notes: '',
    });

    const [calculatedCommission, setCalculatedCommission] = useState(0);

    /**
     * Calculate commission preview when service amount or commission rate changes
     */
    useEffect(() => {
        const amount = parseFloat(data.service_amount) || 0;
        const rate = parseFloat(data.commission_rate) || 0;
        setCalculatedCommission((amount * rate) / 100);
    }, [data.service_amount, data.commission_rate]);

    /**
     * When referring partner changes, auto-populate their commission rate
     */
    useEffect(() => {
        if (data.referring_partner_id) {
            const partner = partners.find(
                (p) => p.id.toString() === data.referring_partner_id,
            );
            if (partner && !data.commission_rate) {
                setData('commission_rate', partner.default_commission_rate.toString());
            }
        }
    }, [data.referring_partner_id]);

    /**
     * Handle form submission
     */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/referrals', {
            onSuccess: () => {
                // Will redirect to referrals index on success
            },
        });
    };

    /**
     * Get partner display name
     */
    const getPartnerDisplay = (partner: Partner) => {
        return `${partner.business_name} (${partner.business_type.replace('_', ' ')})`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Referral" />

            <div className="mx-auto max-w-4xl space-y-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Referral
                        </h1>
                        <p className="text-muted-foreground">
                            Manually log a referral for commission tracking
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href="/referrals">
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Back to Referrals
                        </a>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="size-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">
                                        Customer Name *
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        value={data.customer_name}
                                        onChange={(e) =>
                                            setData('customer_name', e.target.value)
                                        }
                                        placeholder="John Doe"
                                        required
                                    />
                                    {errors.customer_name && (
                                        <p className="text-sm text-destructive">
                                            {errors.customer_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_email">Email</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={data.customer_email}
                                        onChange={(e) =>
                                            setData('customer_email', e.target.value)
                                        }
                                        placeholder="john@example.com"
                                    />
                                    {errors.customer_email && (
                                        <p className="text-sm text-destructive">
                                            {errors.customer_email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Phone</Label>
                                    <Input
                                        id="customer_phone"
                                        value={data.customer_phone}
                                        onChange={(e) =>
                                            setData('customer_phone', e.target.value)
                                        }
                                        placeholder="+66 XX XXX XXXX"
                                    />
                                    {errors.customer_phone && (
                                        <p className="text-sm text-destructive">
                                            {errors.customer_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Partner Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="referring_partner_id">
                                        Referring Partner (Who sent) *
                                    </Label>
                                    <Select
                                        value={data.referring_partner_id}
                                        onValueChange={(value) =>
                                            setData('referring_partner_id', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select referring partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partners.map((partner) => (
                                                <SelectItem
                                                    key={partner.id}
                                                    value={partner.id.toString()}
                                                >
                                                    {getPartnerDisplay(partner)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.referring_partner_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.referring_partner_id}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        The partner who referred this customer
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="receiving_partner_id">
                                        Receiving Partner (Who received) *
                                    </Label>
                                    <Select
                                        value={data.receiving_partner_id}
                                        onValueChange={(value) =>
                                            setData('receiving_partner_id', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select receiving partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partners.map((partner) => (
                                                <SelectItem
                                                    key={partner.id}
                                                    value={partner.id.toString()}
                                                >
                                                    {getPartnerDisplay(partner)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.receiving_partner_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.receiving_partner_id}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        The partner who provided the service
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="size-5" />
                                Service Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="service_type">Service Type *</Label>
                                    <Select
                                        value={data.service_type}
                                        onValueChange={(value) =>
                                            setData('service_type', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SERVICE_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.service_type && (
                                        <p className="text-sm text-destructive">
                                            {errors.service_type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_amount">
                                        Service Amount (THB) *
                                    </Label>
                                    <Input
                                        id="service_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.service_amount}
                                        onChange={(e) =>
                                            setData('service_amount', e.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.service_amount && (
                                        <p className="text-sm text-destructive">
                                            {errors.service_amount}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="booking_date">Booking Date *</Label>
                                    <Input
                                        id="booking_date"
                                        type="date"
                                        value={data.booking_date}
                                        onChange={(e) =>
                                            setData('booking_date', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.booking_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.booking_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_date">
                                        Service Date (Optional)
                                    </Label>
                                    <Input
                                        id="service_date"
                                        type="date"
                                        value={data.service_date}
                                        onChange={(e) =>
                                            setData('service_date', e.target.value)
                                        }
                                    />
                                    {errors.service_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.service_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="service_description">
                                        Service Description
                                    </Label>
                                    <Textarea
                                        id="service_description"
                                        value={data.service_description}
                                        onChange={(e) =>
                                            setData('service_description', e.target.value)
                                        }
                                        placeholder="Additional details about the service..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Commission Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSignIcon className="size-5" />
                                Commission Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="commission_rate">
                                        Commission Rate (%)
                                    </Label>
                                    <Input
                                        id="commission_rate"
                                        type="number"
                                        step="0.01"
                                        value={data.commission_rate}
                                        onChange={(e) =>
                                            setData('commission_rate', e.target.value)
                                        }
                                        placeholder="10.00"
                                    />
                                    {errors.commission_rate && (
                                        <p className="text-sm text-destructive">
                                            {errors.commission_rate}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Auto-populated from referring partner's default
                                        rate
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Calculated Commission</Label>
                                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                        ฿{calculatedCommission.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {data.service_amount && data.commission_rate
                                            ? `${data.service_amount} × ${data.commission_rate}%`
                                            : 'Enter service amount and rate'}
                                    </p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes or special conditions..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" asChild>
                            <a href="/referrals">Cancel</a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Referral'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
