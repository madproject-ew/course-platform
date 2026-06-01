import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/courses");

export type LessonMeta = {
    slug: string;
    title: string;
    type: "article" | "demo" | "task";
    url?: string;
};

export type ModuleMeta = {
    slug: string;
    title: string;
    description?: string;
    number: number;
    lessonsCount: number;
    lessons: LessonMeta[];
};

export type TextCourse = {
    slug: string;
    title: string;
    description?: string;
    url?: string;
    highlights?: string[];
    modulesCount: number;
    lessonsCount: number;
    modules: ModuleMeta[];
};

export function getTextCourses(): TextCourse[] {
    if (!fs.existsSync(CONTENT_DIR)) return [];

    const courseDirs = fs.readdirSync(CONTENT_DIR).filter((name) => {
        const fullPath = path.join(CONTENT_DIR, name);
        return fs.statSync(fullPath).isDirectory();
    });

    return courseDirs.map((slug) => getTextCourse(slug)!).filter(Boolean);
}

export function getTextCourse(slug: string): TextCourse | null {
    const courseDir = path.join(CONTENT_DIR, slug);
    const metaPath = path.join(courseDir, "_meta.json");

    if (!fs.existsSync(metaPath)) return null;

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const modules = getModules(courseDir);
    const lessonsCount = modules.reduce((sum, m) => sum + m.lessonsCount, 0);

    return {
        slug,
        title: meta.title,
        description: meta.description,
        url: meta.url,
        highlights: meta.highlights,
        modulesCount: modules.length,
        lessonsCount,
        modules,
    };
}

function getModules(courseDir: string): ModuleMeta[] {
    const entries = fs.readdirSync(courseDir).filter((name) => {
        const fullPath = path.join(courseDir, name);
        return fs.statSync(fullPath).isDirectory() && name !== "images";
    });

    return entries.sort().map((dirName) => {
        const moduleDir = path.join(courseDir, dirName);
        const metaPath = path.join(moduleDir, "_meta.json");
        const meta = fs.existsSync(metaPath)
            ? JSON.parse(fs.readFileSync(metaPath, "utf-8"))
            : { title: dirName, number: 0 };

        const lessons = getLessons(moduleDir);

        return {
            slug: dirName,
            title: meta.title,
            description: meta.description,
            number: meta.number ?? 0,
            lessonsCount: lessons.length,
            lessons,
        };
    });
}

function getLessons(moduleDir: string): LessonMeta[] {
    const files = fs.readdirSync(moduleDir).filter((f) => f.endsWith(".mdx"));

    return files.sort().map((fileName) => {
        const filePath = path.join(moduleDir, fileName);
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(raw);

        return {
            slug: fileName.replace(/\.mdx$/, ""),
            title: data.title || fileName,
            type: data.type || "article",
            url: data.url,
        };
    });
}

export function getLessonContent(
    courseSlug: string,
    moduleSlug: string,
    lessonSlug: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): { frontmatter: Record<string, any>; content: string } | null {
    const filePath = path.join(
        CONTENT_DIR,
        courseSlug,
        moduleSlug,
        `${lessonSlug}.mdx`
    );

    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return { frontmatter: data as Record<string, string>, content };
}

export function getModuleNumber(moduleSlug: string): number {
    const match = moduleSlug.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : 0;
}
