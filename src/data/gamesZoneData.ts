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



const aiTopicRaw = `
Q1. What does AI stand for?
A. Automated Internet
B. Artificial Intelligence
C. Advanced Interface
D. Applied Integration

Q2. Which statement best describes AI?
A. A machine-based capability to perform tasks involving prediction, reasoning, language, or decision support
B. A type of hardware cable
C. A database backup method
D. A network firewall rule

Q3. Which of the following is an example of AI in daily life?
A. Spam filtering in email
B. A paper notebook
C. A power cable
D. A USB port

Q4. Which of the following is closest to a core goal of AI?
A. To replace electricity
B. To enable systems to perform tasks that usually require human-like intelligence
C. To eliminate all software bugs
D. To increase monitor brightness

Q5. Which output can an AI system generate?
A. Predictions
B. Recommendations
C. Content
D. All of the above

Q6. Which field is most closely related to AI?
A. Machine learning
B. Astronomy only
C. Plumbing
D. Civil construction

Q7. Which of the following is a common AI capability?
A. Image recognition
B. Language understanding
C. Pattern detection
D. All of the above

Q8. AI systems are often designed to:
A. Infer patterns from data
B. Learn from examples or rules
C. Support decisions or automation
D. All of the above

Q9. Which one is NOT typically considered an AI task?
A. Classifying an image
B. Translating text
C. Detecting fraud patterns
D. Tightening a screw with a manual screwdriver only

Q10. Which statement is most correct?
A. AI and robotics are always the same thing
B. AI can exist in software without a robot
C. AI only works on the internet
D. AI is only for large companies

Q11. What is machine learning?
A. A way for systems to learn patterns from data
B. A keyboard type
C. A battery technology
D. A video format

Q12. In supervised learning, the model learns from:
A. Labeled data
B. No data
C. Random electricity
D. Hardware drivers only

Q13. In unsupervised learning, the model mainly tries to:
A. Find hidden patterns or groupings in data
B. Build physical servers
C. Print documents
D. Replace all labels manually

Q14. Which is an example of a supervised learning task?
A. Email spam vs non-spam classification
B. Grouping customers without labels
C. Compressing a ZIP file
D. Restarting a router

Q15. Which is an example of unsupervised learning?
A. Clustering similar customers
B. Predicting house price from labeled examples
C. Translating English to French
D. Creating a PowerPoint slide manually

Q16. What is a feature in machine learning?
A. An input variable used by the model
B. A software license
C. A network switch
D. A battery unit

Q17. What is a label in supervised learning?
A. The correct target output
B. A chart color
C. A login session
D. A storage partition

Q18. What is overfitting?
A. When a model performs well on training data but poorly on new data
B. When a laptop overheats
C. When a file is too large
D. When a printer jams

Q19. What is underfitting?
A. When a model is too simple to capture useful patterns
B. When a model is encrypted
C. When a hard drive is full
D. When an API times out

Q20. Why is test data important?
A. To estimate how the model performs on unseen data
B. To slow down training
C. To increase storage cost
D. To disable learning

Q21. Deep learning is best described as:
A. A subset of machine learning using multilayer neural networks
B. A backup method
C. A firewall type
D. A database engine

Q22. A neural network is inspired loosely by:
A. Human brain structure
B. Car engines
C. Power grids
D. Building foundations

Q23. What is a neuron in a neural network?
A. A computational unit that processes input and produces output
B. A USB device
C. A hardware fan
D. A text editor

Q24. What is an epoch in training?
A. One full pass through the training dataset
B. A GPU brand
C. A cloud region
D. A screen setting

Q25. What is a common strength of deep learning?
A. It can learn complex patterns from large amounts of data
B. It eliminates all bias automatically
C. It needs no compute resources
D. It always explains itself clearly

Q26. Which of the following often powers state-of-the-art vision and language systems?
A. Deep learning
B. Fax machines
C. Manual filing
D. Mechanical clocks

Q27. What is backpropagation used for?
A. Updating model weights during training
B. Sending emails backward
C. Compressing files
D. Encrypting a hard disk

Q28. What is a common challenge with deep learning?
A. It can require large datasets and compute resources
B. It never scales
C. It cannot process images
D. It only works offline

Q29. Which statement is most accurate?
A. All AI is deep learning
B. All machine learning is deep learning
C. Deep learning is a subset of machine learning
D. Deep learning is unrelated to AI

Q30. Why are neural networks called “deep” in deep learning?
A. Because they have multiple layers
B. Because they work underwater
C. Because they store data deeply
D. Because they need deep voices

Q31. What does NLP stand for?
A. Neural Logic Processing
B. Natural Language Processing
C. Network Learning Protocol
D. Numerical Language Program

Q32. NLP mainly deals with:
A. Human language in text or speech
B. Cooling systems
C. Hard-drive assembly
D. Electrical wiring

Q33. What is an LLM?
A. A Large Language Model
B. A Low-Level Module
C. A Local Logic Machine
D. A Long Link Method

Q34. LLMs are mainly designed to:
A. Process and generate language
B. Paint walls
C. Charge batteries
D. Manufacture laptops

Q35. What is a prompt?
A. The instruction or input given to an AI model
B. A monitor cable
C. A cooling unit
D. A spreadsheet formula only

Q36. What is generative AI?
A. AI that can create new content such as text, images, audio, code, or video
B. AI that only stores files
C. AI that only deletes logs
D. AI that only manages printers

Q37. Which is an example of generative AI output?
A. A generated summary
B. An AI-created image
C. AI-written code
D. All of the above

Q38. What is a token in many language models?
A. A chunk of text processed by the model
B. A physical hard disk
C. A Wi-Fi antenna
D. A password type

Q39. What is one common limitation of LLMs?
A. They can produce fluent but incorrect answers
B. They only answer in one word
C. They cannot process any text
D. They never make mistakes

Q40. What does “hallucination” mean in GenAI?
A. The model generates false or unsupported information confidently
B. The GPU stops working
C. The user loses internet
D. The screen turns blue

Q41. Computer vision mainly focuses on:
A. Understanding images and video
B. Writing legal contracts
C. Building routers
D. Managing payroll

Q42. Which is a computer vision use case?
A. Face detection
B. Object recognition
C. Medical image analysis
D. All of the above

Q43. Speech recognition converts:
A. Spoken language into text
B. Text into electricity
C. Images into cables
D. Video into hardware

Q44. Which is a real-world AI use case in banking?
A. Fraud detection
B. Credit risk modeling
C. Customer support automation
D. All of the above

Q45. Which is a common AI use case in healthcare?
A. Medical imaging support
B. Clinical note summarization
C. Patient risk prediction
D. All of the above

Q46. Recommendation systems are designed to:
A. Suggest products, content, or actions based on patterns
B. Replace databases
C. Reduce monitor size
D. Encrypt office doors

Q47. Which area commonly uses AI for predictive maintenance?
A. Industry and manufacturing
B. Paper filing only
C. Cafeteria menus
D. Desk lamps

Q48. Chatbots are most closely associated with:
A. Conversational AI
B. Disk formatting
C. Physical networking
D. Cooling infrastructure

Q49. Which is a likely AI use case in cybersecurity?
A. Anomaly detection
B. Malware classification
C. Phishing detection support
D. All of the above

Q50. Which statement is most accurate?
A. AI use cases depend heavily on context, data quality, and business needs
B. AI always gives the same value everywhere
C. AI removes the need for human judgment in all cases
D. AI only helps with image tasks

Q51. Which is an important characteristic of trustworthy AI?
A. Transparency
B. Safety
C. Privacy enhancement
D. All of the above

Q52. What does AI bias mean?
A. Systematic unfairness in outcomes or treatment
B. Better model speed
C. Hardware failure
D. Data compression

Q53. Why is explainability important in some AI systems?
A. Users and stakeholders may need to understand why a model made a decision
B. It increases fan speed
C. It replaces testing
D. It removes all risk

Q54. Which is the best example of an AI governance control?
A. AI use policy and approval process
B. Changing screen wallpaper
C. Turning off laptops at lunch
D. Replacing office chairs

Q55. What is a key risk of using poor-quality training data?
A. Lower model reliability and potentially unfair outcomes
B. Better transparency
C. Less need for testing
D. Automatic compliance

Q56. Human oversight in AI is important because:
A. AI outputs may be wrong, risky, or contextually inappropriate
B. AI always works perfectly alone
C. Humans are never needed in decisions
D. Oversight weakens all systems

Q57. Which statement is most correct?
A. A powerful model automatically means ethical use
B. Responsible AI needs governance, controls, monitoring, and context-aware use
C. Ethics only matters in public sector AI
D. Bias is impossible in AI systems

Q58. Which of the following is a privacy-related AI concern?
A. Using sensitive personal data without proper control
B. Low battery life
C. Office noise
D. Slow typing speed

Q59. Which practice best supports responsible AI adoption?
A. Inventorying AI use cases and assessing risk before deployment
B. Letting every team deploy any AI tool without review
C. Sharing sensitive prompts publicly
D. Skipping model validation

Q60. Fairness in AI most closely relates to:
A. Avoiding harmful discrimination and unjust outcomes
B. Making all outputs identical
C. Increasing file size
D. Faster network speed

Q61. What is prompt injection?
A. Malicious input designed to manipulate an LLM’s behavior
B. A printer issue
C. A battery problem
D. A type of monitor cable

Q62. Sensitive information disclosure in LLM systems refers to:
A. The model revealing confidential data in outputs
B. A slow boot process
C. Large image size
D. Bad keyboard layout

Q63. What is model denial of service?
A. Overloading an AI system with expensive or abusive requests
B. A new GPU upgrade
C. Compressing model files
D. A keyboard shortcut

Q64. What does “excessive agency” mean in AI security?
A. Giving an AI system too much autonomous power to act
B. Giving users less storage
C. Reducing prompts
D. Limiting monitor resolution

Q65. What is training data poisoning?
A. Tampering with training data to influence model behavior
B. Cooling a data center
C. Formatting a hard disk
D. Encrypting an API

Q66. What is a main risk of connecting an LLM to powerful external tools?
A. It may perform unintended or unauthorized actions
B. It automatically becomes fair
C. It eliminates all security needs
D. It no longer needs access control

Q67. What is the safest approach for high-risk AI actions?
A. Human-in-the-loop approval
B. Fully unrestricted automation
C. Shared admin accounts
D. No monitoring

Q68. What is a supply chain risk in AI?
A. Risk from compromised models, plugins, datasets, or dependencies
B. A printer paper shortage
C. A short email
D. A long password

Q69. Why is logging important for enterprise AI systems?
A. To support monitoring, abuse detection, troubleshooting, and accountability
B. To make prompts longer
C. To reduce all costs to zero
D. To remove privacy obligations

Q70. Which is a good control for AI systems handling sensitive data?
A. Least privilege, filtering, monitoring, and policy-based access
B. Public access by default
C. Shared root credentials
D. No review at all

Q71. What is usually the first step in enterprise AI adoption?
A. Identify business use cases and assess value and risk
B. Buy the biggest GPU immediately
C. Replace all employees
D. Ban all data

Q72. What is a common reason AI projects fail?
A. Poor data quality or weak business alignment
B. Too much clarity
C. Too little electricity in keyboards
D. Excess paper use

Q73. What is the role of data in AI?
A. It is foundational for training, testing, and operating many AI systems
B. It is optional in all models
C. It only matters in robotics
D. It is irrelevant after deployment

Q74. What does model monitoring help detect after deployment?
A. Drift, performance issues, anomalies, and unexpected behavior
B. Chair height
C. Office temperature only
D. Cable color

Q75. What is model drift?
A. When model performance changes over time due to changing data or context
B. A car movement
C. A cloud storage plan
D. A monitor setting

Q76. Why is ROI important in AI projects?
A. Organizations need to understand business value relative to cost and risk
B. It changes the neural network shape
C. It replaces governance
D. It is only for marketing teams

Q77. Which team combination is often needed for enterprise AI success?
A. Business, data, technology, security, legal, and governance stakeholders
B. Only one developer
C. Only procurement
D. Only the CEO

Q78. What is the best description of a mature AI program?
A. Governed, monitored, risk-aware, business-aligned, and controlled
B. Uncontrolled but fast
C. Secret and undocumented
D. Based only on hype

Q79. Why should organizations maintain an inventory of AI systems and use cases?
A. To improve governance, oversight, and risk management
B. To make files heavier
C. To disable approvals
D. To avoid accountability

Q80. Which statement is most accurate about AI adoption?
A. Successful AI requires not only models, but also data, security, governance, monitoring, and business alignment
B. Model size alone guarantees success
C. AI can be adopted safely without any policy
D. AI removes the need for human responsibility
`;

const aiTopicAnswerKey = `
1.B 2.A 3.A 4.B 5.D 6.A 7.D 8.D 9.D 10.B
11.A 12.A 13.A 14.A 15.A 16.A 17.A 18.A 19.A 20.A
21.A 22.A 23.A 24.A 25.A 26.A 27.A 28.A 29.C 30.A
31.B 32.A 33.A 34.A 35.A 36.A 37.D 38.A 39.A 40.A
41.A 42.D 43.A 44.D 45.D 46.A 47.A 48.A 49.D 50.A
51.D 52.A 53.A 54.A 55.A 56.A 57.B 58.A 59.A 60.A
61.A 62.A 63.A 64.A 65.A 66.A 67.A 68.A 69.A 70.A
71.A 72.A 73.A 74.A 75.A 76.A 77.A 78.A 79.A 80.A
`;

const barcelonaRaw = `
Q1. What does FCB stand for?
A. Football Club Bilbao
B. Futbol Club Barcelona
C. Federation Club Barcelona
D. Football Catalunya Base
Answer: B

Q2. What is the common nickname of FC Barcelona?
A. Los Blancos
B. Barça
C. Colchoneros
D. Rossoneri
Answer: B

Q3. What are Barça fans commonly called?
A. Madridistas
B. Culers / Culés
C. Gooners
D. Nerazzurri
Answer: B

Q4. FC Barcelona is based in which region?
A. Andalusia
B. Catalonia
C. Valencia
D. Basque Country
Answer: B

Q5. Which phrase is strongly associated with FC Barcelona’s identity?
A. You’ll Never Walk Alone
B. Més que un club
C. Mia San Mia
D. Dream Bigger
Answer: B

Q6. What are official Barça supporters’ clubs called?
A. Ultras
B. Penyes
C. Barras
D. Firms
Answer: B

Q7. Which colors are traditionally associated with Barça?
A. White and gold
B. Blue and garnet
C. Black and white
D. Red and white
Answer: B

Q8. Which initials were historically changed under Franco-era pressure?
A. FCB to BCF
B. FCB to CFB
C. FCB to FBB
D. FCB to BFC
Answer: B

Q9. FC Barcelona competes in which top domestic league?
A. Serie A
B. Ligue 1
C. La Liga
D. Bundesliga
Answer: C

Q10. “Culers” originally referred to what unusual image of early supporters?
A. Their flags
B. Their hats
C. Their backsides seen from outside the ground
D. Their red shoes
Answer: C
`;

const aiTopicQuestions = parseWithKeyQuestions(aiTopicRaw, aiTopicAnswerKey);
const barcelonaQuestions = parseInlineAnswerQuestions(barcelonaRaw);

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
    id: 'ai-topic-qsm',
    slug: 'ai-topic-qsm',
    title: 'AI Topic QSM',
    category: 'Security',
    shortDescription: '80-question AI fundamentals, security, governance, and enterprise adoption quiz pack.',
    longDescription: 'Comprehensive AI quiz covering fundamentals, machine learning, deep learning, LLMs, use cases, ethics, AI security, and enterprise adoption strategy.',
    questionCount: 80,
    difficulty: 'Intermediate',
    type: 'quiz',
    sortOrder: 3,
    questions: aiTopicQuestions,
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
  {
    id: 'fc-barcelona-hardcore-fan-quiz',
    slug: 'fc-barcelona-hardcore-fan-quiz',
    title: 'FC Barcelona Hardcore Fan Quiz',
    category: 'Entertainment',
    shortDescription: '10 questions for dedicated Barça fans about identity, history, and culture.',
    longDescription: 'A focused FC Barcelona trivia challenge for hardcore fans covering symbols, region, culture, and history.',
    questionCount: 10,
    difficulty: 'Intermediate',
    type: 'trivia',
    sortOrder: 31,
    questions: barcelonaQuestions,
  },
];
