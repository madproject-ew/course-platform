import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTextCourse, getLessonContent, getModuleNumber } from "@/lib/courses-loader";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ComponentProps } from "react";
import Image from "next/image";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { Quiz } from "@/components/shared/Quiz";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string; module: string; lesson: string }>;
};

function MdxImage(props: React.ComponentProps<typeof Image>) {
    return (
        <figure className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                {...(props as React.ComponentProps<"img">)}
                alt={props.alt || ""}
                className="rounded-lg max-w-full"
            />
            {props.alt && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                    {props.alt}
                </figcaption>
            )}
        </figure>
    );
}

const mdxComponents = {
    img: MdxImage,
    pre: CodeBlock,
    // Аккуратные таблицы вместо «чёрточек» (GFM включён через remark-gfm).
    table: (props: ComponentProps<"table">) => (
        <div className="not-prose my-6 overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    thead: (props: ComponentProps<"thead">) => (
        <thead className="bg-muted/60 text-foreground" {...props} />
    ),
    th: (props: ComponentProps<"th">) => (
        <th className="border-b px-4 py-2.5 text-left font-semibold" {...props} />
    ),
    td: (props: ComponentProps<"td">) => (
        <td className="border-b px-4 py-2.5 align-top" {...props} />
    ),
    tr: (props: ComponentProps<"tr">) => (
        <tr className="last:[&>td]:border-b-0 even:bg-muted/20" {...props} />
    ),
};

export default async function LessonPage({ params }: Props) {
    const { slug, module: moduleSlug, lesson: lessonSlug } = await params;

    const course = getTextCourse(slug);
    if (!course) notFound();

    const currentModule = course.modules.find((m) => m.slug === moduleSlug);
    if (!currentModule) notFound();

    // Access check
    const moduleNum = getModuleNumber(moduleSlug);
    const dbCourse = await db.course.findUnique({ where: { slug } }).catch(() => null);
    const freeModules = dbCourse?.freeModules ?? 1;
    const isFreeModule = moduleNum <= freeModules;

    if (!isFreeModule) {
        const session = await getSession();

        if (!session) {
            return <AccessDenied type="login" courseSlug={slug} />;
        }

        if (dbCourse) {
            const access = await db.courseAccess.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.userId,
                        courseId: dbCourse.id,
                    },
                },
            }).catch(() => null);

            if (!access || access.expiresAt <= new Date()) {
                return (
                    <AccessDenied
                        type="payment"
                        courseSlug={slug}
                        courseTitle={course.title}
                        price={dbCourse.price}
                    />
                );
            }
        }
    }

    const lessonData = getLessonContent(slug, moduleSlug, lessonSlug);
    if (!lessonData) notFound();

    const currentLessonIndex = currentModule.lessons.findIndex((l) => l.slug === lessonSlug);
    const currentLesson = currentModule.lessons[currentLessonIndex];

    // Build flat list of all lessons for prev/next navigation
    const allLessons: { moduleSlug: string; lessonSlug: string; title: string }[] = [];
    for (const mod of course.modules) {
        for (const l of mod.lessons) {
            allLessons.push({ moduleSlug: mod.slug, lessonSlug: l.slug, title: l.title });
        }
    }
    const globalIndex = allLessons.findIndex(
        (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
    );
    const prevLesson = globalIndex > 0 ? allLessons[globalIndex - 1] : null;
    const nextLesson = globalIndex < allLessons.length - 1 ? allLessons[globalIndex + 1] : null;

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
                <Link href={`/course/${slug}`} className="hover:text-foreground transition-colors">
                    {course.title}
                </Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="truncate">{currentModule.title}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-foreground truncate">{currentLesson?.title}</span>
            </nav>

            <article className="prose max-w-none mb-12">
                <MDXRemote
                    source={lessonData.content}
                    components={mdxComponents}
                    options={{ mdxOptions: { remarkPlugins: [remarkGfm], format: "md" } }}
                />
            </article>

            {lessonData.frontmatter.quiz && (
                <Quiz questions={lessonData.frontmatter.quiz} />
            )}

            <div className="flex items-center justify-between border-t pt-8">
                {prevLesson ? (
                    <Button variant="ghost" asChild>
                        <Link href={`/course/${slug}/${prevLesson.moduleSlug}/${prevLesson.lessonSlug}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Link>
                    </Button>
                ) : (
                    <div />
                )}
                {nextLesson ? (
                    <Button asChild>
                        <Link href={`/course/${slug}/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}>
                            Далее
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" asChild>
                        <Link href={`/course/${slug}`}>
                            К содержанию курса
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
