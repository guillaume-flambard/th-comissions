import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface StatCardProps {
    /**
     * The main title/label for this stat
     */
    title: string;

    /**
     * The primary value to display (e.g., "฿45,230" or "23")
     */
    value: string | number;

    /**
     * Optional icon to display in the top-left
     */
    icon?: LucideIcon;

    /**
     * Optional change indicator (e.g., "+12.5%")
     * Positive numbers show green with up arrow, negative show red with down arrow
     */
    change?: number;

    /**
     * Optional description/context text
     */
    description?: string;

    /**
     * Optional footer action/link
     */
    footer?: ReactNode;

    /**
     * Color theme for the icon background
     */
    variant?: 'blue' | 'orange' | 'green' | 'purple' | 'slate';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * StatCard - A beautiful card component for displaying key metrics
 *
 * Design decisions:
 * - Large, readable numbers (text-3xl) for quick scanning
 * - Icon with colored background for visual hierarchy
 * - Change indicator with color-coded arrows for trend visibility
 * - Subtle hover effect for interactive feel
 * - Fully responsive with proper touch targets on mobile
 */
export function StatCard({
    title,
    value,
    icon: Icon,
    change,
    description,
    footer,
    variant = 'blue',
    className,
}: StatCardProps) {
    // Color mapping for icon backgrounds based on brand guidelines
    const variantStyles = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
        slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };

    const isPositiveChange = change !== undefined && change >= 0;

    return (
        <Card
            className={cn(
                'border-slate-200/70 transition-all duration-200 hover:shadow-md dark:border-slate-800',
                className,
            )}
        >
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Title */}
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {title}
                        </p>

                        {/* Main Value - Large and prominent */}
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {value}
                            </h3>

                            {/* Change Indicator */}
                            {change !== undefined && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium',
                                        isPositiveChange
                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                                    )}
                                >
                                    {isPositiveChange ? (
                                        <ArrowUpIcon className="size-3" />
                                    ) : (
                                        <ArrowDownIcon className="size-3" />
                                    )}
                                    {Math.abs(change)}%
                                </span>
                            )}
                        </div>

                        {/* Optional Description */}
                        {description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Icon */}
                    {Icon && (
                        <div
                            className={cn(
                                'rounded-xl p-3',
                                variantStyles[variant],
                            )}
                        >
                            <Icon className="size-6" />
                        </div>
                    )}
                </div>

                {/* Optional Footer */}
                {footer && (
                    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {footer}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
