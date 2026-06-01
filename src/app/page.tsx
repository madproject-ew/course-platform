import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import { getTextCourses } from "@/lib/courses-loader";
import { AUTHORED_COURSES } from "@/lib/data";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoursesHomePage() {
    const textCourses = getTextCourses();

    // Get course prices from DB
    const dbCourses = await db.course.findMany({
        where: { isPublished: true },
        select: { slug: true, price: true, freeModules: true },
    }).catch(() => []);

    const priceMap = new Map(dbCourses.map((c) => [c.slug, c]));

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold">Курсы</h1>
                <p className="text-lg text-muted-foreground">
                    Авторские курсы по AI и разработке
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {AUTHORED_COURSES.map((course) => (
                    <Card key={course.id} className="group flex flex-col overflow-hidden pt-0 transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="relative aspect-video overflow-hidden">
                            <Image
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            {course.freeVideoId && (
                                <div className="absolute bottom-3 left-3 z-10">
                                    <Badge className="bg-green-600 text-white">
                                        <Play className="mr-1 h-3 w-3" aria-hidden="true" />
                                        Бесплатный урок
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                                <Badge variant="secondary" className="w-fit shrink-0 text-base font-semibold">
                                    {course.price}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {course.description}
                            </p>
                            <div className="mt-auto flex flex-col gap-4">
                                <div className="flex flex-wrap gap-1">
                                    {course.highlights.slice(0, 4).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={`/course/${course.id}`}>
                                        Подробнее
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {textCourses.map((course) => {
                    const dbInfo = priceMap.get(course.slug);
                    const price = dbInfo?.price ?? 2499;
                    const freeModules = dbInfo?.freeModules ?? 1;

                    return (
                        <Card key={course.slug} className="group flex flex-col overflow-hidden pt-0 transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <BookOpen className="h-16 w-16 text-primary/40" />
                            </div>
                            <CardHeader>
                                <div className="flex flex-col gap-2">
                                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="w-fit shrink-0 text-base font-semibold">
                                            {price.toLocaleString("ru-RU")} &#8381;
                                        </Badge>
                                        <Badge variant="outline" className="w-fit shrink-0 text-xs">
                                            {freeModules} модуль бесплатно
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {course.description || `${course.modulesCount} модулей, ${course.lessonsCount} уроков`}
                                </p>
                                <div className="mt-auto flex flex-col gap-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(course.highlights || []).slice(0, 5).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button asChild className="w-full">
                                        <Link href={`/course/${course.slug}`}>
                                            Подробнее
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
