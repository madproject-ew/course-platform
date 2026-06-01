"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Mail } from "lucide-react";

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const registered = searchParams.get("registered");

    if (success) {
        return (
            <div className="container mx-auto flex items-center justify-center px-4 py-24">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-xl font-semibold">Email подтверждён</h1>
                        <p className="text-muted-foreground">
                            Теперь вы можете войти в свой аккаунт
                        </p>
                        <Button asChild className="w-full max-w-xs">
                            <Link href="/login">Войти</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        const errorMessages: Record<string, string> = {
            "missing-token": "Ссылка повреждена",
            "invalid-token": "Ссылка недействительна",
            "expired": "Срок действия ссылки истёк",
        };

        return (
            <div className="container mx-auto flex items-center justify-center px-4 py-24">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-xl font-semibold">Ошибка верификации</h1>
                        <p className="text-muted-foreground">
                            {errorMessages[error] || "Произошла ошибка"}
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/login">Войти и запросить новую ссылку</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (registered) {
        return (
            <div className="container mx-auto flex items-center justify-center px-4 py-24">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-xl font-semibold">Проверьте почту</h1>
                        <p className="text-muted-foreground">
                            Мы отправили ссылку для подтверждения на ваш email. Перейдите по ней, чтобы активировать аккаунт.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}
