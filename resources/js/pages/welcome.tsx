import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    BadgeCheck,
    BookOpen,
    Calculator,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    Link2,
    MessagesSquare,
    QrCode,
    Smartphone,
    Smile,
    TrendingUp,
    User,
    Users,
    Wallet,
    X,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Track smarter, earn more">
                <meta
                    name="description"
                    content="Stop losing money on manual commission tracking. B2B commission tracking platform built for Thailand's tourism sector."
                />
            </Head>

            <div className="min-h-screen bg-white dark:bg-slate-950">
                {/* Header - Floating design */}
                <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <img
                                    src="/images/brand/logo-icon.svg"
                                    alt="Trackly"
                                    className="h-8 w-8"
                                />
                                <span className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Trackly
                                </span>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Button asChild size="lg">
                                        <Link href={dashboard()}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            className="hidden sm:inline-flex"
                                        >
                                            <Link href={login()}>Log in</Link>
                                        </Button>
                                        <Button asChild size="lg">
                                            <Link href={register()}>
                                                Start Free Trial
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Main Content - Add top padding for fixed header */}
                <main className="pt-16">
                    {/* Hero Section - Gradient background with compelling copy */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                        {/* Decorative gradient orbs */}
                        <div className="absolute left-1/4 top-20 size-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10" />
                        <div className="absolute right-1/4 top-40 size-96 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-600/10" />

                        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
                            <div className="mx-auto max-w-4xl text-center">
                                {/* Trust badge */}
                                <Badge
                                    variant="secondary"
                                    className="mb-6 rounded-full px-4 py-2 text-sm shadow-sm"
                                >
                                    <BadgeCheck className="size-4 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium">
                                        Trusted by 50+ tourism businesses across
                                        Thailand
                                    </span>
                                </Badge>

                                {/* Main headline - Focus on PAIN point */}
                                <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                                    Stop Losing Money on{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                                        Manual Commission
                                    </span>{' '}
                                    Tracking
                                </h1>

                                {/* Subheadline - Resonate with Thai tourism owners */}
                                <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
                                    Your partners send you customers. You lose
                                    track of who sent who. Commissions get
                                    forgotten. Relationships suffer.{' '}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        Trackly fixes this automatically.
                                    </span>
                                </p>

                                {/* CTAs - Clear hierarchy */}
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button asChild size="lg" className="group">
                                        <Link
                                            href={register()}
                                            className="h-14 rounded-xl px-8 text-base shadow-lg shadow-blue-600/20 transition-shadow hover:shadow-xl hover:shadow-blue-600/30"
                                        >
                                            <span>Start Free Trial</span>
                                            <Zap className="size-5 transition-transform group-hover:scale-110" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="h-14 rounded-xl border-2 px-8 text-base"
                                    >
                                        <a href="#how-it-works">
                                            <span>See How It Works</span>
                                            <ChevronDown className="size-5" />
                                        </a>
                                    </Button>
                                </div>

                                {/* Trust indicators */}
                                <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                                    <CheckCircle2 className="mr-1 inline size-4 text-green-600 dark:text-green-400" />
                                    No credit card required
                                    <span className="mx-3">•</span>
                                    <CheckCircle2 className="mr-1 inline size-4 text-green-600 dark:text-green-400" />
                                    Set up in 5 minutes
                                    <span className="mx-3">•</span>
                                    <CheckCircle2 className="mr-1 inline size-4 text-green-600 dark:text-green-400" />
                                    Cancel anytime
                                </p>
                            </div>

                            {/* Visual mockup - Dashboard preview */}
                            <div className="relative mx-auto mt-16 max-w-5xl">
                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 to-orange-600/20 blur-3xl" />
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                                    {/* Browser chrome */}
                                    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                                        <div className="size-3 rounded-full bg-red-500" />
                                        <div className="size-3 rounded-full bg-yellow-500" />
                                        <div className="size-3 rounded-full bg-green-500" />
                                    </div>
                                    {/* Mockup content */}
                                    <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 p-8 dark:from-slate-900 dark:to-slate-800">
                                        <div className="grid h-full gap-4 sm:grid-cols-3">
                                            {/* Stat card mockup */}
                                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    Total Commissions
                                                </div>
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    ฿45,280
                                                </div>
                                                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                    +12.5% this month
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    Active Partners
                                                </div>
                                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                    23
                                                </div>
                                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                    8 new this week
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    Referrals
                                                </div>
                                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    142
                                                </div>
                                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                    This month
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Proof - Build trust early */}
                    <section className="border-y border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid gap-8 md:grid-cols-3">
                                {/* Stat 1 */}
                                <div className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        ฿2.5M+
                                    </div>
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Commissions tracked
                                    </div>
                                </div>
                                {/* Stat 2 */}
                                <div className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-orange-600 dark:text-orange-400">
                                        500+
                                    </div>
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Referrals processed monthly
                                    </div>
                                </div>
                                {/* Stat 3 */}
                                <div className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                                        10hrs
                                    </div>
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Saved per business/month
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Problem-Solution - Visual before/after */}
                    <section
                        id="how-it-works"
                        className="py-20 sm:py-32"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-4 py-2"
                                >
                                    The Problem
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                                    From{' '}
                                    <span className="text-red-600 dark:text-red-400">
                                        WhatsApp Chaos
                                    </span>{' '}
                                    to{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                                        Clear Tracking
                                    </span>
                                </h2>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-2">
                                {/* BEFORE - Manual tracking */}
                                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-white dark:border-red-900/50 dark:from-red-950/20 dark:to-slate-900">
                                    <CardContent className="p-8">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex size-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                                                <X className="size-6 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    Before Trackly
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Manual tracking nightmare
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="space-y-4">
                                            <ProblemItem
                                                icon={
                                                    <BookOpen className="size-5 text-red-600 dark:text-red-400" />
                                                }
                                            >
                                                Lost notebooks and scattered
                                                Excel files
                                            </ProblemItem>
                                            <ProblemItem
                                                icon={
                                                    <MessagesSquare className="size-5 text-red-600 dark:text-red-400" />
                                                }
                                            >
                                                WhatsApp message chaos - "Did I
                                                send you Som?"
                                            </ProblemItem>
                                            <ProblemItem
                                                icon={
                                                    <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                                                }
                                            >
                                                Forgotten payments and missed
                                                commissions
                                            </ProblemItem>
                                            <ProblemItem
                                                icon={
                                                    <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                                                }
                                            >
                                                Partner disputes - "I sent you 5
                                                customers!"
                                            </ProblemItem>
                                            <ProblemItem
                                                icon={
                                                    <Clock className="size-5 text-red-600 dark:text-red-400" />
                                                }
                                            >
                                                2+ hours every Friday
                                                reconciling payments
                                            </ProblemItem>
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* AFTER - Trackly solution */}
                                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-white shadow-lg shadow-green-600/10 dark:border-green-900/50 dark:from-green-950/20 dark:to-slate-900">
                                    <CardContent className="p-8">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                                                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    After Trackly
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Automated, accurate, easy
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="space-y-4">
                                            <SolutionItem
                                                icon={
                                                    <Smartphone className="size-5 text-green-600 dark:text-green-400" />
                                                }
                                            >
                                                QR code scans - instant partner
                                                tracking
                                            </SolutionItem>
                                            <SolutionItem
                                                icon={
                                                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                                                }
                                            >
                                                Auto-calculated commissions - zero
                                                math errors
                                            </SolutionItem>
                                            <SolutionItem
                                                icon={
                                                    <Wallet className="size-5 text-green-600 dark:text-green-400" />
                                                }
                                            >
                                                PromptPay payouts in one click
                                            </SolutionItem>
                                            <SolutionItem
                                                icon={
                                                    <Smile className="size-5 text-green-600 dark:text-green-400" />
                                                }
                                            >
                                                Happy partners with transparent
                                                tracking
                                            </SolutionItem>
                                            <SolutionItem
                                                icon={
                                                    <Zap className="size-5 text-green-600 dark:text-green-400" />
                                                }
                                            >
                                                10 minutes per month instead of 8+
                                                hours
                                            </SolutionItem>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* How It Works - 3 Simple Steps */}
                    <section className="bg-slate-50 py-20 dark:bg-slate-900/50 sm:py-32">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-4 py-2"
                                >
                                    How It Works
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                                    Get Started in{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                                        3 Simple Steps
                                    </span>
                                </h2>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-3">
                                <StepCard
                                    number="01"
                                    icon={<Users className="size-8" />}
                                    title="Add Your Partners"
                                    description="Add dive shops, hostels, or tour operators. Set custom commission rates (10-25%)."
                                    color="blue"
                                />
                                <StepCard
                                    number="02"
                                    icon={<QrCode className="size-8" />}
                                    title="Share QR Codes"
                                    description="Each partner gets a unique QR code. They share it with customers who book with you."
                                    color="orange"
                                />
                                <StepCard
                                    number="03"
                                    icon={<CreditCard className="size-8" />}
                                    title="Auto-Pay Commissions"
                                    description="Trackly calculates earnings. Pay partners via PromptPay in one click."
                                    color="green"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Features - With icons and better hierarchy */}
                    <section id="features" className="py-20 sm:py-32">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-4 py-2"
                                >
                                    Features
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                                    Everything You Need to{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                                        Track Commissions
                                    </span>
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                    Built specifically for Thailand's tourism
                                    sector with features that solve real
                                    problems.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <FeatureCard
                                    icon={
                                        <QrCode className="size-6 text-blue-600 dark:text-blue-400" />
                                    }
                                    title="QR Code Tracking"
                                    description="Generate unique QR codes for each partner. Know exactly who sent each customer."
                                />
                                <FeatureCard
                                    icon={
                                        <Calculator className="size-6 text-orange-600 dark:text-orange-400" />
                                    }
                                    title="Auto-Calculate Commissions"
                                    description="Set custom rates (10-25%). Automatic calculations, zero errors."
                                />
                                <FeatureCard
                                    icon={
                                        <Zap className="size-6 text-green-600 dark:text-green-400" />
                                    }
                                    title="PromptPay Integration"
                                    description="One-click payouts via PromptPay. Fast, secure, familiar to Thai users."
                                />
                                <FeatureCard
                                    icon={
                                        <TrendingUp className="size-6 text-blue-600 dark:text-blue-400" />
                                    }
                                    title="Partner Dashboard"
                                    description="Real-time earnings tracking. See which partnerships drive value."
                                />
                                <FeatureCard
                                    icon={
                                        <Smartphone className="size-6 text-orange-600 dark:text-orange-400" />
                                    }
                                    title="Mobile-First Design"
                                    description="Built for smartphones. Manage commissions on the go."
                                />
                                <FeatureCard
                                    icon={
                                        <Link2 className="size-6 text-green-600 dark:text-green-400" />
                                    }
                                    title="PMS Integration"
                                    description="Connect with STAAH, Cloudbeds, and more. Auto-validate bookings."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Use Cases - Persona stories */}
                    <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:py-32">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-4 py-2"
                                >
                                    Success Stories
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                                    Trusted by Tourism Businesses{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                                        Across Thailand
                                    </span>
                                </h2>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-2">
                                <TestimonialCard
                                    quote="I used to spend 2 hours every Friday reconciling commissions with 8 hostels. Now it takes 10 minutes. Trackly paid for itself in the first week."
                                    author="Som"
                                    role="Owner, Crystal Dive"
                                    location="Koh Tao"
                                />
                                <TestimonialCard
                                    quote="We finally know which dive shops actually send us customers. The data helps us focus on the right partnerships. Game changer for our business."
                                    author="Mike"
                                    role="Owner, Beachside Hostel"
                                    location="Phuket"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing Preview */}
                    <section id="pricing" className="py-20 sm:py-32">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    variant="outline"
                                    className="mb-4 rounded-full px-4 py-2"
                                >
                                    Pricing
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
                                    Simple,{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                                        Transparent Pricing
                                    </span>
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                    Start free, upgrade as you grow. No hidden
                                    fees.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <PricingCard
                                    name="Free"
                                    price="0"
                                    period="forever"
                                    description="Perfect for testing Trackly"
                                    features={[
                                        'Up to 20 referrals/month',
                                        '3 active partners',
                                        'QR code tracking',
                                        'Basic reporting',
                                    ]}
                                    cta="Start Free"
                                    ctaLink={register()}
                                />
                                <PricingCard
                                    name="Starter"
                                    price="299"
                                    period="month"
                                    description="For growing businesses"
                                    features={[
                                        'Unlimited referrals',
                                        'Unlimited partners',
                                        'PromptPay integration',
                                        'Advanced analytics',
                                        'Email support',
                                    ]}
                                    cta="Start Free Trial"
                                    ctaLink={register()}
                                    popular
                                />
                                <PricingCard
                                    name="Pro"
                                    price="999"
                                    period="month"
                                    description="For busy high seasons"
                                    features={[
                                        'Everything in Starter',
                                        'PMS integrations',
                                        'White-label QR codes',
                                        'Priority support',
                                        'Custom commission rules',
                                    ]}
                                    cta="Start Free Trial"
                                    ctaLink={register()}
                                />
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <FAQSection />

                    {/* Final CTA - Strong, urgent */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 py-20 sm:py-32">
                        {/* Decorative elements */}
                        <div className="absolute left-0 top-0 size-96 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 right-0 size-96 rounded-full bg-orange-500/20 blur-3xl" />

                        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                                Ready to Stop Losing Money on Manual Tracking?
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
                                Join 50+ dive shops, hostels, and tour operators
                                using Trackly. Start tracking commissions
                                automatically in 5 minutes.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="group h-14 rounded-xl border-2 border-white bg-white px-8 text-base text-blue-700 shadow-xl hover:bg-blue-50"
                                >
                                    <Link href={register()}>
                                        <span className="font-semibold">
                                            Start Free Trial
                                        </span>
                                        <Zap className="size-5 transition-transform group-hover:scale-110" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-100">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-4" />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-4" />
                                    Free forever plan
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-4" />
                                    Cancel anytime
                                </span>
                            </div>

                            {/* Sample QR code visualization */}
                            <div className="mx-auto mt-12 max-w-sm">
                                <div className="rounded-2xl border-4 border-white/20 bg-white p-6 shadow-2xl">
                                    <div className="mb-3 text-center">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Your unique tracking QR code
                                        </p>
                                    </div>
                                    {/* QR code placeholder */}
                                    <div className="mx-auto flex aspect-square w-48 items-center justify-center rounded-lg bg-slate-100">
                                        <QrCode className="size-32 text-slate-400" />
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className="text-xs text-slate-600">
                                            Partners share this with customers
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <img
                                        src="/images/brand/logo-icon.svg"
                                        alt="Trackly"
                                        className="h-8 w-8"
                                    />
                                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Trackly
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Commission tracking built for Thailand's
                                    tourism sector.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Product
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#features"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#pricing"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#faq"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Company
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#about"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#contact"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Legal
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#privacy"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Privacy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#terms"
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            Terms
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                © 2025 Trackly. Built for Thailand's tourism
                                community.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

// Component: Problem Item
function ProblemItem({
    icon,
    children,
}: {
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <li className="flex gap-3">
            <span className="text-xl">{icon}</span>
            <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {children}
            </span>
        </li>
    );
}

// Component: Solution Item
function SolutionItem({
    icon,
    children,
}: {
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <li className="flex gap-3">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium leading-relaxed text-slate-900 dark:text-white">
                {children}
            </span>
        </li>
    );
}

// Component: Step Card (How it works)
function StepCard({
    number,
    icon,
    title,
    description,
    color,
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'blue' | 'orange' | 'green';
}) {
    const colorClasses = {
        blue: 'from-blue-50 to-white border-blue-200 dark:from-blue-950/20 dark:to-slate-900 dark:border-blue-900/50',
        orange: 'from-orange-50 to-white border-orange-200 dark:from-orange-950/20 dark:to-slate-900 dark:border-orange-900/50',
        green: 'from-green-50 to-white border-green-200 dark:from-green-950/20 dark:to-slate-900 dark:border-green-900/50',
    };

    const iconColorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    };

    const numberColorClasses = {
        blue: 'text-blue-600 dark:text-blue-400',
        orange: 'text-orange-600 dark:text-orange-400',
        green: 'text-green-600 dark:text-green-400',
    };

    return (
        <Card
            className={cn(
                'border-2 bg-gradient-to-br shadow-sm',
                colorClasses[color],
            )}
        >
            <CardContent className="p-8">
                <div className="mb-4 text-5xl font-bold opacity-20">
                    <span className={numberColorClasses[color]}>{number}</span>
                </div>
                <div
                    className={cn(
                        'mb-4 flex size-14 items-center justify-center rounded-xl',
                        iconColorClasses[color],
                    )}
                >
                    {icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

// Component: Feature Card
function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="group transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

// Component: Testimonial Card
function TestimonialCard({
    quote,
    author,
    role,
    location,
    avatar,
}: {
    quote: string;
    author: string;
    role: string;
    location: string;
    avatar: string;
}) {
    return (
        <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
                <p className="mb-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    "{quote}"
                </p>
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-orange-100 text-2xl dark:from-blue-900/30 dark:to-orange-900/30">
                        {avatar}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                            {author}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {role} • {location}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Component: Pricing Card
function PricingCard({
    name,
    price,
    period,
    description,
    features,
    cta,
    ctaLink,
    popular = false,
}: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    ctaLink: string;
    popular?: boolean;
}) {
    return (
        <Card
            className={cn(
                'relative border-2 shadow-sm transition-shadow hover:shadow-lg',
                popular &&
                    'border-blue-600 shadow-lg shadow-blue-600/10 dark:border-blue-400',
            )}
        >
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full bg-gradient-to-r from-blue-600 to-orange-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                        Most Popular
                    </Badge>
                </div>
            )}
            <CardContent className="p-8">
                <div className="mb-6">
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                            ฿{price}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                            /{period}
                        </span>
                    </div>
                </div>
                <Button asChild className="mb-6 w-full" size="lg">
                    <Link href={ctaLink}>{cta}</Link>
                </Button>
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                        >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                            <span className="text-slate-700 dark:text-slate-300">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

// Component: FAQ Section
function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: 'Do I need to change my property management system?',
            answer: 'No! Trackly works alongside any PMS. We integrate with popular systems like STAAH and Cloudbeds, but you can also use Trackly independently with manual tracking.',
        },
        {
            question: 'Is it difficult to set up?',
            answer: 'Not at all. Most businesses are up and running in 5 minutes. Add your partners, set commission rates, and share QR codes. We provide onboarding support if you need help.',
        },
        {
            question: "What if my partners don't want to use it?",
            answer: 'Partners don\'t need to sign up or use any app. They simply share your unique QR code link with customers. When a customer books, you scan/click the code. That\'s it!',
        },
        {
            question: 'What about PromptPay fees?',
            answer: 'Trackly is free to start (up to 20 referrals/month) and paid plans start at just 299 THB/month. PromptPay transfers have minimal fees charged by banks (typically 0-10 THB per transaction).',
        },
        {
            question: 'Can I customize commission rates per partner?',
            answer: 'Yes! Set different commission rates (10-25%) for each partner. Perfect if you have different arrangements with dive shops vs hostels.',
        },
        {
            question: 'What happens if I cancel?',
            answer: 'You can cancel anytime. Your data is available for download. We never lock you in or charge cancellation fees.',
        },
    ];

    return (
        <section id="faq" className="bg-slate-50 py-20 dark:bg-slate-900/50 sm:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <Badge
                        variant="outline"
                        className="mb-4 rounded-full px-4 py-2"
                    >
                        FAQ
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Frequently Asked{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() =>
                                setOpenIndex(openIndex === index ? null : index)
                            }
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Component: FAQ Item
function FAQItem({
    question,
    answer,
    isOpen,
    onClick,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <Card className="overflow-hidden border-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <h3 className="pr-8 text-lg font-semibold text-slate-900 dark:text-white">
                    {question}
                </h3>
                <ChevronDown
                    className={cn(
                        'size-5 shrink-0 text-slate-600 transition-transform dark:text-slate-400',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>
            {isOpen && (
                <div className="border-t border-slate-200 px-6 pb-6 pt-4 dark:border-slate-800">
                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                        {answer}
                    </p>
                </div>
            )}
        </Card>
    );
}
