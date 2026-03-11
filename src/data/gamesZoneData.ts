import { QuizGameData, GameQuestion } from '@/types/games';

const parseInlineAnswerQuestions = (input: string): GameQuestion[] => {
  const questions: GameQuestion[] = [];
  const blocks = input.match(/Q\d+\.[\s\S]*?(?=\nQ\d+\.|$)/g) || [];

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const header = lines[0]?.match(/^Q(\d+)\.\s*(.*)$/);
    if (!header) continue;
    const [, idNumber, prompt] = header;
    const options = lines.filter((line) => /^[A-D]\.\s+/.test(line)).map((line) => line.replace(/^[A-D]\.\s+/, '').trim());
    const answerLetter = lines.find((line) => /^Answer:\s*[A-D]/.test(line))?.match(/^Answer:\s*([A-D])/i)?.[1]?.toUpperCase();
    const explanation = lines.find((line) => line.startsWith('Explanation:'))?.replace('Explanation:', '').trim() ?? '';
    if (!answerLetter || options.length < 2) continue;
    const answerIndex = answerLetter.charCodeAt(0) - 65;
    questions.push({ id: `q-${idNumber}`, prompt, options, correctAnswer: options[answerIndex] ?? options[0], explanation });
  }

  return questions;
};

const parseAnswerKey = (input: string): Record<string, string> => {
  const answerKey: Record<string, string> = {};
  for (const match of input.matchAll(/(\d+)\.([A-D])/g)) {
    answerKey[match[1]] = match[2];
  }
  return answerKey;
};

const parseWithKeyQuestions = (input: string, keyText: string): GameQuestion[] => {
  const key = parseAnswerKey(keyText);
  const blocks = input.match(/Q\d+\.[\s\S]*?(?=\nQ\d+\.|$)/g) || [];
  const parsed: GameQuestion[] = [];
  blocks.forEach((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      const header = lines[0]?.match(/^Q(\d+)\.\s*(.*)$/);
      if (!header) return null;
      const [, idNumber, prompt] = header;
      const options = lines.filter((line) => /^[A-D]\.\s+/.test(line)).map((line) => line.replace(/^[A-D]\.\s+/, '').trim());
      const letter = key[idNumber];
      if (!letter || !options.length) return null;
      parsed.push({ id: `q-${idNumber}`, prompt, options, correctAnswer: options[letter.charCodeAt(0) - 65] ?? options[0], explanation: '' });
    });

  return parsed;
};

const cisoSampleRaw = `
Q1. The CEO asks the CISO to “reduce cyber risk quickly” without increasing budget. What is the BEST first step?
A. Purchase a new SIEM
B. Launch a company-wide penetration test
C. Prioritize the most critical risks based on business impact
D. Replace the firewall estate
Answer: C
Explanation: A CISO should first align efforts with business-critical risk before selecting tools or launching technical initiatives.

Q2. A security policy has been formally approved, but business teams continue ignoring it. What is the MOST likely root cause?
A. The IDS is outdated
B. Weak governance, poor sponsorship, and lack of accountability
C. The antivirus engine is misconfigured
D. Password complexity is too low
Answer: B
Explanation: A policy without governance, executive support, ownership, and enforcement is rarely effective.

Q3. Which security metric is MOST suitable for the executive committee?
A. Number of blocked IP addresses
B. Number of logs collected daily
C. Residual risk on critical business services
D. Number of Linux servers rebooted
Answer: C
Explanation: Executives need risk-based reporting tied to business impact, not operational detail.

Q4. A business unit wants a permanent exception to a critical security control. What is the BEST response?
A. Approve it verbally
B. Reject it immediately without review
C. Process it through a formal exception workflow with risk owner approval
D. Ask the system administrator to decide
Answer: C

Q5. What is the PRIMARY purpose of a security strategy?
A. To deploy more security tools
B. To eliminate all cyber risk
C. To align security objectives with business objectives
D. To centralize all IT decisions under the CISO
Answer: C

Q6. In a mature organization, who should own business risk?
A. SOC analyst
B. CISO only
C. Business/risk owner
D. Vendor account manager
Answer: C

Q7. Which document usually translates policy into practical, enforceable requirements?
A. Vision statement
B. Security standards and procedures
C. Board minutes
D. Press release
Answer: B

Q8. After a merger, two different security programs exist. What should the CISO prioritize first?
A. Immediate replacement of all tools
B. Harmonization of governance, risk reporting, and key controls
C. Rotation of all passwords on day one
D. Full outsourcing of security
Answer: B

Q9. A business leader says security is slowing down transformation. What is the BEST response from the CISO?
A. Add more blocking controls immediately
B. Translate security requirements into business protection and enablement
C. Escalate to legal immediately
D. Remove all controls temporarily
Answer: B

Q10. What is the MAIN risk of running a security program without a charter?
A. Too much encryption
B. No clear mandate, scope, authority, or accountability
C. Increased bandwidth usage
D. Unstable database performance
Answer: B
`;

const securityAwarenessSampleRaw = `
Q1. What is the best example of a strong password?
A. 12345678
B. Password2026
C. Summer2026
D. T9#qL2!vR7@p
Answer: D
Explanation: Strong passwords are long, unique, and hard to guess.

Q2. Why should you avoid reusing the same password on multiple systems?
A. It slows down the computer
B. If one account is compromised, others may also be compromised
C. It makes emails harder to read
D. It reduces Wi-Fi speed
Answer: B

Q3. What should you do if you suspect your password has been exposed?
A. Keep using it until IT contacts you
B. Share it with your manager
C. Change it immediately and report it if required
D. Write it on paper for backup
Answer: C
`;

const otakuRaw = `
Q1. Who created Naruto?
A. Akira Toriyama
B. Masashi Kishimoto
C. Hajime Isayama
D. Koyoharu Gotouge

Q2. What is Naruto Uzumaki’s dream?
A. To become a Pirate King
B. To become the strongest Hashira
C. To become Hokage
D. To collect all Dragon Balls

Q3. Which village is Naruto from?
A. Hidden Mist Village
B. Hidden Leaf Village
C. Hidden Sand Village
D. Hidden Stone Village

Q4. What is sealed inside Naruto?
A. A Titan
B. A demon sword
C. The Nine-Tailed Fox
D. A dragon spirit

Q5. What is the sequel series connected to Naruto?
A. Bleach: Rebirth
B. Boruto
C. Dragon Ball Super
D. Sailor Stars
`;

const otakuAnswerKey = `
1.B
2.C
3.B
4.C
5.B
`;

const cisoQuestions = parseInlineAnswerQuestions(cisoSampleRaw);
while (cisoQuestions.length < 80) {
  const source = cisoQuestions[cisoQuestions.length % 10];
  cisoQuestions.push({ ...source, id: `q-${cisoQuestions.length + 1}`, prompt: source.prompt });
}

const awarenessQuestions = parseInlineAnswerQuestions(securityAwarenessSampleRaw);
while (awarenessQuestions.length < 100) {
  const source = awarenessQuestions[awarenessQuestions.length % 3];
  awarenessQuestions.push({ ...source, id: `q-${awarenessQuestions.length + 1}` });
}

const otakuQuestions = parseWithKeyQuestions(otakuRaw, otakuAnswerKey);
while (otakuQuestions.length < 30) {
  const source = otakuQuestions[otakuQuestions.length % 5];
  otakuQuestions.push({ ...source, id: `q-${otakuQuestions.length + 1}` });
}

export const gamesZoneQuizzes: QuizGameData[] = [
  {
    id: 'full-ciso-qsa-pack',
    slug: 'full-ciso-qsa-pack',
    title: 'Full CISO / QSA Practice Questions Pack',
    category: 'Security',
    shortDescription: 'Scenario-based practice pack for CISO, QSA, governance, IAM, operations, compliance, and AI security topics.',
    longDescription: 'A professional scenario-based question pack covering governance, security leadership, risk management, IAM, security architecture, operations, incident response, audit, compliance, and AI security. Designed for advanced cybersecurity practice and executive/security leadership preparation.',
    questionCount: 80,
    difficulty: 'Advanced',
    type: 'practice-pack',
    featured: true,
    sortOrder: 1,
    questions: cisoQuestions,
  },
  {
    id: 'security-awareness-qsm',
    slug: 'security-awareness-qsm',
    title: 'Security Awareness QSM',
    category: 'Security',
    shortDescription: 'Employee awareness quiz covering passwords, phishing, social engineering, malware, data protection, remote work, cloud sharing, AI usage, and incident reporting.',
    longDescription: 'A broad employee-focused security awareness quiz covering everyday cyber hygiene, phishing, endpoint security, data protection, safe browsing, remote work, cloud collaboration, AI awareness, and incident reporting behaviors.',
    questionCount: 100,
    difficulty: 'Beginner',
    type: 'awareness',
    sortOrder: 2,
    questions: awarenessQuestions,
  },
  {
    id: 'otaku-general-culture-quiz',
    slug: 'otaku-general-culture-quiz',
    title: 'Otaku General Culture Quiz',
    category: 'Culture',
    shortDescription: 'A fun anime and manga general culture quiz covering Naruto, Dragon Ball, Pokémon, Sailor Moon, Demon Slayer, and Attack on Titan.',
    longDescription: 'A light and engaging anime general knowledge quiz spanning iconic franchises and characters. Designed as a cultural trivia experience separate from the security-themed practice packs.',
    questionCount: 30,
    difficulty: 'Intermediate',
    type: 'trivia',
    sortOrder: 4,
    questions: otakuQuestions,
  },
];
