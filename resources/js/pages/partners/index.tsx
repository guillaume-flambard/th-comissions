import { PartnerCard, type Partner } from '@/components/partner-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    GridIcon,
    ListIcon,
    PlusIcon,
    SearchIcon,
    UsersIcon,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Partners Index page props
 */
interface PartnersIndexProps {
    /**
     * List of all partners
     */
    partners: Partner[];

    /**
     * Filters applied (from query params)
     */
    filters?: {
        search?: string;
        business_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Partners',
        href: '/partners',
    },
];

/**
 * Business types available for filtering
 */
const BUSINESS_TYPES = [
    'All Types',
    'Dive Shop',
    'Kite School',
    'Hostel',
    'Hotel',
    'Tour Operator',
    'Transfer Service',
];

/**
 * Partners Index Page - View and manage all partner relationships
 *
 * Design Philosophy:
 * - Clean, scannable list of partners
 * - Toggle between grid and list views
 * - Search and filter capabilities
 * - Quick actions on each partner card
 * - Beautiful empty state to encourage first partner addition
 *
 * UX Decisions:
 * - Grid view for visual browsing, list for detailed comparison
 * - Search bar prominently placed for quick filtering
 * - "Add Partner" button always visible (sticky on mobile)
 * - Responsive layout that works on all screen sizes
 * - Color-coded business type badges for quick identification
 */
export default function PartnersIndex({
    partners = [],
    filters = {},
}: PartnersIndexProps) {
    // View mode state (grid or list)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Local search state (for immediate UI feedback)
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [businessTypeFilter, setBusinessTypeFilter] = useState(
        filters.business_type || 'All Types'
    );

    /**
     * Handle search input change with debouncing
     */
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // TODO: Implement debounced search with Inertia
        // For now, we'll filter client-side
    };

    /**
     * Handle business type filter change
     */
    const handleBusinessTypeChange = (type: string) => {
        setBusinessTypeFilter(type);
        // TODO: Update URL with Inertia router
    };

    /**
     * Filter partners based on search and business type
     */
    const filteredPartners = partners.filter((partner) => {
        // Search filter
        const matchesSearch =
            !searchQuery ||
            partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.contact_person
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        // Business type filter
        const matchesBusinessType =
            businessTypeFilter === 'All Types' ||
            partner.type.toLowerCase() === businessTypeFilter.toLowerCase();

        return matchesSearch && matchesBusinessType;
    });

    /**
     * Handle add new partner
     */
    const handleAddPartner = () => {
        router.visit('/partners/create');
    };

    /**
     * Handle delete partner
     */
    const handleDeletePartner = (partner: Partner) => {
        if (
            confirm(
                `Are you sure you want to delete ${partner.name}? This action cannot be undone.`
            )
        ) {
            router.delete(`/partners/${partner.id}`);
        }
    };

    // Empty state - No partners exist
    if (partners.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Partners" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md text-center">
                        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                            <UsersIcon className="size-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                            No partners yet
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Start building your partner network by adding your first
                            partner. Generate QR codes and track commissions
                            effortlessly.
                        </p>
                        <Button
                            size="lg"
                            className="mt-6"
                            onClick={handleAddPartner}
                        >
                            <PlusIcon className="mr-2 size-5" />
                            Add Your First Partner
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Empty state - No partners match filters
    const noFilteredResults = filteredPartners.length === 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                            Partners
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Manage your partner relationships and track commissions
                        </p>
                    </div>
                    <Button size="lg" onClick={handleAddPartner}>
                        <PlusIcon className="mr-2 size-5" />
                        Add Partner
                    </Button>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search and Business Type Filter */}
                    <div className="flex flex-1 gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:max-w-sm">
                            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search partners..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Business Type Filter */}
                        <Select
                            value={businessTypeFilter}
                            onValueChange={handleBusinessTypeChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                {BUSINESS_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <GridIcon className="size-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Partners Count */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredPartners.length} of {partners.length}{' '}
                    {partners.length === 1 ? 'partner' : 'partners'}
                </div>

                {/* Partners Grid/List */}
                {noFilteredResults ? (
                    // No results found
                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                        <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <SearchIcon className="size-8 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No partners found
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Try adjusting your search or filters
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setSearchQuery('');
                                setBusinessTypeFilter('All Types');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                                : 'flex flex-col gap-4'
                        }
                    >
                        {filteredPartners.map((partner) => (
                            <PartnerCard
                                key={partner.id}
                                partner={partner}
                                viewMode={viewMode}
                                onDelete={handleDeletePartner}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
