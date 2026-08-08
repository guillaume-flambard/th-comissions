import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    TrendingUp,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { motion, type Variants } from 'framer-motion';

interface AuthPremiumLayoutProps {
    title: string;
    description: string;
}

// Animation variants
const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

const slideInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
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

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function AuthPremiumLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthPremiumLayoutProps>) {
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
        >
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Panel - Branding & Benefits */}
                <motion.div
                    className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
                    initial="hidden"
                    animate="visible"
                    variants={slideInLeft}
                    transition={{ duration: 0.6 }}
                >
                    {/* Decorative gradient orbs */}
                    <motion.div
                        className="absolute top-20 left-1/4 size-96 rounded-full bg-white/10 blur-3xl"
                        animate={
                            prefersReducedMotion
                                ? {}
                                : {
                                      y: [0, -20, 0],
                                      x: [0, 10, 0],
                                  }
                        }
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute right-0 bottom-20 size-96 rounded-full bg-orange-500/20 blur-3xl"
                        animate={
                            prefersReducedMotion
                                ? {}
                                : {
                                      y: [0, 20, 0],
                                      x: [0, -15, 0],
                                  }
                        }
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Logo */}
                        <Link
                            href={home()}
                            className="mb-12 flex items-center gap-3 text-white"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <AppLogoIcon className="size-7 fill-current" />
                            </div>
                            <span className="text-2xl font-bold">Trackly</span>
                        </Link>

                        {/* Tagline */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="space-y-6"
                        >
                            <motion.h1
                                className="text-4xl font-bold leading-tight text-white xl:text-5xl"
                                variants={fadeUp}
                            >
                                Track smarter,
                                <br />
                                earn more
                            </motion.h1>
                            <motion.p
                                className="max-w-md text-lg text-blue-100"
                                variants={fadeUp}
                            >
                                Stop losing money on manual commission tracking.
                                Automate everything in 5 minutes.
                            </motion.p>

                            {/* Benefits List */}
                            <motion.div
                                className="space-y-4 pt-4"
                                variants={staggerContainer}
                            >
                                <BenefitItem
                                    icon={TrendingUp}
                                    text="Auto-calculate commissions"
                                />
                                <BenefitItem
                                    icon={Clock}
                                    text="Save 10 hours per month"
                                />
                                <BenefitItem
                                    icon={Users}
                                    text="PromptPay payouts"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Social Proof */}
                    <motion.div
                        className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-green-300" />
                            <span className="text-sm font-semibold text-white">
                                Trusted by tourism businesses
                            </span>
                        </div>
                        <p className="text-sm text-blue-100">
                            Join 50+ dive shops, hostels, and tour operators
                            across Thailand using Trackly to manage commissions
                            automatically.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Right Panel - Form */}
                <motion.div
                    className="flex items-center justify-center p-6 sm:p-10 lg:p-16"
                    initial="hidden"
                    animate="visible"
                    variants={slideInRight}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="w-full max-w-md">
                        {/* Mobile Logo (shown on small screens) */}
                        <Link
                            href={home()}
                            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
                        >
                            <div className="flex size-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                Trackly
                            </span>
                        </Link>

                        {/* Header */}
                        <motion.div
                            className="mb-8 space-y-2"
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="text-base text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        </motion.div>

                        {/* Form Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function BenefitItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <motion.div className="flex items-center gap-3" variants={fadeUp}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Icon className="size-5 text-white" />
            </div>
            <span className="text-base font-medium text-white">{text}</span>
        </motion.div>
    );
}
