import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Mail, Send } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';

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

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthSimpleLayout
            title="Forgot password?"
            description="No worries! Enter your email and we'll send you reset instructions"
        >
            <Head title="Forgot password" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="space-y-6"
            >
                {/* Success Message */}
                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-950/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <Send className="size-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-green-900 dark:text-green-100">
                                    Check your email
                                </h3>
                                <p className="text-sm leading-relaxed text-green-800 dark:text-green-300">
                                    {status}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Email Icon Illustration */}
                <motion.div
                    className="flex justify-center"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30">
                        <Mail className="size-10 text-blue-600 dark:text-blue-400" />
                    </div>
                </motion.div>

                <Form {...PasswordResetLinkController.store.form()}>
                    {({ processing, errors }) => (
                        <motion.div
                            className="space-y-6"
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            {/* Instructions */}
                            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    Enter the email address associated with your
                                    account and we'll send you a link to reset
                                    your password.
                                </p>
                            </div>

                            {/* Email Field */}
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
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="h-12 w-full text-base font-semibold shadow-sm"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
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
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-5" />
                                        <span>Send reset link</span>
                                    </>
                                )}
                            </Button>

                            {/* Back to Login */}
                            <div className="text-center">
                                <TextLink
                                    href={login()}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    <ArrowLeft className="size-4" />
                                    <span>Back to login</span>
                                </TextLink>
                            </div>
                        </motion.div>
                    )}
                </Form>

                {/* Help Text */}
                <motion.div
                    className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        Can't access your email?{' '}
                        <a
                            href="mailto:support@trackly.com"
                            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Contact support
                        </a>{' '}
                        for help recovering your account.
                    </p>
                </motion.div>
            </motion.div>
        </AuthSimpleLayout>
    );
}
