"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/shared/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TransactionItem = {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    course: { title: string };
};

type CourseAccessItem = {
    id: string;
    expiresAt: string;
    grantedBy: string | null;
    course: { title: string; slug: string };
};

export default function ProfilePage() {
    const { session } = useSession();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [courseAccess, setCourseAccess] = useState<CourseAccessItem[]>([]);

    useEffect(() => {
        fetch("/api/profile/data")
            .then((r) => r.json())
            .then((data) => {
                setTransactions(data.transactions || []);
                setCourseAccess(data.courseAccess || []);
            })
            .catch(() => {});
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg("");
        setPasswordError("");

        const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
            setPasswordMsg(data.message);
            setCurrentPassword("");
            setNewPassword("");
        } else {
            setPasswordError(data.error);
        }
    };

    if (!session) return null;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Профиль</h1>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">
                            <span className="text-muted-foreground">Email: </span>
                            {session.email}
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Имя: </span>
                            {session.name || "---"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Мои курсы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courseAccess.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет купленных курсов</p>
                        ) : (
                            <ul className="space-y-3">
                                {courseAccess.map((access) => (
                                    <li key={access.id} className="flex items-center justify-between text-sm">
                                        <span>{access.course.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                            до {new Date(access.expiresAt).toLocaleDateString("ru-RU")}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Сменить пароль</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label htmlFor="current" className="text-sm font-medium">Текущий пароль</label>
                                <input
                                    id="current"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label htmlFor="new" className="text-sm font-medium">Новый пароль</label>
                                <input
                                    id="new"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Минимум 8 символов, 1 заглавная буква, 1 спецсимвол
                                </p>
                            </div>

                            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                            {passwordMsg && <p className="text-sm text-green-600">{passwordMsg}</p>}

                            <Button type="submit">Сменить пароль</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>История транзакций</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет транзакций</p>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.course.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString("ru-RU")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{tx.amount.toLocaleString("ru-RU")} &#8381;</p>
                                            <Badge
                                                variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}
                                                className="text-xs"
                                            >
                                                {tx.status === "completed" ? "Оплачен" : tx.status === "pending" ? "Ожидание" : "Ошибка"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
