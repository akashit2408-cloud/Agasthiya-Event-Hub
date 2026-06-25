"use client";

import { ChevronLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WhatsAppPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase.from("whatsapp_templates").select("*").eq("is_active", true).order("name");
      if (!error && data) setTemplates(data);
    }
    fetchTemplates().catch((err) => console.error("Error fetching WhatsApp templates:", err));
  }, []);

  const renderTemplateBody = (body: string) => {
    if (!body) return null;
    const parts = body.replace(/\\n/g, '\n').split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        return (
          <span key={index} className="inline-block bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px] mx-0.5 align-middle border border-blue-100">
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">WhatsApp Templates</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {templates.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No templates yet.</p>
        ) : templates.map((template) => (
          <div key={template.id} className="bg-card p-4 rounded-3xl border border-gray-50 space-y-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-green-600" size={20} />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{template.name}</h4>
                <p className="text-[10px] font-black text-primary uppercase">{template.audience}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
              {renderTemplateBody(template.body)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
