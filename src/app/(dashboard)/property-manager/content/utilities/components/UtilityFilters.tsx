"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Property {
    id: string;
    name: string;
}

interface UtilityFiltersProps {
    properties: Property[];
    selectedProperty: string;
    onPropertyChange: (value: string) => void;
    onClearFilters: () => void;
}

/**
 * Property filter for utilities dashboard.
 * Simple dropdown filter - no advanced filtering per requirements.
 */
export function UtilityFilters({
    properties,
    selectedProperty,
    onPropertyChange,
    onClearFilters,
}: UtilityFiltersProps) {
    const hasActiveFilter = selectedProperty !== "all";

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Filter className="w-5 h-5 text-[#15386a]" />

            <Select value={selectedProperty} onValueChange={onPropertyChange}>
                <SelectTrigger className="w-64 border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]">
                    <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                            {property.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilter && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-[#15386a] border-[#15386a]/30 hover:bg-[#15386a]/5"
                >
                    Clear Filter
                </Button>
            )}
        </div>
    );
}
