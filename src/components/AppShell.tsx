import { BookOpen, ChartDonut, Gear, House, MusicNotes, SpeakerHigh, Stack, Sun, Moon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { AppSettings } from "../types";

export type PageName = "home" | "library" | "progress";

interface AppShellProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: PageName) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  onMusicToggle: () => void;
}

const navigation = [
  { page: "home" as const, label: "Home", icon: House },
  { page: "library" as const, label: "Learn", icon: BookOpen },
  { page: "library" as const, label: "Library", icon: Stack, desktopOnly: true },
  { page: "progress" as const, label: "Progress", icon: ChartDonut },
];

export function AppShell({ children, activePage, onNavigate, onOpenSettings, settings, onMusicToggle }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => onNavigate("home")} aria-label="MandarinPlus home">
          <span className="brand-mark">中</span>
          <span>Mandarin<span>Plus</span></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ page, label, desktopOnly }, index) => (
            <button key={label + index} className={activePage === page ? "active" : ""} onClick={() => onNavigate(page)} data-desktop-only={desktopOnly || undefined}>{label}</button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="icon-text-button" onClick={onMusicToggle} aria-pressed={settings.musicEnabled} title="Background music">
            <MusicNotes size={19} weight="fill" /><span>Music {settings.musicEnabled ? "on" : "off"}</span>
          </button>
          <button className="icon-button" onClick={onOpenSettings} aria-label="Open settings"><Gear size={21} /></button>
        </div>
      </header>
      <main>{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.filter((item) => !item.desktopOnly).map(({ page, label, icon: Icon }) => (
          <button key={label} className={activePage === page ? "active" : ""} onClick={() => onNavigate(page)}>
            <Icon size={22} weight={activePage === page ? "fill" : "regular"} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function SettingsPanel({ settings, onChange, onClose }: { settings: AppSettings; onChange: (settings: Partial<AppSettings>) => void; onClose: () => void }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="side-panel" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="panel-heading"><div><p className="eyebrow">Make it yours</p><h2>Settings</h2></div><button className="close-button" onClick={onClose} aria-label="Close settings">×</button></div>
        <div className="settings-list">
          <div className="setting-row"><span className="setting-icon">{settings.theme === "light" ? <Sun size={22} /> : <Moon size={22} />}</span><div><strong>Appearance</strong><small>Warm light or charcoal dark</small></div><button className="toggle" aria-pressed={settings.theme === "dark"} onClick={() => onChange({ theme: settings.theme === "light" ? "dark" : "light" })}><span /></button></div>
          <div className="setting-row"><span className="setting-icon"><SpeakerHigh size={22} /></span><div><strong>Auto pronounce</strong><small>Speak Mandarin once per card</small></div><button className="toggle" aria-pressed={settings.autoPronounce} onClick={() => onChange({ autoPronounce: !settings.autoPronounce })}><span /></button></div>
          <div className="setting-row"><span className="setting-icon"><MusicNotes size={22} /></span><div><strong>Home music</strong><small>Always pauses during study</small></div><button className="toggle" aria-pressed={settings.musicEnabled} onClick={() => onChange({ musicEnabled: !settings.musicEnabled })}><span /></button></div>
        </div>
        <div className="direction-setting">
          <p className="eyebrow">Default learning direction</p>
          <div className="segmented">
            {(["zh-en", "en-zh", "mixed"] as const).map((direction) => <button key={direction} className={settings.direction === direction ? "active" : ""} onClick={() => onChange({ direction })}>{direction === "zh-en" ? "中 → EN" : direction === "en-zh" ? "EN → 中" : "Mixed"}</button>)}
          </div>
        </div>
      </section>
    </div>
  );
}
