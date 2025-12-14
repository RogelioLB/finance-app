"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface AccountFormProps {
    defaultValues?: any
    onSubmit: (formData: FormData) => Promise<void>
    onCancel: () => void
    isEdit?: boolean
}

export function AccountForm({ defaultValues, onSubmit, onCancel, isEdit = false }: AccountFormProps) {
    const [selectedType, setSelectedType] = useState(defaultValues?.type || "BANK")
    const [selectedColor, setSelectedColor] = useState(defaultValues?.theme || "black")
    // Convert DB fields to string for inputs (handle nulls)
    const [balance, setBalance] = useState(defaultValues?.balance?.toString() || "0")

    const colorOptions = [
        { value: "black", class: "bg-zinc-900" },
        { value: "blue", class: "bg-blue-600" },
        { value: "purple", class: "bg-purple-600" },
        { value: "green", class: "bg-emerald-600" },
        { value: "red", class: "bg-red-600" },
        { value: "gradient", class: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" },
    ]

    const handleSubmit = async (formData: FormData) => {
        // Append controlled states that might not be in standard inputs or hidden inputs
        formData.set("color", selectedColor)
        if (!isEdit) { // On edit, type is disabled/hidden so might not be needed or already in default
            formData.set("type", selectedType)
        }
        await onSubmit(formData)
    }

    return (
        <form action={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="grid gap-2 col-span-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Chase Sapphire"
                        defaultValue={defaultValues?.name}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    {isEdit ? (
                        <Input
                            disabled
                            value={selectedType.replace('_', ' ')}
                            className="bg-muted capitalize"
                        />
                    ) : (
                        <Select name="type" required onValueChange={setSelectedType} defaultValue={selectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BANK">Bank Account</SelectItem>
                                <SelectItem value="CASH">Cash Wallet</SelectItem>
                                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                <SelectItem value="SAVINGS">Savings</SelectItem>
                                <SelectItem value="LOAN">Loan / Debt</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="balance">{selectedType === 'CREDIT_CARD' ? 'Current Debt' : 'Current Balance'}</Label>
                    <Input
                        id="balance"
                        name="balance"
                        type="number"
                        step="0.01"
                        onChange={(e) => setBalance(e.target.value)}
                        value={balance}
                        required
                    />
                </div>

                {(selectedType === 'CREDIT_CARD' || (isEdit && defaultValues?.creditLimit)) && (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="creditLimit">Credit Limit</Label>
                            <Input
                                id="creditLimit"
                                name="creditLimit"
                                type="number"
                                placeholder="5000"
                                defaultValue={defaultValues?.creditLimit?.toString()}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cutoffDay">Cut-off Day (1-31)</Label>
                            <Input
                                id="cutoffDay"
                                name="cutoffDay"
                                type="number"
                                min="1" max="31"
                                placeholder="e.g. 15"
                                defaultValue={defaultValues?.cutoffDay?.toString()}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paymentDay">Payment Deadline (Day)</Label>
                            <Input
                                id="paymentDay"
                                name="paymentDay"
                                type="number"
                                min="1" max="31"
                                placeholder="e.g. 5"
                                defaultValue={defaultValues?.paymentDay?.toString()}
                            />
                        </div>
                    </>
                )}

                <div className="grid gap-2 col-span-2">
                    <Label>Card Color</Label>
                    <div className="flex gap-2">
                        {colorOptions.map((color) => (
                            <div
                                key={color.value}
                                className={cn(
                                    "h-8 w-8 rounded-full cursor-pointer ring-offset-2 transition-all",
                                    color.class,
                                    selectedColor === color.value ? "ring-2 ring-indigo-500 scale-110" : "hover:scale-105"
                                )}
                                onClick={() => setSelectedColor(color.value)}
                            >
                                {selectedColor === color.value && <Check className="w-4 h-4 text-white m-auto mt-2" />}
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="color" value={selectedColor} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{isEdit ? 'Save Changes' : 'Create Account'}</Button>
            </div>
        </form>
    )
}
