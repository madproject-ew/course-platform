import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Code, PenLine, Lock, CreditCard, ExternalLink, CheckCircle, Award, BookOpen, Play, Construction, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTextCourse } from "@/lib/courses-loader";
import { getModuleNumber } from "@/lib/courses-loader";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AUTHORED_COURSES, CONTACTS } from "@/lib/data";
import { BuyButtonClient } from "@/components/shared/BuyButton";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: Props) {
    const { slug } = await params;

    // Check authored courses first
    const authoredCourse = AUTHORED_COURSES.find((c) => c.id === slug);
    if (authoredCourse) return <AuthoredCourseView course={authoredCourse} />;

    const course = getTextCourse(slug);
    if (!course) notFound();

    const session = await getSession();

    // Get course info from DB
    const dbCourse = await db.course.findUnique({
        where: { slug },
    }).catch(() => null);

    const freeModules = dbCourse?.freeModules ?? 1;
    const price = dbCourse?.price ?? 2499;

    // Check user access
    let hasAccess = false;
    if (session && dbCourse) {
        const access = await db.courseAccess.findUnique({
            where: {
                userId_courseId: {
                    userId: session.userId,
                    courseId: dbCourse.id,
                },
            },
        }).catch(() => null);

        hasAccess = !!access && access.expiresAt > new Date();
    }

    // Снят с публикации — скрываем (кроме тех, у кого уже куплен доступ)
    if (dbCourse && !dbCourse.isPublished && !hasAccess) notFound();

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Все курсы
                </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{course.title}</h1>
                    <p className="mb-8 text-lg text-muted-foreground">
                        {course.modulesCount} модулей, {course.lessonsCount} уроков
                    </p>

                    {course.highlights && course.highlights.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-2">
                            {course.highlights.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    )}

                    <div className="space-y-6">
                        {course.modules.map((module) => {
                            const moduleNum = getModuleNumber(module.slug);
                            const isFree = moduleNum <= freeModules;
                            const isLocked = !isFree && !hasAccess;

                            return (
                                <Card key={module.slug}>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">
                                                <span className="mr-2 text-primary">{module.number}.</span>
                                                {module.title}
                                            </CardTitle>
                                            {isFree && (
                                                <Badge variant="outline" className="text-xs text-green-600 border-green-600/30">
                                                    Бесплатно
                                                </Badge>
                                            )}
                                            {isLocked && (
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {module.lessons.map((lesson) => {
                                                const Icon = lesson.type === "task" ? PenLine
                                                    : lesson.type === "demo" ? Code
                                                    : FileText;

                                                if (isLocked) {
                                                    return (
                                                        <li key={lesson.slug} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                                                            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                                            {lesson.title}
                                                        </li>
                                                    );
                                                }

                                                return (
                                                    <li key={lesson.slug}>
                                                        <Link
                                                            href={`/course/${course.slug}/${module.slug}/${lesson.slug}`}
                                                            className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" aria-hidden="true" />
                                                            {lesson.title}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <aside className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        {!hasAccess && (
                            <Card>
                                <CardContent className="space-y-4 pt-6 text-center">
                                    <p className="text-3xl font-bold">{price.toLocaleString("ru-RU")} &#8381;</p>
                                    <p className="text-sm text-muted-foreground">Доступ на 2 года</p>
                                    {session ? (
                                        <BuyButton courseSlug={slug} />
                                    ) : (
                                        <Button asChild className="w-full">
                                            <Link href={`/login?callbackUrl=/course/${slug}`}>
                                                Войти для покупки
                                            </Link>
                                        </Button>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Первый модуль доступен бесплатно без регистрации
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {hasAccess && (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Badge className="bg-green-600 text-white mb-2">Куплен</Badge>
                                    <p className="text-sm text-muted-foreground">Все модули доступны</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function BuyButton({ courseSlug }: { courseSlug: string }) {
    return <BuyButtonClient courseSlug={courseSlug} />;
}

function AuthoredCourseView({ course }: { course: (typeof AUTHORED_COURSES)[number] }) {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

    return (
        <div className="container mx-auto px-4 py-12">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Все курсы
                </Link>
            </Button>

            <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <Construction className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Страница на реконструкции</p>
                    <p className="mt-1 text-yellow-700 dark:text-yellow-400/80">
                        Содержание и цена курса уточняются. Если заинтересованы - напишите в{" "}
                        <a
                            href={`https://t.me/${CONTACTS.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
                        >
                            Telegram <Send className="h-3 w-3" />
                        </a>
                        {" "}для предзаказа.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{course.title}</h1>
                    <p className="mb-6 text-lg text-muted-foreground">{course.description}</p>

                    <div className="mb-8 flex flex-wrap gap-2">
                        {course.highlights.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>

                    <div className="mb-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            {course.modules.length} модулей, {totalLessons} уроков
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Play className="h-4 w-4" aria-hidden="true" />
                            Платформа: {course.platform}
                        </span>
                        {course.certificate && (
                            <span className="flex items-center gap-1.5">
                                <Award className="h-4 w-4" aria-hidden="true" />
                                Сертификат
                            </span>
                        )}
                    </div>

                    {course.freeVideoId && (
                        <section className="mb-12">
                            <h2 className="mb-4 text-2xl font-semibold">Бесплатный урок</h2>
                            <div className="aspect-video overflow-hidden rounded-lg">
                                <iframe
                                    src={`https://www.youtube.com/embed/${course.freeVideoId}`}
                                    title={`${course.title} - бесплатный урок`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full"
                                />
                            </div>
                        </section>
                    )}

                    <section className="mb-12">
                        <h2 className="mb-6 text-2xl font-semibold">Содержание курса</h2>
                        <div className="space-y-4">
                            {course.modules.map((module, moduleIndex) => (
                                <Card key={module.title}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            <span className="mr-2 text-primary">{moduleIndex + 1}.</span>
                                            {module.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {module.lessons.map((lesson) => (
                                                <li key={lesson} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" aria-hidden="true" />
                                                    {lesson}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-2">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <Card className="overflow-hidden pt-0">
                            <div className="relative aspect-video">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardContent className="space-y-4 pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold">{course.price}</p>
                                </div>
                                {course.platformLink ? (
                                    <Button size="lg" className="w-full" asChild>
                                        <a href={course.platformLink} target="_blank" rel="noopener noreferrer">
                                            Купить на {course.platform}
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button size="lg" className="w-full" disabled>
                                        Скоро на {course.platform}
                                    </Button>
                                )}
                                {course.freeVideoId && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        Первый урок - бесплатно на YouTube
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {course.certificate && (
                            <Card>
                                <CardContent className="flex items-center gap-4 pt-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Award className="h-6 w-6 text-primary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Сертификат</p>
                                        <p className="text-sm text-muted-foreground">
                                            По окончании курса на {course.platform}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
