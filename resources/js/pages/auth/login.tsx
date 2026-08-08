import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthPremiumLayout from '@/layouts/auth/auth-premium-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

// Animation variants
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthPremiumLayout
            title="Welcome back"
            description="Enter your credentials to access your account"
        >
            <Head title="Log in" />

            {/* Status message */}
            {status && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20"
                >
                    <p className="text-center text-sm font-medium text-green-800 dark:text-green-300">
                        {status}
                    </p>
                </motion.div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-6"
                    >
                        {/* Email Field */}
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
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="h-12 text-base"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <InputError message={errors.email} />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Password Field */}
                        <motion.div className="space-y-2" variants={fadeUp}>
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="h-12 text-base"
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <InputError message={errors.password} />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Remember Me */}
                        <motion.div
                            className="flex items-center gap-3"
                            variants={fadeUp}
                        >
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Remember me for 30 days
                            </Label>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={fadeUp}>
                            <Button
                                type="submit"
                                className="h-12 w-full text-base font-semibold shadow-sm"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
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
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </motion.div>

                        {/* General Error Message */}
                        {(errors as any).general && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20"
                            >
                                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    {(errors as any).general}
                                </p>
                            </motion.div>
                        )}

                        {/* Divider */}
                        <motion.div
                            className="relative"
                            variants={fadeUp}
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                    New to Trackly?
                                </span>
                            </div>
                        </motion.div>

                        {/* Sign Up Link */}
                        <motion.div
                            className="text-center"
                            variants={fadeUp}
                        >
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Create a free account
                                </TextLink>
                            </p>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Start tracking commissions in 5 minutes
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </Form>
        </AuthPremiumLayout>
    );
}
