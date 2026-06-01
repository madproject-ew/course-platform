"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export function BuyButtonClient({ courseSlug }: { courseSlug: string }) {
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/payments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseSlug }),
            });

            const data = await res.json();

            if (res.ok && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                alert(data.error || "Ошибка при создании платежа");
            }
        } catch {
            alert("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleBuy} disabled={loading} className="w-full">
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
            )}
            {loading ? "Переход к оплате..." : "Купить курс"}
        </Button>
    );
}
