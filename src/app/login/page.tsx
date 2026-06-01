"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/components/shared/OAuthButtons";
import { useSession } from "@/components/shared/SessionProvider";

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const { refresh } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setNeedsVerification(false);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.needsVerification) {
                    setNeedsVerification(true);
                }
                setError(data.error);
                return;
            }

            await refresh();
            router.push(callbackUrl);
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        await fetch("/api/auth/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setError("Письмо отправлено повторно");
        setNeedsVerification(false);
    };

    return (
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Вход</CardTitle>
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
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        {needsVerification && (
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                className="text-sm text-primary underline underline-offset-2"
                            >
                                Отправить письмо повторно
                            </button>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Вход..." : "Войти"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Нет аккаунта?{" "}
                        <Link href="/register" className="text-primary underline underline-offset-2">
                            Зарегистрироваться
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
