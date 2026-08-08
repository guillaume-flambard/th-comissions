import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { Form, Head } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle2, KeyRound, Lock } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { useState } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

// Animation variants
const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4 },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
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
        <AuthSimpleLayout
            title="Reset your password"
            description="Choose a strong password to secure your account"
        >
            <Head title="Reset password" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="space-y-6"
            >
                {/* Lock Icon Illustration */}
                <motion.div
                    className="flex justify-center"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30">
                        <KeyRound className="size-10 text-blue-600 dark:text-blue-400" />
                    </div>
                </motion.div>

                <Form
                    {...NewPasswordController.store.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                >
                    {({ processing, errors }) => (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="space-y-6"
                        >
                            {/* Password Requirements */}
                            <motion.div
                                className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20"
                                variants={fadeUp}
                            >
                                <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                                    Password requirements:
                                </h4>
                                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                                        <span>At least 8 characters</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                                        <span>
                                            Mix of uppercase and lowercase
                                            letters
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                                        <span>At least one number</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                                        <span>
                                            Special character recommended
                                        </span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Email Field (Read-only) */}
                            <motion.div className="space-y-2" variants={fadeUp}>
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    readOnly
                                    className="h-12 cursor-not-allowed bg-slate-50 text-base dark:bg-slate-900"
                                />
                                {errors.email && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <InputError message={errors.email} />
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* New Password Field */}
                            <motion.div className="space-y-2" variants={fadeUp}>
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    New password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        autoFocus
                                        placeholder="Create a strong password"
                                        className="h-12 pl-10 text-base"
                                        aria-invalid={!!errors.password}
                                        onChange={(e) =>
                                            calculatePasswordStrength(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
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
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div className="space-y-2" variants={fadeUp}>
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Confirm new password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        placeholder="Re-enter your new password"
                                        className="h-12 pl-10 text-base"
                                        aria-invalid={
                                            !!errors.password_confirmation
                                        }
                                    />
                                </div>
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
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div variants={fadeUp}>
                                <Button
                                    type="submit"
                                    className="h-12 w-full text-base font-semibold shadow-sm"
                                    disabled={processing}
                                    data-test="reset-password-button"
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
                                            <span>Resetting password...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-5" />
                                            <span>Reset password</span>
                                        </>
                                    )}
                                </Button>
                            </motion.div>

                            {/* Security Note */}
                            <motion.div
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                                variants={fadeUp}
                            >
                                <p className="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                    After resetting your password, you'll be
                                    signed in automatically. For security, we
                                    recommend signing out of any other devices.
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </Form>
            </motion.div>
        </AuthSimpleLayout>
    );
}
