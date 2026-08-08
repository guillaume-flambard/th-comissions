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

interface PartnerCreateProps {
    businessTypes?: string[];
    commissionStructures?: Record<string, string>;
    defaultCommissionRate?: number;
}

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
        title: 'Add Partner',
        href: '/admin/partners/create',
    },
];

/**
 * Partner Create Page - Comprehensive partner registration form
 *
 * Design Philosophy:
 * - Organized in logical sections (Basic Info, Contact, Payment, Commission)
 * - Clear field labels with helpful tooltips
 * - Inline validation with helpful error messages
 * - Mobile-friendly with large touch targets
 * - Progressive disclosure (required fields first, optional collapsed)
 *
 * UX Decisions:
 * - Required fields marked with asterisk
 * - Default commission rate pre-filled
 * - Thai and English error messages
 * - Cancel button to go back without saving
 */
export default function PartnerCreate({
    businessTypes = [],
    commissionStructures = {},
    defaultCommissionRate = 15,
}: PartnerCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        business_type: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: 'TH',
        website: '',
        promptpay_id: '',
        default_commission_rate: defaultCommissionRate,
        commission_structure: 'percentage',
        fixed_commission_amount: '',
        payment_method: 'promptpay',
        payment_currency: 'THB',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        notes: '',
        is_active: true,
    });

    /**
     * Business type options with proper snake_case values
     */
    const businessTypeOptions = [
        { value: 'dive_shop', label: 'Dive Shop' },
        { value: 'kite_school', label: 'Kite School' },
        { value: 'hostel', label: 'Hostel' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'tour_operator', label: 'Tour Operator' },
        { value: 'transfer_service', label: 'Transfer Service' },
    ];

    /**
     * Handle form submission
     */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post('/admin/partners', {
            onSuccess: () => {
                // Redirect handled by backend
            },
        });
    };

    /**
     * Handle cancel
     */
    const handleCancel = () => {
        router.visit('/admin/partners');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Partner" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        Add New Partner
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Create a new partner relationship to start tracking
                        commissions
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Business Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="business_name">
                                        Business Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="business_name"
                                        type="text"
                                        placeholder="e.g., Ocean Dive Center"
                                        value={data.business_name}
                                        onChange={(e) =>
                                            setData(
                                                'business_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={
                                            errors.business_name
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.business_name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.business_name}
                                        </p>
                                    )}
                                </div>

                                {/* Business Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="business_type">
                                        Business Type{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.business_type}
                                        onValueChange={(value) =>
                                            setData('business_type', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger
                                            id="business_type"
                                            className={
                                                errors.business_type
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Select business type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {businessTypeOptions.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.business_type && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.business_type}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="e.g., 123 Beach Road"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>

                                {/* City & Country */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            placeholder="e.g., Koh Tao"
                                            value={data.city}
                                            onChange={(e) =>
                                                setData('city', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Select
                                            value={data.country}
                                            onValueChange={(value) =>
                                                setData('country', value)
                                            }
                                        >
                                            <SelectTrigger id="country">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TH">
                                                    Thailand 🇹🇭
                                                </SelectItem>
                                                <SelectItem value="US">
                                                    United States 🇺🇸
                                                </SelectItem>
                                                <SelectItem value="GB">
                                                    United Kingdom 🇬🇧
                                                </SelectItem>
                                                <SelectItem value="AU">
                                                    Australia 🇦🇺
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Website */}
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="e.g., https://oceandive.com"
                                        value={data.website}
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                        className={
                                            errors.website
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.website}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Contact Person */}
                                <div className="space-y-2">
                                    <Label htmlFor="contact_name">
                                        Contact Person{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="contact_name"
                                        type="text"
                                        placeholder="e.g., John Smith"
                                        value={data.contact_name}
                                        onChange={(e) =>
                                            setData(
                                                'contact_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={
                                            errors.contact_name
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.contact_name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.contact_name}
                                        </p>
                                    )}
                                </div>

                                {/* Phone & Email */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Phone Number{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="e.g., +66 81-234-5678"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            required
                                            className={
                                                errors.phone
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="e.g., contact@oceandive.com"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            required
                                            className={
                                                errors.email
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Commission Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Commission Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Commission Structure */}
                                <div className="space-y-2">
                                    <Label htmlFor="commission_structure">
                                        Commission Structure{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.commission_structure}
                                        onValueChange={(value) =>
                                            setData('commission_structure', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger id="commission_structure">
                                            <SelectValue placeholder="Select commission structure" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">
                                                Percentage-based
                                            </SelectItem>
                                            <SelectItem value="fixed">
                                                Fixed amount
                                            </SelectItem>
                                            <SelectItem value="tiered">
                                                Tiered (volume-based)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.commission_structure && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.commission_structure}
                                        </p>
                                    )}
                                </div>

                                {/* Commission Rate (percentage) */}
                                {data.commission_structure === 'percentage' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="default_commission_rate">
                                            Default Commission Rate (%){' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="default_commission_rate"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={
                                                    data.default_commission_rate
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'default_commission_rate',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                required
                                                className={
                                                    errors.default_commission_rate
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            <span className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                                                %
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">
                                            Standard commission rate for
                                            referrals with this partner (0-100%)
                                        </p>
                                        {errors.default_commission_rate && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.default_commission_rate}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Fixed Commission Amount */}
                                {data.commission_structure === 'fixed' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="fixed_commission_amount">
                                            Fixed Commission Amount (฿){' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="fixed_commission_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 500"
                                            value={data.fixed_commission_amount}
                                            onChange={(e) =>
                                                setData(
                                                    'fixed_commission_amount',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className={
                                                errors.fixed_commission_amount
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        <p className="text-sm text-slate-500 dark:text-slate-500">
                                            Fixed amount paid per referral
                                        </p>
                                        {errors.fixed_commission_amount && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.fixed_commission_amount}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">
                                        Payment Method
                                    </Label>
                                    <Select
                                        value={data.payment_method}
                                        onValueChange={(value) =>
                                            setData('payment_method', value)
                                        }
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="promptpay">
                                                PromptPay
                                            </SelectItem>
                                            <SelectItem value="bank_transfer">
                                                Bank Transfer
                                            </SelectItem>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* PromptPay ID */}
                                {data.payment_method === 'promptpay' && (
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
                                )}

                                {/* Bank Details */}
                                {data.payment_method === 'bank_transfer' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_name">
                                                Bank Name
                                            </Label>
                                            <Input
                                                id="bank_name"
                                                type="text"
                                                placeholder="e.g., Bangkok Bank"
                                                value={data.bank_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'bank_name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_number">
                                                Account Number
                                            </Label>
                                            <Input
                                                id="bank_account_number"
                                                type="text"
                                                placeholder="e.g., 1234567890"
                                                value={data.bank_account_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'bank_account_number',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_name">
                                                Account Name
                                            </Label>
                                            <Input
                                                id="bank_account_name"
                                                type="text"
                                                placeholder="e.g., Ocean Dive Center Co., Ltd."
                                                value={data.bank_account_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'bank_account_name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Payment Currency */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_currency">
                                        Payment Currency
                                    </Label>
                                    <Select
                                        value={data.payment_currency}
                                        onValueChange={(value) =>
                                            setData('payment_currency', value)
                                        }
                                    >
                                        <SelectTrigger id="payment_currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="THB">
                                                THB (฿)
                                            </SelectItem>
                                            <SelectItem value="USD">
                                                USD ($)
                                            </SelectItem>
                                            <SelectItem value="EUR">
                                                EUR (€)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional information about this partner..."
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
                                {processing ? 'Saving...' : 'Save Partner'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
