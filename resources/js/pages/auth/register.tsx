import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AuthPremiumLayout from '@/layouts/auth/auth-premium-layout';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';

// Animation variants
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

const businessTypes = [
    { value: 'dive_shop', label: 'Dive Shop' },
    { value: 'kite_school', label: 'Kite School' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'tour_operator', label: 'Tour Operator' },
    { value: 'transfer_service', label: 'Transfer Service' },
    { value: 'restaurant', label: 'Restaurant / Bar' },
    { value: 'other', label: 'Other Tourism Business' },
];

export default function Register() {
    const [businessType, setBusinessType] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Simple password strength calculator
    const calculatePasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-slate-200';
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-orange-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength === 2) return 'Fair';
        if (passwordStrength === 3) return 'Good';
        return 'Strong';
    };

    return (
        <AuthPremiumLayout
            title="Create your account"
            description="Start tracking commissions automatically in 5 minutes"
        >
            <Head title="Register" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-6"
                    >
                        {/* Personal Information */}
                        <motion.div className="space-y-4" variants={fadeUp}>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Full name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="h-12 text-base"
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError message={errors.name} />
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    className="h-12 text-base"
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError message={errors.email} />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Business Information */}
                        <motion.div className="space-y-4" variants={fadeUp}>
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                                <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                    Help us personalize your experience
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="business_type"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Business type
                                </Label>
                                <Select
                                    name="business_type"
                                    value={businessType}
                                    onValueChange={setBusinessType}
                                >
                                    <SelectTrigger
                                        id="business_type"
                                        className="h-12 text-base"
                                        aria-invalid={
                                            !!(errors as any).business_type
                                        }
                                    >
                                        <SelectValue placeholder="Select your business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businessTypes.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(errors as any).business_type && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError
                                            message={
                                                (errors as any).business_type
                                            }
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Password Fields */}
                        <motion.div className="space-y-4" variants={fadeUp}>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    className="h-12 text-base"
                                    aria-invalid={!!errors.password}
                                    onChange={(e) =>
                                        calculatePasswordStrength(
                                            e.target.value,
                                        )
                                    }
                                />
                                {/* Password strength indicator */}
                                {passwordStrength > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        className="space-y-1"
                                    >
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                                        level <= passwordStrength
                                                            ? getStrengthColor()
                                                            : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Password strength:{' '}
                                            <span
                                                className={`font-medium ${
                                                    passwordStrength <= 1
                                                        ? 'text-red-600'
                                                        : passwordStrength === 2
                                                          ? 'text-orange-600'
                                                          : passwordStrength ===
                                                              3
                                                            ? 'text-yellow-600'
                                                            : 'text-green-600'
                                                }`}
                                            >
                                                {getStrengthLabel()}
                                            </span>
                                        </p>
                                    </motion.div>
                                )}
                                {errors.password && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError message={errors.password} />
                                    </motion.div>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    At least 8 characters with uppercase,
                                    lowercase, and numbers
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Re-enter your password"
                                    className="h-12 text-base"
                                    aria-invalid={
                                        !!errors.password_confirmation
                                    }
                                />
                                {errors.password_confirmation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Terms & Privacy */}
                        <motion.div
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                            variants={fadeUp}
                        >
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                By creating an account, you agree to our{' '}
                                <a
                                    href="/terms"
                                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a
                                    href="/privacy"
                                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Privacy Policy
                                </a>
                                . We respect your data under Thailand's PDPA
                                regulations.
                            </p>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={fadeUp}>
                            <Button
                                type="submit"
                                className="h-12 w-full text-base font-semibold shadow-sm"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: 'linear',
                                            }}
                                        >
                                            <Spinner />
                                        </motion.div>
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="size-5" />
                                        <span>Create free account</span>
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        {/* Divider */}
                        <motion.div className="relative" variants={fadeUp}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                    Already have an account?
                                </span>
                            </div>
                        </motion.div>

                        {/* Login Link */}
                        <motion.div className="text-center" variants={fadeUp}>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <TextLink
                                    href={login()}
                                    tabIndex={6}
                                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Sign in to your account
                                </TextLink>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </Form>
        </AuthPremiumLayout>
    );
}
