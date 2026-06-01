import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getModuleNumber } from "@/lib/courses-loader";

const CONTENT_DIR = path.join(process.cwd(), "content/courses");

const MIME: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
};

type Params = {
    params: Promise<{ slug: string; module: string; filename: string }>;
};

export async function GET(_req: Request, { params }: Params) {
    const { slug, module: moduleSlug, filename } = await params;

    // Access check for paid module images
    const moduleNum = getModuleNumber(moduleSlug);
    const dbCourse = await db.course.findUnique({ where: { slug } }).catch(() => null);
    const freeModules = dbCourse?.freeModules ?? 1;

    if (moduleNum > freeModules) {
        const session = await getSession();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
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
                return new NextResponse("Forbidden", { status: 403 });
            }
        }
    }

    const filePath = path.join(CONTENT_DIR, slug, moduleSlug, "images", filename);
    const resolved = path.resolve(filePath);

    if (!resolved.startsWith(path.resolve(CONTENT_DIR))) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(resolved)) {
        return new NextResponse("Not found", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const buffer = fs.readFileSync(resolved);

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
