"use client";

import { ChevronLeft, MessageSquare, Copy, Edit3, Plus, Check, Trash2, X, Sparkles, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Template {
  id: string;
  name: string;
  audience: string;
  body: string;
  is_active: boolean;
}

export default function WhatsAppPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .order("name");
    
    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  }

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (template?: Template) => {
    if (template) {
      setEditingTemplate({ ...template });
    } else {
      setEditingTemplate({
        name: "",
        audience: "Team",
        body: "",
        is_active: true
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name || !editingTemplate?.body) {
      alert("Please enter both a name and template body.");
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate.id) {
        // Update existing
        const { error } = await supabase
          .from("whatsapp_templates")
          .update({
            name: editingTemplate.name,
            audience: editingTemplate.audience,
            body: editingTemplate.body,
            is_active: editingTemplate.is_active ?? true
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("whatsapp_templates")
          .insert([{
            name: editingTemplate.name,
            audience: editingTemplate.audience || "Team",
            body: editingTemplate.body,
            is_active: true
          }]);

        if (error) throw error;
      }

      setEditModalOpen(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err: any) {
      console.error("Error saving template:", err);
      alert("Failed to save template: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const { error } = await supabase.from("whatsapp_templates").delete().eq("id", id);
      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err: any) {
      alert("Failed to delete template: " + err.message);
    }
  };

  // Helper to format WhatsApp text (*bold*, _italic_, placeholders)
  const renderFormattedWhatsAppText = (text: string) => {
    if (!text) return null;

    // Split lines
    const lines = text.split("\n");

    return lines.map((line, lIdx) => {
      // Process variables {{var}}
      const parts = line.split(/(\{\{[^}]+\}\})/g);
      
      const processedLine = parts.map((part, pIdx) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          const varName = part.slice(2, -2);
          return (
            <span
              key={pIdx}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mx-0.5 shadow-xs"
            >
              {varName}
            </span>
          );
        }

        // Process *bold* text
        const boldParts = part.split(/(\*[^*]+\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith("*") && bPart.endsWith("*") && bPart.length > 2) {
            return (
              <strong key={bIdx} className="font-bold text-gray-950">
                {bPart.slice(1, -1)}
              </strong>
            );
          }
          return bPart;
        });
      });

      return (
        <div key={lIdx} className="min-h-[1.2em]">
          {processedLine}
        </div>
      );
    });
  };

  const filteredTemplates = activeTab === "All"
    ? templates
    : templates.filter(t => t.audience.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-emerald-700 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-emerald-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">WhatsApp Templates</h1>
              <p className="text-[11px] text-emerald-200">Format & share event updates</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["All", "Team", "Customer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab} {tab === "All" ? `(${templates.length})` : ""}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="p-4 max-w-2xl mx-auto w-full space-y-5">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <MessageSquare className="mx-auto text-slate-300" size={40} />
            <p className="text-sm font-bold text-slate-700">No WhatsApp templates found</p>
            <p className="text-xs text-slate-500">Click "New" to create your first template format.</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card Top Header */}
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    template.audience.toLowerCase() === "customer"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {template.audience}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">{template.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(template)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="Copy Template Text"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-[11px] font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(template)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Template"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* WhatsApp Chat Bubble Card Preview */}
              <div className="p-4 bg-[#efeae2] relative" style={{ backgroundImage: "radial-gradient(#d1c7bd 0.75px, transparent 0.75px)", backgroundSize: "12px 12px" }}>
                <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm max-w-[95%] relative border border-emerald-950/5">
                  <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {renderFormattedWhatsAppText(template.body)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                    <span>12:00 PM</span>
                    <span className="text-emerald-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Tag Info */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles size={12} className="text-amber-500" />
                  Auto-populates when sharing events
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {template.body.split("{{").length - 1} Variables
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {editModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <h3 className="font-bold text-base">
                  {editingTemplate.id ? "Edit WhatsApp Template" : "New WhatsApp Template"}
                </h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-emerald-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Event Confirmation"
                  value={editingTemplate.name || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Audience / Category
                </label>
                <select
                  value={editingTemplate.audience || "Team"}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, audience: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                >
                  <option value="Team">Team / Staff</option>
                  <option value="Customer">Customer</option>
                  <option value="Rental">Rental</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message Body
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Use *bold* for bold text</span>
                </div>
                <textarea
                  rows={10}
                  placeholder="Type your WhatsApp message format here...\nUse {{title}}, {{event_date}}, {{location}}, etc."
                  value={editingTemplate.body || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed bg-slate-50/50"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  💡 Available Placeholders:
                </span>
                <p className="font-mono text-[10px] text-emerald-700">
                  {"{{title}}, {{event_type}}, {{event_date}}, {{event_time}}, {{reporting_time}}, {{location}}, {{map_link}}, {{customer_name}}, {{customer_mobile}}, {{setup_name}}, {{crew_list}}, {{notes}}"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

