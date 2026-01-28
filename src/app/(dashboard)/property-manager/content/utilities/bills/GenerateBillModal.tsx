"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calculator, Loader2 } from "lucide-react";

// Types for API responses
interface Property {
    id: string;
    name: string | null;
    address: string;
    units: { id: string; unitNumber: string; unitName: string | null }[];
}

interface Utility {
    id: string;
    name: string;
    type: string;
    unitPrice: number | null;
    fixedAmount: number | null;
}

interface Reading {
    id: string;
    leaseUtilityId: string;
    utilityId: string;
    utilityName: string;
    unitId: string;
    unitNumber: string;
    propertyId: string;
    propertyName: string;
    tenantName: string;
    readingValue: number;
    amount: number | null;
    readingDate: string | null;
    createdAt: string | null;
}

interface GeneratedBill {
    id: string;
    propertyId: string;
    propertyName: string;
    unitId: string;
    unitNumber: string;
    tenantId: string;
    tenantName: string;
    utilityType: string;
    readingFromId: string;
    readingToId: string;
    readingPeriodStr: string;
    consumption: number;
    rate: number;
    amountDue: number;
    status: string;
    createdAt: string;
}

interface GenerateBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (bill: GeneratedBill) => void;
}

export function GenerateBillModal({ isOpen, onClose, onGenerate }: GenerateBillModalProps) {
    // API Data State
    const [properties, setProperties] = useState<Property[]>([]);
    const [utilities, setUtilities] = useState<Utility[]>([]);
    const [allReadings, setAllReadings] = useState<Reading[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Form State
    const [propertyId, setPropertyId] = useState("");
    const [unitId, setUnitId] = useState("");
    const [utilityId, setUtilityId] = useState("");
    const [prevReadingId, setPrevReadingId] = useState("");
    const [currReadingId, setCurrReadingId] = useState("");
    const [rate, setRate] = useState(0.15);

    // Derived State
    const [tenantName, setTenantName] = useState("");

    // Get selected property's units
    const selectedProperty = properties.find(p => p.id === propertyId);
    const availableUnits = selectedProperty?.units || [];

    // Get selected utility
    const selectedUtility = utilities.find(u => u.id === utilityId);

    // Filter readings for selected unit and utility
    const availableReadings = allReadings
        .filter(r => r.unitId === unitId && r.utilityId === utilityId)
        .sort((a, b) => new Date(b.readingDate || 0).getTime() - new Date(a.readingDate || 0).getTime());

    // Fetch properties and utilities on mount
    useEffect(() => {
        if (!isOpen) return;

        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch properties (without organizationId for now - API should handle auth)
                const [propRes, utilRes] = await Promise.all([
                    fetch("/api/properties?organizationId=demo"), // TODO: Get real org ID
                    fetch("/api/utilities"),
                ]);

                if (propRes.ok) {
                    const propData = await propRes.json();
                    setProperties(Array.isArray(propData) ? propData : []);
                }

                if (utilRes.ok) {
                    const utilData = await utilRes.json();
                    setUtilities(utilData.data || []);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, [isOpen]);

    // Fetch readings when property changes
    const fetchReadings = useCallback(async (propId: string) => {
        if (!propId) {
            setAllReadings([]);
            return;
        }

        try {
            const res = await fetch(`/api/utilities/readings?propertyId=${propId}`);
            if (res.ok) {
                const data = await res.json();
                setAllReadings(data.readings || []);
            }
        } catch (error) {
            console.error("Error fetching readings:", error);
        }
    }, []);

    // When property changes, fetch readings and reset unit
    useEffect(() => {
        if (propertyId) {
            fetchReadings(propertyId);
        } else {
            setAllReadings([]);
        }
        setUnitId("");
        setPrevReadingId("");
        setCurrReadingId("");
    }, [propertyId, fetchReadings]);

    // When unit changes, update tenant name from readings
    useEffect(() => {
        if (unitId && allReadings.length > 0) {
            const reading = allReadings.find(r => r.unitId === unitId);
            setTenantName(reading?.tenantName || "Unknown Tenant");
        } else {
            setTenantName("");
        }
        setPrevReadingId("");
        setCurrReadingId("");
    }, [unitId, allReadings]);

    // When utility changes, update rate from utility data and reset readings
    useEffect(() => {
        if (selectedUtility?.unitPrice) {
            setRate(selectedUtility.unitPrice);
        }
        setPrevReadingId("");
        setCurrReadingId("");
    }, [utilityId, selectedUtility]);

    // Calculations
    const prevReading = availableReadings.find(r => r.id === prevReadingId);
    const currReading = availableReadings.find(r => r.id === currReadingId);

    const consumption = (currReading && prevReading)
        ? Math.abs(currReading.readingValue - prevReading.readingValue)
        : 0;

    const amountDue = consumption * rate;

    const handleSubmit = () => {
        if (!propertyId || !unitId || !prevReading || !currReading) return;

        const newBill: GeneratedBill = {
            id: `bill-${Math.floor(Math.random() * 10000)}`,
            propertyId,
            propertyName: selectedProperty?.name || selectedProperty?.address || "Unknown Property",
            unitId,
            unitNumber: prevReading.unitNumber,
            tenantId: "t-generated",
            tenantName,
            utilityType: selectedUtility?.name || "Unknown",
            readingFromId: prevReading.id,
            readingToId: currReading.id,
            readingPeriodStr: `${new Date(prevReading.readingDate || "").toLocaleDateString()} → ${new Date(currReading.readingDate || "").toLocaleDateString()}`,
            consumption,
            rate,
            amountDue,
            status: "DRAFT",
            createdAt: new Date().toISOString(),
        };

        onGenerate(newBill);

        // Reset form
        setPropertyId("");
        setUnitId("");
        setUtilityId("");
        setPrevReadingId("");
        setCurrReadingId("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-[#003b73]">
                        <Calculator className="w-5 h-5" />
                        Generate Utility Bill
                    </DialogTitle>
                    <DialogDescription>
                        Create a tenant bill derived from two meter readings.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500">Loading data...</span>
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        {/* Top Row: Context */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Property</Label>
                                <Select value={propertyId} onValueChange={setPropertyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Property" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                                        {properties.length === 0 ? (
                                            <div className="p-2 text-sm text-slate-500 text-center">No properties found</div>
                                        ) : (
                                            properties.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="hover:bg-slate-100 cursor-pointer">
                                                    {p.name || p.address}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Unit & Tenant</Label>
                                <Select value={unitId} onValueChange={setUnitId} disabled={!propertyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={propertyId ? "Select Unit" : "Select Property First"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                                        {availableUnits.length === 0 ? (
                                            <div className="p-2 text-sm text-slate-500 text-center">No units found</div>
                                        ) : (
                                            availableUnits.map(u => (
                                                <SelectItem key={u.id} value={u.id} className="hover:bg-slate-100 cursor-pointer">
                                                    {u.unitName || u.unitNumber}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Utility Type</Label>
                                <Select value={utilityId} onValueChange={setUtilityId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Utility" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                                        {utilities.length === 0 ? (
                                            <div className="p-2 text-sm text-slate-500 text-center">No utilities found</div>
                                        ) : (
                                            utilities.map(u => (
                                                <SelectItem key={u.id} value={u.id} className="hover:bg-slate-100 cursor-pointer">
                                                    {u.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rate (per unit)</Label>
                                <Input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Readings Selection */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <Label className="mb-2 block text-slate-700 font-semibold">Reading Period Selection</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-slate-500">Previous Reading</span>
                                    <Select value={prevReadingId} onValueChange={setPrevReadingId}>
                                        <SelectTrigger className="bg-white" disabled={!unitId || !utilityId}>
                                            <SelectValue placeholder={unitId && utilityId ? "Select..." : "Select Unit & Utility First"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                                            {availableReadings.length === 0 ? (
                                                <div className="p-2 text-sm text-slate-500 text-center">No readings found</div>
                                            ) : (
                                                availableReadings.map(r => (
                                                    <SelectItem key={r.id} value={r.id} className="hover:bg-slate-100 cursor-pointer">
                                                        {r.readingDate ? new Date(r.readingDate).toLocaleDateString() : "N/A"} — Value: {r.readingValue}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 mt-5" />
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-slate-500">Current Reading</span>
                                    <Select value={currReadingId} onValueChange={setCurrReadingId}>
                                        <SelectTrigger className="bg-white" disabled={!unitId || !utilityId}>
                                            <SelectValue placeholder={unitId && utilityId ? "Select..." : "Select Unit & Utility First"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                                            {availableReadings.length === 0 ? (
                                                <div className="p-2 text-sm text-slate-500 text-center">No readings found</div>
                                            ) : (
                                                availableReadings.map(r => (
                                                    <SelectItem key={r.id} value={r.id} className="hover:bg-slate-100 cursor-pointer">
                                                        {r.readingDate ? new Date(r.readingDate).toLocaleDateString() : "N/A"} — Value: {r.readingValue}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Result */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div>
                                <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">Consumption</span>
                                <div className="text-2xl font-bold text-blue-900">{consumption} <span className="text-sm font-normal text-blue-700">units</span></div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">Amount Due</span>
                                <div className="text-2xl font-bold text-blue-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountDue)}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!prevReading || !currReading || consumption === 0 || isLoadingData}
                        className="bg-[#003b73] hover:bg-[#002b5b] text-white"
                    >
                        Generate Draft Bill
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
