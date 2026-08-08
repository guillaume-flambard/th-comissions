import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle2, Clock, LogOut, Mail, Send as SendIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const pulse: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export default function VerifyEmail({ status }: { status?: string }) {
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            setCountdown(60);
            setCanResend(false);
        }
    }, [status]);

    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    return (
        <AuthSimpleLayout
            title="Verify your email"
            description="We've sent a verification link to your email address"
        >
            <Head title="Email verification" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="space-y-6"
            >
                {/* Success Message */}
                {status === 'verification-link-sent' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-950/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-green-900 dark:text-green-100">
                                    Email sent successfully
                                </h3>
                                <p className="text-sm leading-relaxed text-green-800 dark:text-green-300">
                                    A new verification link has been sent to
                                    your email address. Please check your inbox.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Email Illustration */}
                <motion.div
                    className="flex justify-center"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <motion.div
                        className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30"
                        variants={pulse}
                        initial="initial"
                        animate="animate"
                    >
                        <Mail className="size-12 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
                        <h3 className="mb-3 text-center text-lg font-semibold text-slate-900 dark:text-white">
                            Check your inbox
                        </h3>
                        <p className="text-center text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            We sent a verification email to your address. Click
                            the link in the email to verify your account and get
                            started with Trackly.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        <StepItem
                            number="1"
                            text="Check your email inbox"
                            completed
                        />
                        <StepItem
                            number="2"
                            text="Click the verification link"
                        />
                        <StepItem
                            number="3"
                            text="Start tracking commissions"
                        />
                    </div>
                </motion.div>

                {/* Resend Form */}
                <Form {...send.form()}>
                    {({ processing }) => (
                        <motion.div
                            className="space-y-4"
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                type="submit"
                                variant="secondary"
                                className="h-12 w-full text-base font-semibold"
                                disabled={processing || !canResend}
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
                                ) : !canResend ? (
                                    <>
                                        <Clock className="size-5" />
                                        <span>
                                            Resend in {countdown}s
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <SendIcon className="size-5" />
                                        <span>Resend verification email</span>
                                    </>
                                )}
                            </Button>

                            {/* Logout Link */}
                            <div className="text-center">
                                <TextLink
                                    href={logout()}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                    <LogOut className="size-4" />
                                    <span>Sign out</span>
                                </TextLink>
                            </div>
                        </motion.div>
                    )}
                </Form>

                {/* Help Section */}
                <motion.div
                    className="space-y-4"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                Need help?
                            </span>
                        </div>
                    </div>

                    {/* Help Cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                            <h4 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                                Can't find the email?
                            </h4>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                Check your spam folder or use the resend button
                                above.
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                            <h4 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                                Wrong email address?
                            </h4>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                Sign out and create a new account with the
                                correct email.
                            </p>
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <p className="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Still having issues?{' '}
                            <a
                                href="mailto:support@trackly.com"
                                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Contact our support team
                            </a>{' '}
                            and we'll help you get verified.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AuthSimpleLayout>
    );
}

function StepItem({
    number,
    text,
    completed = false,
}: {
    number: string;
    text: string;
    completed?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    completed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
            >
                {completed ? <CheckCircle2 className="size-5" /> : number}
            </div>
            <p
                className={`text-sm ${
                    completed
                        ? 'font-medium text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                }`}
            >
                {text}
            </p>
        </div>
    );
}
