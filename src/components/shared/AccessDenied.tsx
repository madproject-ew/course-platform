"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, LogIn, CreditCard } from "lucide-react";

type AccessDeniedProps = {
  type: "login" | "payment";
  courseSlug?: string;
  courseTitle?: string;
  price?: number;
};

export function AccessDenied({ type, courseSlug, courseTitle, price }: AccessDeniedProps) {
  const handleBuy = async () => {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug }),
    });

    if (res.ok) {
      const data = await res.json();
      window.location.href = data.paymentUrl;
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-24">
      <Card>
        <CardContent className="flex flex-col items-center text-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="text-xl font-semibold">Доступ ограничен</h2>

          {type === "login" ? (
            <>
              <p className="text-muted-foreground">
                Для просмотра этого урока необходимо войти в аккаунт
              </p>
              <Button asChild className="w-full max-w-xs">
                <Link href={`/login?callbackUrl=/course/${courseSlug}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link href="/register" className="text-primary underline underline-offset-2">
                  Зарегистрироваться
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Этот урок доступен в составе курса{" "}
                <span className="font-medium text-foreground">{courseTitle}</span>
              </p>
              <div className="text-3xl font-bold">
                {price?.toLocaleString("ru-RU")} &#8381;
              </div>
              <p className="text-sm text-muted-foreground">Доступ на 2 года</p>
              <Button onClick={handleBuy} className="w-full max-w-xs">
                <CreditCard className="mr-2 h-4 w-4" />
                Купить курс
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
