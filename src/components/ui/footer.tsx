import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-8">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <p>&copy; {new Date().getFullYear()} EW Production. All rights reserved</p>
                    <nav className="flex gap-4">
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            Условия использования
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            Политика конфиденциальности
                        </Link>
                    </nav>
                </div>
                <p className="text-xs text-muted-foreground/70">
                    Москалёв Алексей Дмитриевич ИНН: 250814185710
                </p>
            </div>
        </footer>
    );
}
