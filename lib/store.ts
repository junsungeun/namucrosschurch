import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CardData = {
  id: string;
  type: "cover" | "body";
  title?: string;
  date?: string;
  series?: string;
  scripture?: string;
  subtitle?: string;
  content?: string;
};

export type EditorState = {
  format: "feed" | "story";
  templateId: string;
  templateColor: string;
  cards: CardData[];
  youtubeUrl: string;
  currentCard: number;

  setFormat: (f: "feed" | "story") => void;
  setTemplate: (id: string, color: string) => void;
  setCards: (cards: CardData[]) => void;
  updateCard: (id: string, data: Partial<CardData>) => void;
  addCard: () => void;
  removeCard: (id: string) => void;
  setCurrentCard: (i: number) => void;
  setYoutubeUrl: (url: string) => void;
  reset: () => void;
};

const defaultCards: CardData[] = [
  {
    id: "card-1",
    type: "cover",
    title: "",
    date: "",
    series: "",
    scripture: "",
  },
  {
    id: "card-2",
    type: "body",
    subtitle: "",
    content: "",
  },
];

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      format: "feed",
      templateId: "template-a",
      templateColor: "#2D5A3D",
      cards: defaultCards,
      youtubeUrl: "",
      currentCard: 0,

      setFormat: (f) => set({ format: f }),
      setTemplate: (id, color) => set({ templateId: id, templateColor: color }),
      setCards: (cards) => set({ cards }),
      updateCard: (id, data) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      addCard: () =>
        set((s) => {
          if (s.cards.length >= 5) return s;
          const newCard: CardData = {
            id: `card-${Date.now()}`,
            type: "body",
            subtitle: "",
            content: "",
          };
          return { cards: [...s.cards, newCard] };
        }),
      removeCard: (id) =>
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
          currentCard: Math.max(0, s.currentCard - 1),
        })),
      setCurrentCard: (i) => set({ currentCard: i }),
      setYoutubeUrl: (url) => set({ youtubeUrl: url }),
      reset: () =>
        set({
          cards: defaultCards,
          youtubeUrl: "",
          currentCard: 0,
        }),
    }),
    { name: "namucard-editor" }
  )
);
