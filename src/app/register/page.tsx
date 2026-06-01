"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/components/shared/OAuthButtons";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push("/verify-email?registered=true");
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Регистрация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <OAuthButtons />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">или</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="text-sm font-medium">Имя</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Ваше имя"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Минимум 8 символов, 1 заглавная буква, 1 спецсимвол
                            </p>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Регистрация..." : "Зарегистрироваться"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Уже есть аккаунт?{" "}
                        <Link href="/login" className="text-primary underline underline-offset-2">
                            Войти
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
