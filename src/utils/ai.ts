export type QuizQuestion = {
  id: string;
  type: "mcq" | "short";
  question: string;
  options?: string[];
  answer: string;
};

function mockSummary(url: string) {
  return `Summary for ${url}: This video covers key astro-study concepts, including spaced repetition, focused problem-solving, and how to structure study sessions into Focus Bursts and Recharge Orbits. It emphasizes active recall, interleaving subjects, and taking reflective notes. Practical tips are given for planning weekly timetables, tracking attendance accurately, and maintaining a sustainable cadence towards your North Star goals.`;
}

function mockQuiz(url: string): QuizQuestion[] {
  return [
    { id: crypto.randomUUID(), type: "mcq", question: "What is a Focus Burst?", options: ["A long break", "A timed study interval", "A random playlist"], answer: "A timed study interval" },
    { id: crypto.randomUUID(), type: "mcq", question: "Which technique enhances retention?", options: ["Passive rereading", "Active recall", "Random scrolling"], answer: "Active recall" },
    { id: crypto.randomUUID(), type: "short", question: "Define interleaving in study.", answer: "Mixing different topics/skills during practice." },
    { id: crypto.randomUUID(), type: "mcq", question: "Best use of breaks?", options: ["More screens", "Short recharge", "Skip always"], answer: "Short recharge" },
    { id: crypto.randomUUID(), type: "short", question: "What is a North Star goal?", answer: "Your primary long-term target (e.g., target GPA)." },
  ];
}

export async function summarizeVideo(url: string): Promise<string> {
  const endpoint = (window as any).VITE_AI_ENDPOINT || (import.meta as any).env?.VITE_AI_ENDPOINT || "";
  const apiKey = (window as any).VITE_AI_API_KEY || (import.meta as any).env?.VITE_AI_API_KEY || "";
  if (!endpoint || !apiKey) {
    return mockSummary(url);
  }
  try {
    const res = await fetch(endpoint + "/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ url, maxWords: 200 })
    });
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.summary || mockSummary(url);
  } catch {
    return mockSummary(url);
  }
}

export async function generateQuiz(url: string): Promise<QuizQuestion[]> {
  const endpoint = (window as any).VITE_AI_ENDPOINT || (import.meta as any).env?.VITE_AI_ENDPOINT || "";
  const apiKey = (window as any).VITE_AI_API_KEY || (import.meta as any).env?.VITE_AI_API_KEY || "";
  if (!endpoint || !apiKey) {
    return mockQuiz(url);
  }
  try {
    const res = await fetch(endpoint + "/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ url, numQuestions: 7 })
    });
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return (data.questions || []).map((q: any) => ({
      id: crypto.randomUUID(),
      type: q.type === "mcq" ? "mcq" : "short",
      question: q.question,
      options: q.options,
      answer: q.answer,
    })) as QuizQuestion[];
  } catch {
    return mockQuiz(url);
  }
}


