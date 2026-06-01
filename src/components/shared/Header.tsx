"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "./SessionProvider";
import { User, LogOut, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PORTFOLIO_URL = "https://iam.ew-production.ru";

const navItems = [
    { href: PORTFOLIO_URL, label: "Обо мне", external: true },
    { href: `${PORTFOLIO_URL}/cases`, label: "Кейсы", external: true },
    { href: "/", label: "Курсы" },
];

export function Header() {
    const pathname = usePathname();
    const { session, loading } = useSession();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <a href={PORTFOLIO_URL} className="text-xl font-bold" aria-label="I AM - на главную">
                    I AM
                </a>

                <nav aria-label="Основная навигация" className="flex items-center gap-3 sm:gap-6">
                    {navItems.map((item) =>
                        item.external ? (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {!loading && (
                        session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <User className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-2 py-1.5 text-sm font-medium truncate">
                                        {session.email}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Профиль
                                        </Link>
                                    </DropdownMenuItem>
                                    {session.role === "admin" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Админ-панель
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Выйти
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/login">Войти</Link>
                            </Button>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
