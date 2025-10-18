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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { InfoIcon, SaveIcon, XIcon } from 'lucide-react';
import { type FormEvent } from 'react';

/**
 * Business types available
 */
const BUSINESS_TYPES = [
    'Dive Shop',
    'Kite School',
    'Hostel',
    'Hotel',
    'Tour Operator',
    'Transfer Service',
];

/**
 * Partner Edit page props
 */
interface PartnerEditProps {
    partner: Partner & {
        email?: string;
        phone?: string;
        promptpay_id?: string;
    };
}

/**
 * Partner Edit Page - Edit existing partner
 *
 * Design Philosophy:
 * - Same layout as create form for consistency
 * - Pre-filled with existing partner data
 * - Clear validation and error messages
 * - Easy navigation back to partner details
 *
 * UX Decisions:
 * - All fields pre-populated with current values
 * - Save button updates the partner
 * - Cancel returns to partner detail page
 */
export default function PartnerEdit({ partner }: PartnerEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Partners',
            href: '/partners',
        },
        {
            title: partner.name,
            href: `/partners/${partner.id}`,
        },
        {
            title: 'Edit',
            href: `/partners/${partner.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: partner.name || '',
        type: partner.type || '',
        contact_person: partner.contact_person || '',
        phone: partner.phone || '',
        email: partner.email || '',
        promptpay_id: partner.promptpay_id || '',
        commission_rate: partner.commission_rate || 15,
    });

    /**
     * Handle form submission
     */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(`/partners/${partner.id}`, {
            onSuccess: () => {
                // Redirect handled by backend
            },
        });
    };

    /**
     * Handle cancel
     */
    const handleCancel = () => {
        router.visit(`/partners/${partner.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${partner.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        Edit Partner
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Update partner information and commission settings
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mx-auto max-w-3xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Partner Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Business Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Business Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., Ocean Dive Center"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                        className={
                                            errors.name ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Business Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Business Type{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger
                                            id="type"
                                            className={
                                                errors.type
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Select business type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUSINESS_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Person */}
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">
                                        Contact Person
                                    </Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        placeholder="e.g., John Smith"
                                        value={data.contact_person}
                                        onChange={(e) =>
                                            setData(
                                                'contact_person',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone Number{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="e.g., 081-234-5678"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        required
                                        className={
                                            errors.phone ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g., contact@oceandive.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className={
                                            errors.email ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* PromptPay ID */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="promptpay_id"
                                        className="flex items-center gap-1.5"
                                    >
                                        PromptPay ID
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <InfoIcon className="size-4 cursor-help text-slate-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Thai mobile number or
                                                    national ID linked to
                                                    PromptPay for commission
                                                    payments
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        id="promptpay_id"
                                        type="text"
                                        placeholder="e.g., 0812345678"
                                        value={data.promptpay_id}
                                        onChange={(e) =>
                                            setData(
                                                'promptpay_id',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            errors.promptpay_id
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.promptpay_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.promptpay_id}
                                        </p>
                                    )}
                                </div>

                                {/* Commission Rate */}
                                <div className="space-y-2">
                                    <Label htmlFor="commission_rate">
                                        Default Commission Rate (%){' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="commission_rate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={data.commission_rate}
                                            onChange={(e) =>
                                                setData(
                                                    'commission_rate',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                            required
                                            className={
                                                errors.commission_rate
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        <span className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                                            %
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                        Standard commission rate for referrals
                                        with this partner (0-100%)
                                    </p>
                                    {errors.commission_rate && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.commission_rate}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                <XIcon className="mr-2 size-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2"
                            >
                                <SaveIcon className="size-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
