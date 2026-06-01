"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

type UserItem = {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    _count: { courseAccess: number; transactions: number };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    pages: number;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = () => {
        const params = new URLSearchParams({ page: page.toString(), search });
        fetch(`/api/admin/users?${params}`)
            .then((r) => r.json())
            .then((data) => {
                setUsers(data.users || []);
                setPagination(data.pagination);
            })
            .catch(() => {});
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Пользователи</h1>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Поиск по email или имени..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full rounded-md border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{user.name}</span>
                                    {user.role === "admin" && (
                                        <Badge variant="destructive" className="text-xs">admin</Badge>
                                    )}
                                    {!user.emailVerified && (
                                        <Badge variant="secondary" className="text-xs">не верифицирован</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">
                                    Регистрация: {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                                    {" | "}Курсов: {user._count.courseAccess}
                                    {" | "}Транзакций: {user._count.transactions}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/users/${user.id}`}>Подробнее</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {pagination.pages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.pages}
                    >
                        Далее
                    </Button>
                </div>
            )}
        </div>
    );
}
