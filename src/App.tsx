import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENRES = [
  { id: "trap", label: "Trap 🔥", desc: "Dark, heavy 808s, aggressive" },
  { id: "boom_bap", label: "Boom Bap 🎤", desc: "Classic NY, lyricism heavy" },
  { id: "drill", label: "Drill 🗡️", desc: "Street, gritty, Chicago/UK" },
  { id: "conscious", label: "Conscious 🧠", desc: "Deep, meaningful, poetic" },
  { id: "melodic", label: "Melodic Rap 🎵", desc: "Sung flows, emotional" },
  { id: "mumble", label: "Mumble/Vibe 😮‍💨", desc: "Chill, repetitive, atmospheric" },
  { id: "horrorcore", label: "Horrorcore 💀", desc: "Dark, twisted, horror themes" },
  { id: "gangsta", label: "Gangsta 🔫", desc: "Street life, raw, unfiltered" },
  { id: "lofi", label: "Lo-fi Rap ☁️", desc: "Chill, introspective, soft" },
  { id: "comedy", label: "Comedy/Parody 😂", desc: "Funny, sarcastic, playful" },
];

const MOODS = [
  { id: "aggressive", label: "Aggressive 😤", color: "#ff3b30" },
  { id: "melancholic", label: "Melancholic 😔", color: "#5856d6" },
  { id: "hype", label: "Hype 🚀", color: "#ff9500" },
  { id: "dark", label: "Dark 🌑", color: "#1c1c1e" },
  { id: "smooth", label: "Smooth 😎", color: "#34c759" },
  { id: "flexing", label: "Flexing 💎", color: "#ffd700" },
  { id: "heartbreak", label: "Heartbreak 💔", color: "#ff2d55" },
  { id: "motivated", label: "Motivated 💪", color: "#007aff" },
];

const RHYME_SCHEMES = [
  { id: "AABB", label: "AABB", desc: "Coupled rhyme — most natural flow" },
  { id: "ABAB", label: "ABAB", desc: "Alternating — classic hip-hop" },
  { id: "ABCB", label: "ABCB", desc: "Ballad — lines 2 & 4 rhyme" },
  { id: "AAAA", label: "AAAA", desc: "Monorhyme — intense, drill-style" },
  { id: "multisyllabic", label: "Multi-syllabic", desc: "Complex internal rhymes" },
  { id: "free", label: "Free Form", desc: "No strict scheme, pure flow" },
];

const TEMPOS = [
  { id: "slow", label: "Slow 🐢", bpm: "60–80 BPM" },
  { id: "mid", label: "Mid Tempo 🚶", bpm: "85–100 BPM" },
  { id: "fast", label: "Fast 🏃", bpm: "110–140 BPM" },
  { id: "super_fast", label: "Super Fast ⚡", bpm: "150+ BPM" },
];

const SECTION_TYPES = ["Intro", "Verse", "Pre-Hook", "Hook", "Bridge", "Outro"];

const ARTISTS = [
  "Kendrick Lamar", "Travis Scott", "J. Cole", "Drake", "Eminem",
  "NF", "21 Savage", "Lil Baby", "Denzel Curry", "Logic",
  "Big L", "Nas", "Jay-Z", "Lil Uzi Vert", "Future",
];

const DURATION_OPTIONS = ["1 min", "2 min", "3 min", "4 min", "5 min"];

const LANGUAGES = [
  { id: "en", label: "English 🇺🇸" },
  { id: "id", label: "Bahasa Indonesia 🇮🇩" },
  { id: "mix", label: "Mixed (Indoglish) 🌏" },
];

const COMPLEXITY_LEVELS = [
  { id: "simple", label: "Simple", desc: "Catchy, easy to follow" },
  { id: "balanced", label: "Balanced", desc: "Standard rap flow" },
  { id: "complex", label: "Complex", desc: "Lyrical, multi-syllabic" },
];

const STRUCTURE_TEMPLATES = [
  {
    id: "drill",
    label: "UK/Chicago Drill 🗡️",
    desc: "Intro -> Long Verse -> Catchy Hook",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Verse 1 (Long)" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "trap_modern",
    label: "Modern Trap 💎",
    desc: "Standard radio-ready structure",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Verse 1" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "boom_bap",
    label: "Classic Boom Bap 🎤",
    desc: "16-bar verses, classic NY style",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Verse 1 (16 Bars)" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2 (16 Bars)" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 3 (16 Bars)" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "pop_rap",
    label: "Pop/Radio Rap 📻",
    desc: "Hook-heavy, bridge included",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 1" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2" },
      { type: "Hook", label: "Hook" },
      { type: "Bridge", label: "Bridge" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "freestyle",
    label: "Freestyle/Grime ⚡",
    desc: "One continuous long verse",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Main Verse (Freestyle)" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "west_coast",
    label: "West Coast G-Funk 🌴",
    desc: "3 Verses, classic Cali structure",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Verse 1" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 3" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "emo_rap",
    label: "Emo/Melodic Rap 💔",
    desc: "Hook-first, shorter structure",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 1" },
      { type: "Hook", label: "Hook" },
      { type: "Verse", label: "Verse 2" },
      { type: "Hook", label: "Hook" },
      { type: "Outro", label: "Outro" },
    ]
  },
  {
    id: "hardcore",
    label: "Hardcore/Gritty 💀",
    desc: "Verse-heavy, minimal hooks",
    sections: [
      { type: "Intro", label: "Intro" },
      { type: "Verse", label: "Verse 1" },
      { type: "Verse", label: "Verse 2" },
      { type: "Verse", label: "Verse 3" },
      { type: "Outro", label: "Outro" },
    ]
  }
];

const DEFAULT_SECTIONS = [
  { id: 1, type: "Verse", label: "Verse 1" },
  { id: 2, type: "Hook", label: "Hook" },
  { id: 3, type: "Verse", label: "Verse 2" },
  { id: 4, type: "Hook", label: "Hook" },
];

const sectionCounter = { current: 5 };

export default function RapGenerator() {
  const [activeTab, setActiveTab] = useState("build");
  const [genre, setGenre] = useState("trap");
  const [mood, setMood] = useState("aggressive");
  const [rhyme, setRhyme] = useState("AABB");
  const [tempo, setTempo] = useState("mid");
  const [duration, setDuration] = useState("2 min");
  const [songTitle, setSongTitle] = useState("");
  const [language, setLanguage] = useState("mix");
  const [complexity, setComplexity] = useState("balanced");
  const [useAdlibs, setUseAdlibs] = useState(true);
  const [keywords, setKeywords] = useState("");
  const [artist, setArtist] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState(false);
  const [copiedSection, setCopiedSection] = useState<number | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<number | null>(null);
  const [exportMenu, setExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Rhyme Finder State
  const [rhymeSearch, setRhymeSearch] = useState("");
  const [rhymeResults, setRhymeResults] = useState<any[]>([]);
  const [rhymeLoading, setRhymeLoading] = useState(false);

  // Metronome State
  const [metronomeActive, setMetronomeActive] = useState(false);
  const metronomeIntervalRef = useRef<any>(null);

  // TTS State
  const [playingSection, setPlayingSection] = useState<number | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: "user" | "model", parts: {text: string}[]}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, []);

  // Metronome Logic
  useEffect(() => {
    if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    if (metronomeActive) {
      const bpmMap: any = { slow: 70, mid: 95, fast: 125, super_fast: 155 };
      const bpm = bpmMap[tempo] || 95;
      const interval = (60 / bpm) * 1000;
      
      metronomeIntervalRef.current = setInterval(() => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }, interval);
    }
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [metronomeActive, tempo]);

  const searchRhymes = async () => {
    if (!rhymeSearch.trim()) return;
    setRhymeLoading(true);
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${rhymeSearch}&max=15`);
      const data = await res.json();
      setRhymeResults(data);
    } catch (e) {
      console.error(e);
    }
    setRhymeLoading(false);
  };

  const countSyllables = (text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    let total = 0;
    words.forEach(word => {
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const matches = word.match(/[aeiouy]{1,2}/g);
      total += matches ? matches.length : 0;
    });
    return total;
  };

  const updateLyricLine = (sectionId: number, lineIdx: number, newText: string) => {
    setResult((prev: any) => {
      const newSections = prev.sections.map((s: any) => {
        if (s.id === sectionId) {
          const lines = s.lyrics.split("\n");
          lines[lineIdx] = newText;
          return { ...s, lyrics: lines.join("\n") };
        }
        return s;
      });
      return { ...prev, sections: newSections };
    });
  };

  const addSection = (type: string) => {
    const count = sections.filter(s => s.type === type).length + 1;
    const label = count > 1 ? `${type} ${count}` : type;
    setSections(prev => [...prev, { id: sectionCounter.current++, type, label }]);
  };

  const applyTemplate = (templateId: string) => {
    const template = STRUCTURE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const newSections = template.sections.map((s, i) => ({
        ...s,
        id: sectionCounter.current + i
      }));
      sectionCounter.current += template.sections.length;
      setSections(newSections);
    }
  };

  const removeSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (idx: number, dir: number) => {
    setSections(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const buildPrompt = (forEnhance = false) => {
    const genreData = GENRES.find(g => g.id === genre);
    const moodData = MOODS.find(m => m.id === mood);
    const rhymeData = RHYME_SCHEMES.find(r => r.id === rhyme);
    const tempoData = TEMPOS.find(t => t.id === tempo);
    const artistRef = customArtist || artist;
    const structureList = sections.map(s => s.label).join(" → ");

    if (forEnhance) {
      return `You are a professional rap creative director and lyricist. Enhance and restructure the following description/concept into a vivid, cinematic, emotionally rich rap concept brief. Make it more detailed, atmospheric, and story-driven. Keep it under 150 words. Return ONLY the enhanced description, no preamble.

Original description: "${description}"

Genre context: ${genreData?.label} — ${genreData?.desc}
Mood: ${moodData?.label}`;
    }

    // Calculate approximate line counts for the entire song based on duration
    const durationMap: Record<string, number> = {
      "1 min": 16,
      "2 min": 32,
      "3 min": 48,
      "4 min": 64,
      "5 min": 80
    };
    const totalLines = durationMap[duration] || 32;
    const linesPerSection = Math.floor(totalLines / sections.length);

    return `You are a world-class rap lyricist and ghostwriter. Write authentic, raw rap lyrics that sound like a real human artist wrote them — NOT like AI-generated content.

CRITICAL RULES FOR STRUCTURE & FLOW:
1. TITLE: The song title is "${songTitle || "Untitled Rap"}". You MUST incorporate themes related to this title.
2. LANGUAGE: Write in ${LANGUAGES.find(l => l.id === language)?.label}. If "Mixed", use a natural blend of English and Indonesian slang.
2. VOCABULARY: Use ${complexity} vocabulary level. ${complexity === 'complex' ? 'Use multi-syllabic rhymes and complex metaphors.' : 'Keep it simple, punchy, and catchy.'}
3. TOTAL LENGTH: The entire song MUST be approximately ${totalLines} lines long to fit the ${duration} duration.
4. SECTION LENGTH: Each section (Verse, Hook, etc.) should be roughly ${linesPerSection} lines long.
5. FORMATTING: Each line must be concise and rhythmic. Do NOT write long paragraphs. Use clear line breaks.
6. KEYWORDS: You MUST naturally incorporate these keywords: ${keywords || "none"}.
7. AD-LIBS: ${useAdlibs ? 'Include ad-libs in parentheses (e.g., "skrt skrt", "brrr", "yeah") at the end of some lines.' : 'Do NOT include ad-libs.'}
8. AUTHENTICITY: Use authentic rap slang, street vocabulary, and colloquialisms naturally.
9. CONTENT: Explicit language, profanity, and raw street themes are encouraged for realism.
10. FLOW: Each line must flow rhythmically at the given tempo (${tempoData?.bpm}).

SPECS:
- Genre: ${genreData?.label} (${genreData?.desc})
- Mood: ${moodData?.label}
- Rhyme Scheme: ${rhymeData?.label}
- Tempo: ${tempoData?.label} (${tempoData?.bpm})
- Song Structure: ${structureList}
${artistRef ? `- Artist Influence: Write in the style of ${artistRef}` : ""}
${description ? `- Concept/Story: ${description}` : "- No specific concept — freestyle based on genre/mood"}`;
  };

  const generate = async () => {
    if (sections.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: buildPrompt(),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    lyrics: { type: Type.STRING }
                  },
                  required: ["id", "label", "type", "lyrics"]
                }
              }
            },
            required: ["title", "sections"]
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        // Ensure IDs match our sections
        parsed.sections = parsed.sections.map((s: any, i: number) => ({
          ...s,
          id: sections[i]?.id || s.id
        }));
        setResult(parsed);
        setHistory(prev => [{ ...parsed, timestamp: new Date().toLocaleString("id-ID"), genre, mood }, ...prev.slice(0, 19)]);
      }
    } catch (e) {
      console.error(e);
      setResult({ error: "Gagal generate. Coba lagi." });
    }
    setLoading(false);
  };

  const enhanceDescription = async () => {
    if (!description.trim()) return;
    setEnhancing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: buildPrompt(true),
      });
      const enhanced = response.text?.trim();
      if (enhanced) setDescription(enhanced);
    } catch (e) {
      console.error(e);
    }
    setEnhancing(false);
  };

  const regenerateSection = async (section: any) => {
    if (!result) return;
    setRegeneratingSection(section.id);
    const prompt = `You are a world-class rap ghostwriter. Rewrite ONLY this specific section of a rap song.

Song title: "${result.title}"
Section: ${section.label} (${section.type})
Genre: ${GENRES.find(g => g.id === genre)?.label}
Mood: ${MOODS.find(m => m.id === mood)?.label}
Rhyme Scheme: ${RHYME_SCHEMES.find(r => r.id === rhyme)?.label}
Tempo: ${TEMPOS.find(t => t.id === tempo)?.label}
${description ? `Concept: ${description}` : ""}

Context (other sections for continuity):
${result.sections.filter((s: any) => s.id !== section.id).map((s: any) => `${s.label}:\n${s.lyrics}`).join("\n\n")}

Return ONLY the new lyrics for ${section.label}, no JSON wrapper, no label prefix. Just the raw lyrics with line breaks.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const newLyrics = response.text?.trim();
      if (newLyrics) {
        setResult((prev: any) => ({
          ...prev,
          sections: prev.sections.map((s: any) => s.id === section.id ? { ...s, lyrics: newLyrics } : s),
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setRegeneratingSection(null);
  };

  const playSectionTTS = async (section: any) => {
    if (playingSection === section.id) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setPlayingSection(null);
      return;
    }
    
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }

    setPlayingSection(section.id);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: section.lyrics }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        
        // Convert PCM16 to Float32
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
        }

        const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          if (playingSection === section.id) setPlayingSection(null);
        };
        audioSourceRef.current = source;
        source.start();
      } else {
        setPlayingSection(null);
      }
    } catch (e) {
      console.error(e);
      setPlayingSection(null);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory: {role: "user" | "model", parts: {text: string}[]}[] = [
      ...chatMessages,
      { role: "user", parts: [{ text: userMsg }] }
    ];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newHistory,
        config: {
          systemInstruction: "You are a helpful rap assistant. You help users write lyrics, understand rap history, and improve their flow. Keep responses concise and inspiring.",
        },
      });

      if (response.text) {
        setChatMessages(prev => [...prev, { role: "model", parts: [{ text: response.text! }] }]);
      }
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I encountered an error." }] }]);
    }
    setChatLoading(false);
  };

  const copySection = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const copyAll = () => {
    if (!result) return;
    const full = `${result.title}\n\n` + result.sections.map((s: any) => `[${s.label}]\n${s.lyrics}`).join("\n\n");
    navigator.clipboard.writeText(full);
  };

  const exportTxt = () => {
    if (!result) return;
    const full = `${result.title}\n${"=".repeat(result.title.length)}\n\n` +
      result.sections.map((s: any) => `[${s.label}]\n${s.lyrics}`).join("\n\n");
    const blob = new Blob([full], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    setExportMenu(false);
  };

  const sectionTypeColor = (type: string) => {
    const map: Record<string, string> = { Verse: "#e8b4ff", Hook: "#ff9f6b", Bridge: "#6bcfff", Intro: "#b4ffb4", Outro: "#ffd6e7", "Pre-Hook": "#ffe0a3" };
    return map[type] || "#ccc";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Courier New', monospace",
      color: "#f0f0f0",
      padding: "0",
      overflowX: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 50%, #1a0a0a 100%)",
        borderBottom: "1px solid #2a2a2a",
        padding: "20px 24px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "28px" }}>🎤</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "3px", color: "#e8b4ff" }}>RAP FORGE</div>
              <div style={{ fontSize: "10px", color: "#666", letterSpacing: "2px" }}>by Zexly • AI Lyric Generator</div>
            </div>
          </div>
          <button
            onClick={() => setHistoryTab(!historyTab)}
            style={{
              background: historyTab ? "#e8b4ff22" : "transparent",
              border: "1px solid #333",
              color: historyTab ? "#e8b4ff" : "#888",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              letterSpacing: "1px",
            }}
          >
            📋 HISTORY ({history.length})
          </button>
        </div>
        <div style={{ display: "flex", gap: "0" }}>
          {["build", "result"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #e8b4ff" : "2px solid transparent",
              color: activeTab === tab ? "#e8b4ff" : "#666",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}>
              {tab === "build" ? "⚙️ Build" : "📄 Hasil"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
        {historyTab ? (
          <div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "16px", letterSpacing: "1px" }}>RIWAYAT GENERATE</div>
            {history.length === 0 ? (
              <div style={{ color: "#555", textAlign: "center", padding: "40px" }}>Belum ada history</div>
            ) : history.map((h, i) => (
              <div key={i} onClick={() => { setResult(h); setHistoryTab(false); setActiveTab("result"); }} style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "10px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#e8b4ff55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}
              >
                <div style={{ fontWeight: "bold", color: "#e8b4ff", marginBottom: "4px" }}>{h.title}</div>
                <div style={{ fontSize: "11px", color: "#555" }}>{h.timestamp} • {h.genre} • {h.mood}</div>
              </div>
            ))}
          </div>
        ) : activeTab === "build" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Song Title */}
            <Section label="🏷️ Judul Lagu (Opsional)">
              <input
                placeholder="Masukkan judul lagu..."
                value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
                style={inputStyle}
              />
            </Section>

            {/* Language + Complexity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Section label="🌐 Bahasa">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {LANGUAGES.map(l => (
                    <button key={l.id} onClick={() => setLanguage(l.id)} style={{
                      textAlign: "left", background: language === l.id ? "#e8b4ff22" : "#111",
                      border: `1px solid ${language === l.id ? "#e8b4ff" : "#222"}`,
                      color: language === l.id ? "#e8b4ff" : "#888",
                      borderRadius: "6px", padding: "10px", cursor: "pointer", fontSize: "12px"
                    }}>{l.label}</button>
                  ))}
                </div>
              </Section>
              <Section label="🧠 Kompleksitas">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {COMPLEXITY_LEVELS.map(c => (
                    <button key={c.id} onClick={() => setComplexity(c.id)} style={{
                      textAlign: "left", background: complexity === c.id ? "#ff9f6b22" : "#111",
                      border: `1px solid ${complexity === c.id ? "#ff9f6b" : "#222"}`,
                      color: complexity === c.id ? "#ff9f6b" : "#888",
                      borderRadius: "6px", padding: "10px", cursor: "pointer", fontSize: "12px"
                    }}>
                      <div style={{ fontWeight: "bold" }}>{c.label}</div>
                      <div style={{ fontSize: "10px", opacity: 0.6 }}>{c.desc}</div>
                    </button>
                  ))}
                </div>
              </Section>
            </div>

            {/* Keywords + Adlibs */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <Section label="🔑 Keywords (Pisah koma)">
                <input
                  placeholder="e.g. money, street, family, hustle"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  style={inputStyle}
                />
              </Section>
              <Section label="🗣️ Ad-libs">
                <button onClick={() => setUseAdlibs(!useAdlibs)} style={{
                  width: "100%", height: "42px", borderRadius: "8px",
                  background: useAdlibs ? "#34c75922" : "#111",
                  border: `1px solid ${useAdlibs ? "#34c759" : "#222"}`,
                  color: useAdlibs ? "#34c759" : "#666",
                  cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                }}>
                  {useAdlibs ? "ON ✅" : "OFF ❌"}
                </button>
              </Section>
            </div>

            {/* Rhyme Finder Tool */}
            <Section label="🔍 Rhyme Finder (Datamuse API)">
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  placeholder="Cari rima untuk kata..."
                  value={rhymeSearch}
                  onChange={e => setRhymeSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchRhymes()}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={searchRhymes} disabled={rhymeLoading} style={{
                  background: "#e8b4ff", color: "#0a0a0a", border: "none",
                  borderRadius: "8px", padding: "0 16px", cursor: "pointer", fontWeight: "bold"
                }}>
                  {rhymeLoading ? "..." : "Cari"}
                </button>
              </div>
              {rhymeResults.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "6px",
                  background: "#111", padding: "12px", borderRadius: "8px", border: "1px solid #222"
                }}>
                  {rhymeResults.map((r, i) => (
                    <span key={i} style={{
                      fontSize: "11px", color: "#e8b4ff", background: "#e8b4ff11",
                      padding: "2px 8px", borderRadius: "4px", border: "1px solid #e8b4ff22"
                    }}>{r.word}</span>
                  ))}
                </div>
              )}
            </Section>

            {/* Genre */}
            <Section label="🎵 Genre">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                {GENRES.map(g => (
                  <button key={g.id} onClick={() => setGenre(g.id)} style={{
                    background: genre === g.id ? "#e8b4ff22" : "#111",
                    border: `1px solid ${genre === g.id ? "#e8b4ff" : "#222"}`,
                    color: genre === g.id ? "#e8b4ff" : "#888",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>{g.label}</div>
                    <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Mood */}
            <Section label="💭 Mood">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {MOODS.map(m => (
                  <button key={m.id} onClick={() => setMood(m.id)} style={{
                    background: mood === m.id ? m.color + "33" : "#111",
                    border: `1px solid ${mood === m.id ? m.color : "#222"}`,
                    color: mood === m.id ? m.color : "#888",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.15s",
                  }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Rhyme + Tempo + Duration */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <Section label="🔤 Rhyme Scheme">
                {RHYME_SCHEMES.map(r => (
                  <button key={r.id} onClick={() => setRhyme(r.id)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: rhyme === r.id ? "#e8b4ff22" : "transparent",
                    border: `1px solid ${rhyme === r.id ? "#e8b4ff" : "#1a1a1a"}`,
                    color: rhyme === r.id ? "#e8b4ff" : "#666",
                    borderRadius: "6px", padding: "8px 10px", cursor: "pointer",
                    marginBottom: "4px", fontSize: "12px", transition: "all 0.15s",
                  }}>
                    <span style={{ fontWeight: "bold" }}>{r.label}</span>
                    <span style={{ fontSize: "10px", color: "#444", display: "block" }}>{r.desc}</span>
                  </button>
                ))}
              </Section>

              <Section label="⚡ Tempo">
                {TEMPOS.map(t => (
                  <button key={t.id} onClick={() => setTempo(t.id)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: tempo === t.id ? "#ff9f6b22" : "transparent",
                    border: `1px solid ${tempo === t.id ? "#ff9f6b" : "#1a1a1a"}`,
                    color: tempo === t.id ? "#ff9f6b" : "#666",
                    borderRadius: "6px", padding: "8px 10px", cursor: "pointer",
                    marginBottom: "4px", fontSize: "12px", transition: "all 0.15s",
                  }}>
                    <span style={{ fontWeight: "bold" }}>{t.label}</span>
                    <span style={{ fontSize: "10px", color: "#444", display: "block" }}>{t.bpm}</span>
                  </button>
                ))}
              </Section>

              <Section label="⏱ Durasi">
                {DURATION_OPTIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{
                    display: "block", width: "100%", textAlign: "center",
                    background: duration === d ? "#6bcfff22" : "transparent",
                    border: `1px solid ${duration === d ? "#6bcfff" : "#1a1a1a"}`,
                    color: duration === d ? "#6bcfff" : "#666",
                    borderRadius: "6px", padding: "10px", cursor: "pointer",
                    marginBottom: "4px", fontSize: "13px", fontWeight: "bold",
                    transition: "all 0.15s",
                  }}>{d}</button>
                ))}
              </Section>
            </div>

            {/* Artist Influence */}
            <Section label="🎙️ Referensi Artist (Opsional)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {ARTISTS.map(a => (
                  <button key={a} onClick={() => setArtist(artist === a ? "" : a)} style={{
                    background: artist === a ? "#ffd70022" : "#111",
                    border: `1px solid ${artist === a ? "#ffd700" : "#222"}`,
                    color: artist === a ? "#ffd700" : "#666",
                    borderRadius: "20px", padding: "6px 14px", cursor: "pointer",
                    fontSize: "12px", transition: "all 0.15s",
                  }}>{a}</button>
                ))}
              </div>
              <input
                placeholder="Atau ketik artist lain..."
                value={customArtist}
                onChange={e => { setCustomArtist(e.target.value); setArtist(""); }}
                style={inputStyle}
              />
            </Section>

            {/* Song Structure */}
            <Section label="🏗️ Struktur Lagu">
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#444", marginBottom: "8px", letterSpacing: "1px" }}>PILIH TEMPLATE STRUKTUR:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "6px" }}>
                  {STRUCTURE_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t.id)} style={{
                      background: "#111", border: "1px solid #222",
                      color: "#888", borderRadius: "6px",
                      padding: "8px", cursor: "pointer",
                      fontSize: "11px", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8b4ff"; e.currentTarget.style.color = "#ccc"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#888"; }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{t.label}</div>
                      <div style={{ fontSize: "9px", opacity: 0.5 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: "10px", color: "#444", marginBottom: "8px", letterSpacing: "1px" }}>CUSTOM EDIT:</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {SECTION_TYPES.map(t => (
                  <button key={t} onClick={() => addSection(t)} style={{
                    background: "#111", border: "1px dashed #333",
                    color: "#888", borderRadius: "6px",
                    padding: "6px 12px", cursor: "pointer",
                    fontSize: "12px", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8b4ff"; e.currentTarget.style.color = "#e8b4ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#888"; }}
                  >+ {t}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sections.map((s, idx) => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "#111", border: "1px solid #1e1e1e",
                    borderRadius: "8px", padding: "10px 12px",
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: sectionTypeColor(s.type), flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, fontSize: "13px", color: "#ccc" }}>{s.label}</span>
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                      style={{ ...iconBtn, opacity: idx === 0 ? 0.2 : 1 }}>↑</button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}
                      style={{ ...iconBtn, opacity: idx === sections.length - 1 ? 0.2 : 1 }}>↓</button>
                    <button onClick={() => removeSection(s.id)} style={{ ...iconBtn, color: "#ff3b30" }}>✕</button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Description */}
            <Section label="📝 Deskripsi / Cerita (Opsional)">
              <textarea
                placeholder="Ceritain konsep lagu lo, pengalaman, atau tema yang mau lo angkat... bisa bahasa Indo juga."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
              />
              <button
                onClick={enhanceDescription}
                disabled={!description.trim() || enhancing}
                style={{
                  marginTop: "8px",
                  background: enhancing ? "#111" : "#e8b4ff11",
                  border: "1px solid #e8b4ff44",
                  color: enhancing ? "#555" : "#e8b4ff",
                  borderRadius: "6px", padding: "8px 18px",
                  cursor: description.trim() && !enhancing ? "pointer" : "not-allowed",
                  fontSize: "12px", letterSpacing: "1px",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                {enhancing ? "✨ Enhancing..." : "✨ Enhance Deskripsi"}
              </button>
            </Section>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={loading || sections.length === 0}
              style={{
                width: "100%",
                background: loading ? "#1a1a1a" : "linear-gradient(135deg, #e8b4ff, #b060ff)",
                border: "none",
                color: loading ? "#555" : "#0a0a0a",
                borderRadius: "10px",
                padding: "18px",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "3px",
                cursor: loading || sections.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {loading ? "🎤 GENERATING..." : "🎤 GENERATE LIRIK"}
            </button>
          </div>
        ) : (
          // Result Tab
          <div>
            {!result ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎤</div>
                <div style={{ letterSpacing: "2px" }}>Build dulu di tab ⚙️ Build</div>
              </div>
            ) : result.error ? (
              <div style={{ color: "#ff3b30", textAlign: "center", padding: "40px" }}>{result.error}</div>
            ) : (
              <div>
                {/* Song header */}
                <div style={{
                  background: "linear-gradient(135deg, #1a0a2e, #0d1a2e)",
                  border: "1px solid #2a1a4e",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#e8b4ff", marginBottom: "6px" }}>{result.title}</div>
                    <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px" }}>
                      {GENRES.find(g => g.id === genre)?.label} • {MOODS.find(m => m.id === mood)?.label} • {duration}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", position: "relative" }}>
                    <button
                      onClick={() => setMetronomeActive(!metronomeActive)}
                      style={{
                        ...actionBtn,
                        background: metronomeActive ? "#ff3b3022" : "#111",
                        borderColor: metronomeActive ? "#ff3b30" : "#333",
                        color: metronomeActive ? "#ff3b30" : "#aaa"
                      }}
                    >
                      {metronomeActive ? "⏹ Stop Metronome" : "🥁 Metronome"}
                    </button>
                    <button onClick={copyAll} style={actionBtn}>📋 Copy All</button>
                    <div ref={exportRef}>
                      <button onClick={() => setExportMenu(!exportMenu)} style={actionBtn}>⬇️ Export</button>
                      {exportMenu && (
                        <div style={{
                          position: "absolute", right: 0, top: "110%",
                          background: "#1a1a1a", border: "1px solid #333",
                          borderRadius: "8px", overflow: "hidden", zIndex: 50, minWidth: "140px",
                        }}>
                          <button onClick={exportTxt} style={{ ...exportItem }}>📄 Export .txt</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {result.sections?.map((s: any) => (
                  <div key={s.id} style={{
                    background: "#0f0f0f",
                    border: "1px solid #1e1e1e",
                    borderLeft: `3px solid ${sectionTypeColor(s.type)}`,
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          background: sectionTypeColor(s.type) + "22",
                          color: sectionTypeColor(s.type),
                          fontSize: "11px", fontWeight: "bold",
                          padding: "3px 10px", borderRadius: "20px",
                          border: `1px solid ${sectionTypeColor(s.type)}44`,
                          letterSpacing: "1px",
                        }}>{s.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => playSectionTTS(s)}
                          style={{ ...smallBtn, color: playingSection === s.id ? "#ff9f6b" : "#6bcfff", borderColor: playingSection === s.id ? "#ff9f6b33" : "#6bcfff33" }}
                        >
                          {playingSection === s.id ? "⏹ Stop" : "🔊 Listen"}
                        </button>
                        <button
                          onClick={() => regenerateSection(s)}
                          disabled={regeneratingSection === s.id}
                          style={{ ...smallBtn, color: "#ffd700", borderColor: "#ffd70033" }}
                        >
                          {regeneratingSection === s.id ? "↻ ..." : "↻ Regen"}
                        </button>
                        <button
                          onClick={() => copySection(s.lyrics, s.id)}
                          style={{ ...smallBtn, color: copiedSection === s.id ? "#34c759" : "#888", borderColor: "#33333355" }}
                        >
                          {copiedSection === s.id ? "✓ Copied" : "📋 Copy"}
                        </button>
                      </div>
                    </div>
                    <div style={{
                      fontSize: "14px",
                      lineHeight: "2",
                      color: "#ddd",
                      fontFamily: "'Courier New', monospace",
                    }}>
                      {s.lyrics.split("\n").map((line: string, lIdx: number) => (
                        <div key={lIdx} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                          <div style={{
                            fontSize: "9px", color: "#555", width: "24px", textAlign: "right",
                            background: "#111", borderRadius: "4px", padding: "2px"
                          }}>
                            {countSyllables(line)}
                          </div>
                          <input
                            value={line}
                            onChange={(e) => updateLyricLine(s.id, lIdx, e.target.value)}
                            style={{
                              flex: 1, background: "transparent", border: "none",
                              color: "#ddd", outline: "none", padding: "0",
                              fontFamily: "inherit", fontSize: "inherit"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background: "linear-gradient(135deg, #e8b4ff, #b060ff)",
          border: "none",
          color: "#0a0a0a",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* Chatbot Window */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "24px",
          width: "350px",
          height: "500px",
          background: "#111",
          border: "1px solid #333",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
          zIndex: 1000,
          overflow: "hidden"
        }}>
          <div style={{
            background: "#1a0a2e",
            padding: "16px",
            borderBottom: "1px solid #333",
            fontWeight: "bold",
            color: "#e8b4ff",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            🤖 Rap Assistant
          </div>
          
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {chatMessages.length === 0 && (
              <div style={{ color: "#888", textAlign: "center", fontSize: "12px", marginTop: "20px" }}>
                Ask me for rap advice, rhymes, or flow tips!
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#e8b4ff22" : "#222",
                border: `1px solid ${msg.role === "user" ? "#e8b4ff44" : "#333"}`,
                color: msg.role === "user" ? "#e8b4ff" : "#ddd",
                padding: "10px 14px",
                borderRadius: "12px",
                maxWidth: "85%",
                fontSize: "13px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap"
              }}>
                {msg.parts[0].text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: "flex-start", color: "#888", fontSize: "12px" }}>
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} style={{
            padding: "12px",
            borderTop: "1px solid #333",
            display: "flex",
            gap: "8px",
            background: "#0a0a0a"
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                background: "#222",
                border: "1px solid #333",
                color: "#fff",
                padding: "10px",
                borderRadius: "8px",
                outline: "none",
                fontFamily: "'Courier New', monospace",
                fontSize: "13px"
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              style={{
                background: "#e8b4ff",
                color: "#0a0a0a",
                border: "none",
                padding: "0 16px",
                borderRadius: "8px",
                cursor: !chatInput.trim() || chatLoading ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#666", letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#111",
  border: "1px solid #222",
  color: "#f0f0f0",
  borderRadius: "8px",
  padding: "12px 14px",
  fontSize: "13px",
  fontFamily: "'Courier New', monospace",
  outline: "none",
  boxSizing: "border-box" as const,
};

const iconBtn = {
  background: "transparent",
  border: "none",
  color: "#666",
  cursor: "pointer",
  fontSize: "14px",
  padding: "2px 6px",
  borderRadius: "4px",
};

const actionBtn = {
  background: "#111",
  border: "1px solid #333",
  color: "#aaa",
  borderRadius: "6px",
  padding: "7px 14px",
  cursor: "pointer",
  fontSize: "12px",
  fontFamily: "'Courier New', monospace",
};

const smallBtn = {
  background: "transparent",
  border: "1px solid",
  borderRadius: "5px",
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: "11px",
  fontFamily: "'Courier New', monospace",
  transition: "opacity 0.15s",
};

const exportItem = {
  display: "block",
  width: "100%",
  background: "transparent",
  border: "none",
  color: "#ccc",
  padding: "12px 16px",
  cursor: "pointer",
  fontSize: "12px",
  textAlign: "left" as const,
  fontFamily: "'Courier New', monospace",
};
