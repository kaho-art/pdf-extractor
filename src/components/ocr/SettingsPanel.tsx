"use client";

import React from "react";
import { Settings, Languages, AlignLeft, Columns, Zap, FileOutput } from "lucide-react";
import type { OCRSettings, TextDirection, ColumnLayout, OCRPrecision, OutputFormat } from "@/types";

interface SettingsPanelProps {
  settings: OCRSettings;
  onChange: (s: OCRSettings) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { value: "jpn", label: "日本語（横書き）" },
  { value: "jpn_vert", label: "日本語（縦書き）" },
  { value: "eng", label: "English" },
  { value: "chi_sim", label: "中文（简体）" },
  { value: "chi_tra", label: "中文（繁體）" },
  { value: "kor", label: "한국어" },
];

const DIRECTIONS: { value: TextDirection; label: string }[] = [
  { value: "auto", label: "🤖 自動判定" },
  { value: "horizontal-lr", label: "→ 横書き（左→右）" },
  { value: "horizontal-rl", label: "← 横書き（右→左）" },
  { value: "vertical-td", label: "↓ 縦書き（上→下）" },
  { value: "vertical-rl", label: "↙ 縦書き（右→左列）" },
];

const COLUMNS: { value: ColumnLayout; label: string }[] = [
  { value: "auto", label: "🤖 自動判定" },
  { value: 1, label: "1段組み" },
  { value: 2, label: "2段組み" },
  { value: 3, label: "3段組み" },
];

const PRECISIONS: { value: OCRPrecision; label: string; desc: string }[] = [
  { value: "fast", label: "⚡ 高速", desc: "速度優先" },
  { value: "balanced", label: "⚖️ 標準", desc: "バランス" },
  { value: "accurate", label: "🎯 高精度", desc: "精度優先" },
];

const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "plain", label: "プレーンテキスト" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
];

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-ink-400">{icon}</span>
      <span className="text-xs font-bold tracking-widest text-ink-500 uppercase">{children}</span>
    </div>
  );
}

function Select({
  value, onChange, options, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg border border-paper-300 bg-paper-50 text-ink-800 text-sm
        focus:outline-none focus:ring-2 focus:ring-ink-400 disabled:opacity-50 disabled:cursor-not-allowed
        appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({
  checked, onChange, label, disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50" : ""}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? "bg-ink-600" : "bg-paper-300"}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm text-ink-700">{label}</span>
    </label>
  );
}

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  const update = <K extends keyof OCRSettings>(key: K, value: OCRSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <aside className="w-72 shrink-0 bg-paper-100 border-r border-paper-300 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-paper-300">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-ink-500" />
          <span className="font-display font-bold text-ink-800 text-base tracking-wide">OCR 設定</span>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Language */}
        <div>
          <SectionTitle icon={<Languages size={14} />}>言語</SectionTitle>
          <Select
            value={settings.language}
            onChange={(v) => update("language", v)}
            options={LANGUAGES}
            disabled={disabled}
          />
        </div>

        {/* Direction */}
        <div>
          <SectionTitle icon={<AlignLeft size={14} />}>文字方向</SectionTitle>
          <div className="space-y-1.5">
            {DIRECTIONS.map((d) => (
              <label
                key={d.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors
                  ${settings.direction === d.value
                    ? "bg-ink-800 text-paper-50"
                    : "bg-paper-50 text-ink-700 hover:bg-paper-200"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="direction"
                  value={d.value}
                  checked={settings.direction === d.value}
                  onChange={() => update("direction", d.value)}
                  disabled={disabled}
                />
                {d.label}
              </label>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div>
          <SectionTitle icon={<Columns size={14} />}>段組み</SectionTitle>
          <div className="grid grid-cols-2 gap-1.5">
            {COLUMNS.map((c) => (
              <label
                key={String(c.value)}
                className={`text-center px-2 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors
                  ${settings.columns === c.value
                    ? "bg-ink-700 text-paper-50"
                    : "bg-paper-50 text-ink-700 border border-paper-300 hover:bg-paper-200"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input type="radio" className="sr-only" name="columns" value={String(c.value)}
                  checked={settings.columns === c.value}
                  onChange={() => update("columns", c.value)}
                  disabled={disabled} />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        {/* Precision */}
        <div>
          <SectionTitle icon={<Zap size={14} />}>OCR精度</SectionTitle>
          <div className="grid grid-cols-3 gap-1">
            {PRECISIONS.map((p) => (
              <label key={p.value}
                className={`text-center px-1 py-2 rounded-lg cursor-pointer transition-colors
                  ${settings.precision === p.value
                    ? "bg-ink-700 text-paper-50"
                    : "bg-paper-50 text-ink-700 border border-paper-300 hover:bg-paper-200"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input type="radio" className="sr-only" name="precision" value={p.value}
                  checked={settings.precision === p.value}
                  onChange={() => update("precision", p.value)}
                  disabled={disabled} />
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] opacity-70">{p.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Output format */}
        <div>
          <SectionTitle icon={<FileOutput size={14} />}>出力形式</SectionTitle>
          <Select
            value={settings.outputFormat}
            onChange={(v) => update("outputFormat", v as OutputFormat)}
            options={OUTPUT_FORMATS}
            disabled={disabled}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-paper-300">
          <Toggle
            checked={settings.autoDetect}
            onChange={(v) => update("autoDetect", v)}
            label="自動判定を優先"
            disabled={disabled}
          />
          <Toggle
            checked={settings.removeRuby}
            onChange={(v) => update("removeRuby", v)}
            label="ルビを除去"
            disabled={disabled}
          />
          <Toggle
            checked={settings.excludeHeaderFooter}
            onChange={(v) => update("excludeHeaderFooter", v)}
            label="ヘッダー/フッターを除外"
            disabled={disabled}
          />
        </div>
      </div>
    </aside>
  );
}
