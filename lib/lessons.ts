// Structured lesson data for VoiceGym

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  mouthDiagram: string;
  practiceWords: string[];
  sentences: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "r-sound",
    title: "R Sound",
    explanation: "The R sound is made by pulling your tongue back and rounding your lips. Don't touch the roof of your mouth.",
    mouthDiagram: "👅 ← (Tongue pulled back, lips rounded)",
    practiceWords: ["Red", "Right", "Rain", "River", "Really", "Relax"],
    sentences: ["The red river runs right.", "Really relaxing rain."]
  },
  {
    id: "l-sound",
    title: "L Sound",
    explanation: "The L sound is made by touching the ridge behind your top teeth with your tongue. Let air flow around the sides.",
    mouthDiagram: "👅 ↑ (Tongue on ridge behind top teeth)",
    practiceWords: ["Light", "Learner", "Lesson", "Listen", "Language"],
    sentences: ["Light learners listen.", "Language lessons are fun."]
  },
  {
    id: "th-sound",
    title: "TH Sound",
    explanation: "The TH sound is made by sticking your tongue slightly between your teeth and blowing air gently.",
    mouthDiagram: "👅 between 🦷 (Tongue between teeth)",
    practiceWords: ["Think", "Thank", "This", "That", "Both"],
    sentences: ["Think about this.", "Thank both of them."]
  },
  {
    id: "s-sh-sound",
    title: "S vs SH Sound",
    explanation: "S is made with a smile, SH with rounded lips. For SH, push air through rounded lips.",
    mouthDiagram: "S: 🙂 (Smile) | SH: 😗 (Round lips)",
    practiceWords: ["See", "She", "Sea", "Shy", "Shoe"],
    sentences: ["She sees the sea.", "Shy shoes shine."]
  },
];
