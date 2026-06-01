"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserDetail = {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    courseAccess: {
        id: string;
        expiresAt: string;
        grantedBy: string | null;
        course: { id: string; title: string; slug: string };
    }[];
    transactions: {
        id: string;
        amount: number;
        status: string;
        createdAt: string;
        course: { title: string };
    }[];
};

type AvailableCourse = {
    id: string;
    title: string;
    slug: string;
};

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [user, setUser] = useState<UserDetail | null>(null);
    const [courses, setCourses] = useState<AvailableCourse[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        fetch(`/api/admin/users/${id}`)
            .then((r) => r.json())
            .then((data) => setUser(data.user))
            .catch(() => {});

        fetch("/api/admin/courses")
            .then((r) => r.json())
            .then((data) => setCourses(data.courses || []))
            .catch(() => {});
    }, [id]);

    const grantAccess = async () => {
        if (!selectedCourse || !user) return;

        await fetch("/api/admin/access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, courseId: selectedCourse }),
        });

        // Refresh user data
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        setUser(data.user);
        setSelectedCourse("");
    };

    const revokeAccess = async (courseId: string) => {
        if (!user) return;

        await fetch("/api/admin/access", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, courseId }),
        });

        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        setUser(data.user);
    };

    if (!user) return <div className="container mx-auto px-4 py-12">Загрузка...</div>;

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Пользователь</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">ID:</span> {user.id}</p>
                        <p><span className="text-muted-foreground">Имя:</span> {user.name}</p>
                        <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                        <p>
                            <span className="text-muted-foreground">Роль:</span>{" "}
                            <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Email верифицирован:</span>{" "}
                            {user.emailVerified ? "Да" : "Нет"}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Регистрация:</span>{" "}
                            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Доступ к курсам</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.courseAccess.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет доступа к курсам</p>
                        ) : (
                            <ul className="space-y-3">
                                {user.courseAccess.map((access) => (
                                    <li key={access.id} className="flex items-center justify-between text-sm border-b pb-3">
                                        <div>
                                            <p className="font-medium">{access.course.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                До: {new Date(access.expiresAt).toLocaleDateString("ru-RU")}
                                                {access.grantedBy && ` | ${access.grantedBy}`}
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => revokeAccess(access.course.id)}
                                        >
                                            Отозвать
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Выберите курс...</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <Button onClick={grantAccess} disabled={!selectedCourse}>
                                Выдать доступ
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Транзакции</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.transactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет транзакций</p>
                        ) : (
                            <div className="space-y-3">
                                {user.transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.course.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString("ru-RU")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p>{tx.amount.toLocaleString("ru-RU")} &#8381;</p>
                                            <Badge
                                                variant={tx.status === "completed" ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {tx.status}
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
