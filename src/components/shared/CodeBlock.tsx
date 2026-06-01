"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";

export function CodeBlock(props: React.ComponentProps<"pre">) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    const handleCopy = () => {
        const text = preRef.current?.textContent ?? "";
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                aria-label="Скопировать код"
            >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre ref={preRef} {...props} />
        </div>
    );
}
