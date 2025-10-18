import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Head, useForm } from '@inertiajs/react';
import {
    Calendar,
    DollarSign,
    Mail,
    Package,
    Phone,
    Users,
} from 'lucide-react';
import { FormEvent } from 'react';

interface Partner {
    id: number;
    business_name: string;
    business_type: string;
}

interface Props {
    partner?: Partner;
    utm_params?: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        ref?: string;
    };
}

export default function BookingCreate({ partner, utm_params }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_country: '',
        service_type: '',
        service_name: '',
        service_date: '',
        quantity: 1,
        amount: '',
        notes: '',
        utm_source: utm_params?.utm_source || '',
        utm_medium: utm_params?.utm_medium || '',
        utm_campaign: utm_params?.utm_campaign || '',
        ref: utm_params?.ref || '',
    });

    const serviceTypes = [
        { value: 'diving', label: 'Diving' },
        { value: 'tour', label: 'Tour' },
        { value: 'accommodation', label: 'Accommodation' },
        { value: 'transport', label: 'Transport' },
        { value: 'activities', label: 'Activities' },
        { value: 'other', label: 'Other' },
    ];

    const countries = [
        'US',
        'GB',
        'AU',
        'DE',
        'FR',
        'ES',
        'IT',
        'JP',
        'KR',
        'CN',
        'SG',
        'MY',
        'TH',
        'IN',
        'CA',
        'BR',
        'MX',
        'NL',
        'SE',
        'NO',
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('booking.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Reset form after successful submission
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Create Booking" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Create Your Booking
                        </h1>
                        {partner && (
                            <div className="mt-4 rounded-lg bg-blue-100 p-4 dark:bg-blue-900">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Referred by{' '}
                                    <strong>{partner.business_name}</strong>
                                </p>
                            </div>
                        )}
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            Fill out the form below to complete your booking
                        </p>
                    </div>

                    <Card className="border-0 shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            <CardTitle className="text-2xl">
                                Booking Details
                            </CardTitle>
                            <CardDescription className="text-white/80">
                                Please provide accurate information for your
                                booking
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Customer Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Customer Information
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="customer_name">
                                                Full Name{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="customer_name"
                                                type="text"
                                                value={data.customer_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'customer_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="John Doe"
                                                className="mt-1"
                                                required
                                            />
                                            {errors.customer_name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.customer_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="customer_country">
                                                Country{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={data.customer_country}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'customer_country',
                                                        value,
                                                    )
                                                }
                                                required
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map(
                                                        (country) => (
                                                            <SelectItem
                                                                key={country}
                                                                value={country}
                                                            >
                                                                {country}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_country && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.customer_country}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="customer_email">
                                                Email{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative mt-1">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="customer_email"
                                                    type="email"
                                                    value={data.customer_email}
                                                    onChange={(e) =>
                                                        setData(
                                                            'customer_email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="john@example.com"
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {errors.customer_email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.customer_email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="customer_phone">
                                                Phone
                                            </Label>
                                            <div className="relative mt-1">
                                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="customer_phone"
                                                    type="tel"
                                                    value={data.customer_phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'customer_phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="+66 XX XXX XXXX"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.customer_phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Service Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Package className="h-5 w-5 text-purple-500" />
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Service Details
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="service_type">
                                                Service Type{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={data.service_type}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'service_type',
                                                        value,
                                                    )
                                                }
                                                required
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select service type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {serviceTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
                                                                value={
                                                                    type.value
                                                                }
                                                            >
                                                                {type.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.service_type && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.service_type}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="service_name">
                                                Service Name{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="service_name"
                                                type="text"
                                                value={data.service_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'service_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g., Open Water Course"
                                                className="mt-1"
                                                required
                                            />
                                            {errors.service_name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.service_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="service_date">
                                                Service Date{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative mt-1">
                                                <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="service_date"
                                                    type="date"
                                                    value={data.service_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            'service_date',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pl-10"
                                                    required
                                                    min={
                                                        new Date()
                                                            .toISOString()
                                                            .split('T')[0]
                                                    }
                                                />
                                            </div>
                                            {errors.service_date && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.service_date}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="quantity">
                                                Quantity{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        'quantity',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                min="1"
                                                className="mt-1"
                                                required
                                            />
                                            {errors.quantity && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.quantity}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="amount">
                                                Total Amount (THB){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative mt-1">
                                                <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    value={data.amount}
                                                    onChange={(e) =>
                                                        setData(
                                                            'amount',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {errors.amount && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">
                                        Additional Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        placeholder="Any special requests or additional information..."
                                        rows={4}
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 px-8"
                                    >
                                        {processing
                                            ? 'Creating Booking...'
                                            : 'Create Booking'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info Box */}
                    <div className="mt-8 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                            What happens next?
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                You will receive a confirmation email with your
                                booking reference
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Our team will review and confirm your booking
                                within 24 hours
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Payment instructions will be sent via email
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
