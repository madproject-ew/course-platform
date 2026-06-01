"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseItem = {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    freeModules: number;
    isPublished: boolean;
    _count: { access: number; transactions: number };
};

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", description: "", price: 0, freeModules: 1 });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = () => {
        fetch("/api/admin/courses")
            .then((r) => r.json())
            .then((data) => setCourses(data.courses || []))
            .catch(() => {});
    };

    const startEdit = (course: CourseItem) => {
        setEditing(course.id);
        setForm({
            title: course.title,
            description: course.description,
            price: course.price,
            freeModules: course.freeModules,
        });
    };

    const saveEdit = async () => {
        if (!editing) return;

        await fetch("/api/admin/courses", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editing, ...form }),
        });

        setEditing(null);
        fetchCourses();
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold">Управление курсами</h1>

            <div className="space-y-6">
                {courses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                                        {course.isPublished ? "Опубликован" : "Скрыт"}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEdit(course)}
                                    >
                                        Редактировать
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editing === course.id ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Название</label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Описание</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Цена (руб)</label>
                                            <input
                                                type="number"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
                                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Бесплатных модулей</label>
                                            <input
                                                type="number"
                                                value={form.freeModules}
                                                onChange={(e) => setForm({ ...form, freeModules: parseInt(e.target.value) })}
                                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={saveEdit}>Сохранить</Button>
                                        <Button variant="outline" onClick={() => setEditing(null)}>
                                            Отмена
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-6 text-sm text-muted-foreground">
                                    <span>Slug: {course.slug}</span>
                                    <span>Цена: {course.price.toLocaleString("ru-RU")} &#8381;</span>
                                    <span>Бесплатных модулей: {course.freeModules}</span>
                                    <span>Доступов: {course._count.access}</span>
                                    <span>Транзакций: {course._count.transactions}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {courses.length === 0 && (
                    <p className="text-center text-muted-foreground py-12">Нет курсов в базе данных</p>
                )}
            </div>
        </div>
    );
}
