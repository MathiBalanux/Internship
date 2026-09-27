import { useEffect, useState } from "react";
import { api, fileUrl } from "../api";
import { StatusPill } from "../components/ui";

export function ActivityPage({ role = "student" }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get("/activities").then((r) => setItems(r.data || [])).catch(() => setItems([]));
    }, [role]);

    return (
        <div className="card space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Activity timeline</h2>
                <span className="text-sm text-slate-500">{items.length} updates</span>
            </div>
            <div className="space-y-3">
                {items.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
                {items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{item.action}</p>
                            <StatusPill value={item.entityType || "general"} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DocumentsPage({ role = "student" }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get("/documents").then((r) => setItems(r.data || [])).catch(() => setItems([]));
    }, [role]);

    return (
        <div className="card space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Document center</h2>
                <span className="text-sm text-slate-500">{items.length} files</span>
            </div>
            <div className="space-y-3">
                {items.length === 0 && <p className="text-sm text-slate-500">No documents uploaded yet.</p>}
                {items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-medium">{item.title || item.fileName}</p>
                                <p className="text-xs text-slate-500">{item.kind || "document"}</p>
                            </div>
                            <StatusPill value={item.status || "submitted"} />
                        </div>
                        {item.url && (
                            <a href={fileUrl(item.url)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 underline">
                                Open document
                            </a>
                        )}
                        {item.reviewNote && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review note: {item.reviewNote}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
