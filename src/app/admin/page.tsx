"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

type Stats = {
    totalUsers: number;
    totalCourses: number;
    totalTransactions: number;
    totalRevenue: number;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(() => {});
    }, []);

    const cards = [
        {
            title: "Пользователи",
            value: stats?.totalUsers ?? "...",
            icon: Users,
            href: "/admin/users",
        },
        {
            title: "Курсы",
            value: stats?.totalCourses ?? "...",
            icon: BookOpen,
            href: "/admin/courses",
        },
        {
            title: "Транзакции",
            value: stats?.totalTransactions ?? "...",
            icon: CreditCard,
            href: "#",
        },
        {
            title: "Выручка",
            value: stats ? `${stats.totalRevenue.toLocaleString("ru-RU")} \u20BD` : "...",
            icon: TrendingUp,
            href: "#",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Админ-панель</h1>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Link key={card.title} href={card.href}>
                        <Card className="transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <card.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
