"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, Play, Square, Settings2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TtsPage() {
  const [text, setText] = useState("欢迎使用爱拓工具箱，这是一个基于浏览器 Web Speech API 实现的文字转语音工具。您可以自由调节语速、音调和音量。");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsActive] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = synth.current?.getVoices() || [];
        setVoices(availableVoices);
        
        // Default to a Chinese voice if available, otherwise first one
        const zhVoice = availableVoices.find(v => v.lang.includes("zh")) || availableVoices[0];
        if (zhVoice && !selectedVoice) {
          setSelectedVoice(zhVoice.name);
        }
      };

      loadVoices();
      if (synth.current && synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!synth.current || !text) return;

    if (synth.current.speaking) {
      synth.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsActive(true);
    utterance.onend = () => setIsActive(false);
    utterance.onerror = () => {
      setIsActive(false);
      toast.error("播放出错");
    };

    synth.current.speak(utterance);
  };

  const stop = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsActive(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg">
          <Volume2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文字转语音 (TTS)</h1>
          <p className="text-muted-foreground">基于浏览器内置 API，无需安装插件</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">输入文本</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请在此输入想要朗读的文字..."
              className="min-h-75 text-lg leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-4">
              <Button onClick={speak} size="lg" className="flex-1 gap-2 h-14 text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isSpeaking}>
                <Play className="h-5 w-5 fill-current" />
                开始朗读
              </Button>
              {isSpeaking && (
                <Button onClick={stop} size="lg" variant="destructive" className="h-14 w-14 rounded-full p-0 shadow-lg animate-pulse">
                  <Square className="h-5 w-5 fill-current" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              语音设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label>选择音库 ({voices.length})</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="加载中..." />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>语速 (Rate)</Label>
                <span className="text-xs font-mono bg-muted px-1.5 rounded">{rate}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={(v) => setRate(v[0])}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            {/* Pitch */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>音调 (Pitch)</Label>
                <span className="text-xs font-mono bg-muted px-1.5 rounded">{pitch}</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={(v) => setPitch(v[0])}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            {/* Volume */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>音量 (Volume)</Label>
                <span className="text-xs font-mono bg-muted px-1.5 rounded">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground grid md:grid-cols-2 gap-4">
          <ul className="list-disc pl-4 space-y-1">
            <li>文字转语音使用浏览器内置的 Web Speech API，无需安装额外软件</li>
            <li>支持多种语言，具体取决于您的操作系统和浏览器</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
            <li>可调节语速、音调和音量以获得最佳效果</li>
            <li>推荐使用 Chrome 或 Edge 浏览器以获得最佳体验</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
