"use client"

import { Settings2, RotateCcw, Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useSettings, type GameSettings } from "@/lib/settings-context"
import { useSound } from "@/lib/sound-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SettingRow {
  key: keyof GameSettings
  label: string
  description: string
}

const GAMEPLAY_SETTINGS: SettingRow[] = [
  {
    key: "autoCheck",
    label: "Auto-check mistakes",
    description: "Instantly show wrong numbers in red",
  },
  {
    key: "lockCorrectAnswers",
    label: "Lock correct answers",
    description: "Prevent changing correctly placed numbers",
  },
  {
    key: "autoRemoveNotes",
    label: "Auto-remove notes",
    description: "Remove notes from peers when placing a number",
  },
]

const VISUAL_SETTINGS: SettingRow[] = [
  {
    key: "highlightRowColBox",
    label: "Highlight row/col/box",
    description: "Highlight the selected cell's row, column, and box",
  },
  {
    key: "highlightSameNumbers",
    label: "Highlight same numbers",
    description: "Highlight all cells with the same number",
  },
  {
    key: "highlightConflicts",
    label: "Highlight conflicts",
    description: "Show conflicting numbers in the same region",
  },
  {
    key: "dimCompletedNumbers",
    label: "Dim completed numbers",
    description: "Dim number buttons when all 9 are placed",
  },
]

const DISPLAY_SETTINGS: SettingRow[] = [
  {
    key: "showTimer",
    label: "Show timer",
    description: "Display elapsed time",
  },
  {
    key: "showMistakeCount",
    label: "Show mistakes",
    description: "Display remaining lives",
  },
  {
    key: "showScore",
    label: "Show score",
    description: "Display points counter",
  },
  {
    key: "showStreak",
    label: "Show streak",
    description: "Display current streak multiplier",
  },
]

function SettingGroup({ title, items }: { title: string; items: SettingRow[] }) {
  const { settings, updateSetting } = useSettings()

  return (
    <div>
      <h3 className="text-[10px] font-sans font-bold text-white/90 bg-black/40 border-y border-white/10 uppercase tracking-[0.2em] px-3 py-1.5 mb-4 shadow-sm">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 py-1"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold font-sans text-white/90 uppercase tracking-wider">{item.label}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-sans">{item.description}</p>
            </div>
            <Switch
              checked={settings[item.key] as boolean}
              onCheckedChange={(val) => updateSetting(item.key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function SoundSettings() {
  const { soundSettings, updateSoundSetting, toggleMusic, isMusicPlaying } = useSound()

  return (
    <div>
      <h3 className="text-[10px] font-sans font-bold text-white/90 bg-black/40 border-y border-white/10 uppercase tracking-[0.2em] px-3 py-1.5 mb-4 shadow-sm">
        Sound
      </h3>
      <div className="space-y-4">
        {/* Master toggle */}
        <div className="flex items-center justify-between gap-4 py-1">
          <div className="min-w-0">
            <p className="text-xs font-bold font-sans text-white/90 uppercase tracking-wider">Sound effects</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-sans">Enable all game sounds</p>
          </div>
          <Switch
            checked={soundSettings.masterEnabled}
            onCheckedChange={(val) => updateSoundSetting("masterEnabled", val)}
          />
        </div>

        {soundSettings.masterEnabled && (
          <>
            {/* Music toggle + volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-white/50" />
                  <p className="text-xs font-bold font-sans text-white/90 uppercase tracking-wider">Background music</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={toggleMusic}
                  >
                    {isMusicPlaying ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  <Switch
                    checked={soundSettings.musicEnabled}
                    onCheckedChange={(val) => updateSoundSetting("musicEnabled", val)}
                  />
                </div>
              </div>
              {soundSettings.musicEnabled && (
                <div className="flex items-center gap-3 pl-6 mt-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest w-12 font-sans">Volume</span>
                  <Slider
                    value={[soundSettings.musicVolume * 100]}
                    onValueChange={([v]) => updateSoundSetting("musicVolume", v / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white/90">
                    {Math.round(soundSettings.musicVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* SFX toggle + volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-white/50" />
                  <p className="text-xs font-bold font-sans text-white/90 uppercase tracking-wider">SFX</p>
                </div>
                <Switch
                  checked={soundSettings.sfxEnabled}
                  onCheckedChange={(val) => updateSoundSetting("sfxEnabled", val)}
                />
              </div>
              {soundSettings.sfxEnabled && (
                <div className="flex items-center gap-3 pl-6 mt-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest w-12 font-sans">Volume</span>
                  <Slider
                    value={[soundSettings.sfxVolume * 100]}
                    onValueChange={([v]) => updateSoundSetting("sfxVolume", v / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white/90">
                    {Math.round(soundSettings.sfxVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function SettingsDialog({ children }: { children?: React.ReactNode }) {
  const { settings, updateSetting, resetSettings } = useSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings2 className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-black/30 border border-white/10 text-white shadow-2xl backdrop-blur-3xl rounded-none p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl tracking-[0.3em] uppercase font-bold text-center text-white/90">Settings</DialogTitle>
          <DialogDescription className="text-center text-white/50 uppercase tracking-widest text-[10px]">
            Customize your gameplay experience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <SettingGroup title="Gameplay" items={GAMEPLAY_SETTINGS} />
          <div className="border-t border-white/10" />
          <SettingGroup title="Visual Helpers" items={VISUAL_SETTINGS} />
          <div className="border-t border-white/10" />
          <SettingGroup title="Display" items={DISPLAY_SETTINGS} />
          <div className="border-t border-white/10" />
          <SoundSettings />
          <div className="border-t border-white/10" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 rounded-none bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] font-sans font-bold h-12"
            onClick={resetSettings}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
