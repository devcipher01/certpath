export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number; // index of correct option
  explain?: string;
};

export type Tutorial = {
  title: string;
  minutes: number;
  summary: string;
  content: string[];
  keyPoints: string[];
  quiz: QuizQuestion[];
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  duration: string;
  lessons: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  coursePrice: number; // 9-19
  certPrice: number; // 9-19
  bundlePrice: number;
  tutorials: Tutorial[];
  examQuestions: number;
};

const buildContent = (topic: string): string[] => [
  `In this module we focus on ${topic}. You'll build a clear mental model, learn the vocabulary practitioners actually use, and see how the concept fits into the day-to-day workflow of the role.`,
  `We start with the "why" — the problem ${topic.toLowerCase()} solves and where it typically shows up on the job. Then we walk through an annotated example step by step so you can see the standard approach applied to a realistic scenario.`,
  `Next, you'll practice. Short guided exercises let you make the decisions a working professional would make, with feedback on the common mistakes so you can correct course early rather than reinforcing bad habits.`,
  `By the end of this lesson you should be able to explain ${topic} in your own words, recognize when it applies, and confidently execute the standard workflow without needing to look up every step.`,
];

const buildKeyPoints = (topic: string): string[] => [
  `Define ${topic} and describe when it applies.`,
  `Walk through the standard workflow end-to-end.`,
  `Recognize the most common mistakes and how to avoid them.`,
  `Apply the concept to a realistic on-the-job scenario.`,
];

const buildQuiz = (topic: string): QuizQuestion[] => [
  {
    q: `What is the main goal of the "${topic}" module?`,
    options: [
      `Build the working knowledge and skills needed to apply ${topic} on the job.`,
      `Memorize unrelated trivia about the industry.`,
      `Skip foundational material and jump straight to advanced topics.`,
      `Read passively without doing any practice exercises.`,
    ],
    answer: 0,
    explain: `Every module is designed around practical, job-ready application — not rote memorization.`,
  },
  {
    q: `Which habit best supports mastery of ${topic}?`,
    options: [
      `Reading the material once and never revisiting it.`,
      `Practicing with realistic scenarios and reviewing your mistakes.`,
      `Avoiding feedback because it feels uncomfortable.`,
      `Cramming right before the certification exam.`,
    ],
    answer: 1,
    explain: `Deliberate practice with feedback is the single strongest predictor of skill retention.`,
  },
  {
    q: `After completing this module, you should be able to:`,
    options: [
      `Recite the module title from memory.`,
      `Skip the certification exam entirely.`,
      `Explain ${topic}, know when it applies, and perform the standard steps.`,
      `Ignore documentation and established process.`,
    ],
    answer: 2,
    explain: `The learning objective is understanding, recognition of context, and correct execution.`,
  },
];

const t = (title: string, minutes: number, summary: string, topic: string): Tutorial => ({
  title,
  minutes,
  summary,
  content: buildContent(topic),
  keyPoints: buildKeyPoints(topic),
  quiz: buildQuiz(topic),
});

const makeTutorials = (topics: string[]): Tutorial[] =>
  topics.map((topic, i) =>
    t(
      `Module ${i + 1}: ${topic}`,
      12 + ((i * 7) % 25),
      `Core concepts, walkthroughs and practice for ${topic.toLowerCase()}.`,
      topic,
    ),
  );


const MEDICAL_TRANSCRIPTIONIST_TUTORIALS: Tutorial[] = [
  // ── Module 1: Medical Terminology Foundations ─────────────────────────────
  {
    title: "Module 1: Medical Terminology Foundations",
    minutes: 28,
    summary: "Learn how medical words are built from Greek and Latin roots, prefixes, and suffixes — and master the abbreviations used in everyday dictation.",
    content: [
      `Medical language looks intimidating until you learn its secret: almost every term is assembled from a small set of Greek and Latin building blocks. A prefix attaches to the front to modify meaning, a root carries the core idea, and a suffix at the end tells you what is happening. Once you know the parts, you can decode words you have never seen before.`,

      `**Common roots you will hear constantly:** cardi/o (heart), hepat/o (liver), nephr/o (kidney), pulmon/o (lung), gastr/o (stomach), neur/o (nerve), dermat/o (skin), oste/o (bone), my/o (muscle), and hem/o or hemat/o (blood). A doctor dictating "the patient has cardiomegaly" is literally saying "heart enlargement" — cardi (heart) + megaly (enlargement).`,

      `**Key prefixes:** brady- (slow), tachy- (fast), hyper- (above/excess), hypo- (below/deficient), peri- (around), sub- (under), inter- (between), poly- (many), dys- (painful or difficult), a-/an- (without). "Bradycardia" = slow heart rate. "Dyspnea" = difficulty breathing.`,

      `**Key suffixes:** -itis (inflammation), -ectomy (surgical removal), -plasty (surgical repair), -oscopy (visual examination), -ology (study of), -algia (pain), -emia (blood condition), -megaly (enlargement), -stenosis (narrowing). "Appendectomy" = removal of the appendix. "Arthralgia" = joint pain.`,

      `**Medical plurals follow Latin/Greek rules** rather than the usual English "add an s." You must know these because doctors dictate the singular and the plural interchangeably: bacterium → bacteria, diagnosis → diagnoses, criterion → criteria, vertebra → vertebrae, nucleus → nuclei, ovum → ova, phalanx → phalanges. Typing the wrong form is a transcription error that can affect record accuracy.`,

      `**Standard abbreviations in dictation:** Hx (history), Dx (diagnosis), Tx (treatment/therapy), Sx (symptoms), Rx (prescription), cc (chief complaint or cubic centimeter — context tells you which), SOB (shortness of breath), DOE (dyspnea on exertion), HTN (hypertension), DM (diabetes mellitus), URI (upper respiratory infection), UTI (urinary tract infection), PMH (past medical history), FH (family history), SH (social history), ROS (review of systems), PE (physical examination or pulmonary embolism — again, context matters), c/o (complains of), w/o (without), h/o (history of), s/p (status post — meaning after a procedure or event).`,

      `**Your workflow with terminology:** When you hear an unfamiliar term, do not guess. Leave a blank with the timestamp (e.g., "[blank 0:42]") and flag it for review. After you finish the document, consult a medical dictionary or trusted online resource (Merriam-Webster Medical, Stedman's) to verify spelling before submitting. Guessing and getting it wrong is more dangerous than leaving a blank.`,
    ],
    keyPoints: [
      "Break any medical word into prefix + root + suffix to decode its meaning.",
      "Memorize the 10 most common roots: cardi/o, hepat/o, nephr/o, pulmon/o, gastr/o, neur/o, dermat/o, oste/o, my/o, hem/o.",
      "Know the difference between similarly spelled terms: ileum (small intestine) vs. ilium (hip bone); pericardium (sac around heart) vs. perineum (pelvic floor area).",
      "Master Latin/Greek plural rules — incorrect plurals are transcription errors.",
      "Recognize common abbreviations in context — some abbreviations have two meanings (cc, PE).",
      "Never guess an unfamiliar term — leave a timestamped blank and flag for review.",
    ],
    quiz: [], // filled below
  },

  // ── Module 2: Anatomy for Transcriptionists ───────────────────────────────
  {
    title: "Module 2: Anatomy for Transcriptionists",
    minutes: 32,
    summary: "Understand the body planes, directional terms, and organ systems a transcriptionist encounters daily — enough to catch errors without needing a medical degree.",
    content: [
      `You do not need to know anatomy at a nurse's level, but you need enough to recognise when something in the dictation sounds anatomically wrong. A doctor who says "the patient has a fracture of the right tibia" while the rest of the note is about the left foot is a red flag — your anatomy knowledge is the safety net that catches it.`,

      `**Directional terms — always from the patient's perspective, not yours.** Anterior (front), posterior (back), medial (toward the body's midline), lateral (away from the midline), superior (toward the head), inferior (toward the feet), proximal (closer to the point of origin), distal (farther from the point of origin). A wound described as "proximal to the elbow" is near the shoulder end of the arm; "distal to the elbow" is near the wrist end.`,

      `**The three body planes:** Sagittal divides the body into left and right halves. Coronal (frontal) divides front and back. Transverse (axial) divides upper and lower. You will hear these most often in imaging reports: "a transverse CT cut at the level of L3" means a horizontal slice at the third lumbar vertebra.`,

      `**Organ systems you will encounter most often in general transcription:**\n• *Cardiovascular:* heart, aorta, coronary arteries, veins, capillaries. Key terms: myocardial infarction (heart attack), angina, arrhythmia, ejection fraction.\n• *Respiratory:* trachea, bronchi, lungs (lobes: upper, middle, lower on the right; upper, lower on the left), pleura. Key terms: pneumonia, pleural effusion, atelectasis, COPD, asthma, SpO₂.\n• *Musculoskeletal:* 206 bones, joints (articular cartilage, synovial fluid), tendons, ligaments, muscles. Key terms: fracture, sprain (ligament), strain (muscle/tendon), arthritis, herniated disc.\n• *Gastrointestinal:* esophagus, stomach, duodenum, small intestine (jejunum, ileum), large intestine (ascending, transverse, descending, sigmoid colon), rectum, liver, gallbladder, pancreas. Key terms: GERD, cholecystitis, diverticulitis, bowel obstruction.\n• *Nervous:* brain, spinal cord, peripheral nerves. Key terms: CVA (stroke), TIA (mini-stroke), neuropathy, paresthesia (numbness/tingling).`,

      `**Commonly confused structures — transcription danger zones:**\n• *Ileum* (small intestine) vs. *ilium* (part of the pelvis — also a bone). They sound identical when dictated quickly.\n• *Ureter* (tube from kidney to bladder) vs. *urethra* (tube from bladder out of body). Mixed up constantly in dictation.\n• *Mucous* (adjective: mucous membrane) vs. *mucus* (noun: the secretion itself).\n• *Pericardium* (sac around the heart) vs. *perineum* (pelvic floor region).\n• *Prostate* (male gland) vs. *prostrate* (lying face down — not a body part but doctors occasionally dictate it incorrectly).`,

      `**Your practical anatomy rule:** If something you typed sounds physically impossible — a lung condition in the abdomen section, a knee joint mentioned in a cardiac note with no context — flag it and leave a note. Anatomy errors in medical records can cause real harm to real patients.`,
    ],
    keyPoints: [
      "Directional terms always describe the patient's body from the patient's perspective.",
      "Know the three body planes: sagittal (left/right), coronal (front/back), transverse (upper/lower).",
      "Learn the five organ systems most common in general transcription work.",
      "Memorise the 'danger zone' pairs that sound alike: ileum/ilium, ureter/urethra, pericardium/perineum.",
      "Flag any anatomical placement that seems inconsistent with the rest of the document.",
    ],
    quiz: [], // filled below
  },

  // ── Module 3: Doctor's Notes & Report Structure ───────────────────────────
  {
    title: "Module 3: Doctor's Notes & Report Structure",
    minutes: 35,
    summary: "Master the SOAP note format and the five major report types you will transcribe every day — clinic notes, discharge summaries, operative reports, consult letters, and procedure notes.",
    content: [
      `Every medical document follows a predictable structure. Once you know the template, you can follow along even when the dictating physician speaks quickly, because you know what section is coming next. Structure is your roadmap.`,

      `**The SOAP Note — the backbone of ambulatory care:**\n• *Subjective (S):* What the patient says. Chief complaint (CC), History of Present Illness (HPI), Review of Systems (ROS), Past Medical History (PMH), Past Surgical History (PSH), Family History (FH), Social History (SH — smoking, alcohol, occupation, living situation). This section is written in the physician's voice reporting the patient's story.\n• *Objective (O):* What the clinician measures and observes. Vital signs (BP, HR, RR, Temp, SpO₂, weight), physical examination findings by system (HEENT, neck, chest/lungs, cardiovascular, abdomen, extremities, neurological), and results (labs, imaging).\n• *Assessment (A):* The diagnosis or differential diagnosis list. Often numbered: "1. Hypertension, uncontrolled. 2. Type 2 diabetes mellitus. 3. Hyperlipidemia."\n• *Plan (P):* What will be done — medications prescribed, tests ordered, referrals placed, follow-up interval, patient education given.`,

      `**Discharge Summary structure:** Admission date, discharge date, attending physician, admitting diagnosis, discharge diagnosis, hospital course (narrative of what happened during the stay), significant lab and imaging results, procedures performed, condition at discharge, discharge medications (with dosage and instructions), follow-up appointments, and patient education. This document is critical — insurance, legal, and continuity-of-care decisions all depend on it.`,

      `**Operative Report structure:** Pre-operative diagnosis, post-operative diagnosis (may differ if findings were unexpected), name of procedure(s), surgeon(s) and assistants, anesthesia type, indications for procedure, description of procedure (step-by-step narrative), findings, specimens sent to pathology, estimated blood loss (EBL), fluids given, drains placed, complications (or "none"), and condition at close. Pay attention to specimen descriptions — they must match what pathology receives.`,

      `**Radiology Report structure:** Clinical history (why the scan was ordered), technique (modality, views, contrast), comparison (prior studies if available), findings (organ-by-organ description of what is seen), impression (the radiologist's conclusion — the most important section; if a physician reads nothing else, they read the impression). The Impression should directly answer the clinical question.`,

      `**Consultation Letter structure:** Reason for consultation, referring physician, history of present illness, relevant past medical/surgical/family/social history, review of systems, physical examination, relevant data (labs, imaging), assessment and recommendations. A consult letter is a formal document from a specialist back to the referring provider — tone is professional and the recommendations section is the key output.`,

      `**Formatting rules that apply to all report types:** Dates in full format unless the facility style guide says otherwise (January 15, 2024, not 1/15/24). Medication names: generic names are lowercase (metformin), brand names are capitalized (Metformin → metformin is correct; Glucophage is the brand). Dosages follow exact dictation — never round or alter. Headings match the facility's template exactly. If the physician's dictation is unclear on a section boundary, default to the standard structure and flag the timestamp.`,
    ],
    keyPoints: [
      "SOAP = Subjective, Objective, Assessment, Plan — the standard outpatient note format.",
      "The Discharge Summary is a legal and clinical document; accuracy is critical for every field.",
      "In an Operative Report, the pre-op and post-op diagnoses may legally differ — transcribe both exactly.",
      "The Impression section of a Radiology Report is the most clinician-critical part.",
      "Generic drug names are lowercase; brand names are capitalized.",
      "Never alter dictated dosages — flag unclear amounts for physician review.",
    ],
    quiz: [], // filled below
  },

  // ── Module 4: HIPAA & Patient Confidentiality ─────────────────────────────
  {
    title: "Module 4: HIPAA & Patient Confidentiality",
    minutes: 25,
    summary: "Understand the 18 HIPAA identifiers, your obligations as a Business Associate, and the practical security habits that keep you — and your clients — compliant.",
    content: [
      `HIPAA (the Health Insurance Portability and Accountability Act of 1996) is federal law. As a transcriptionist you handle Protected Health Information (PHI) every day, which means you are automatically covered by HIPAA's Privacy and Security Rules. Non-compliance can result in civil fines from $100 to $50,000 per violation and criminal charges for knowing misuse. You do not need to be an attorney, but you do need to understand your obligations clearly.`,

      `**The 18 PHI identifiers — information that can identify a patient and must be protected:**\n1. Names\n2. Geographic data smaller than a state (street address, city, ZIP code)\n3. Dates other than year (birthdate, admission date, discharge date, date of death)\n4. Phone numbers\n5. Fax numbers\n6. Email addresses\n7. Social Security numbers\n8. Medical record numbers\n9. Health plan beneficiary numbers\n10. Account numbers\n11. Certificate/license numbers\n12. Vehicle identifiers and serial numbers\n13. Device identifiers and serial numbers\n14. Web URLs\n15. IP addresses\n16. Biometric identifiers (fingerprints, voice prints)\n17. Full-face photographs\n18. Any other unique identifying number or code\nIf a document contains ANY of these alongside health information, it is PHI and must be handled securely.`,

      `**Business Associate Agreements (BAA):** You are a Business Associate of every healthcare provider or facility you work for. Before handling any PHI, you and the covered entity must sign a BAA — a contract that spells out how you will protect the data, what you will do in case of a breach, and how you will dispose of PHI when the work is done. Never start work without a signed BAA. If an employer does not offer one, walk away.`,

      `**The Minimum Necessary Rule:** Only access, use, or disclose the minimum amount of PHI needed to do your job. You are transcribing a specific audio file — you should not be browsing a patient's full record history, requesting files you are not assigned to, or reading reports from other patients out of curiosity. "I was just looking" is not a defense under HIPAA.`,

      `**Practical security habits for a remote transcriptionist:**\n• Use a dedicated, encrypted work computer — not the family shared laptop.\n• Enable full-disk encryption (FileVault on Mac, BitLocker on Windows).\n• Use a VPN when connecting to client systems, especially over public Wi-Fi.\n• Store audio files and transcripts in the secure platform provided by your client — never on personal Google Drive, Dropbox, or iCloud.\n• Use strong, unique passwords and a password manager. Enable MFA on every work account.\n• Lock your screen whenever you step away from your desk.\n• Shred any printed documents containing PHI — do not put them in the recycling bin.\n• Delete audio files from your local machine as soon as you upload the finished transcript, unless your BAA says otherwise.`,

      `**Breach notification:** If you suspect you have had a data breach — your laptop was stolen, you sent a file to the wrong email address, your system was compromised — you must notify the covered entity immediately, even if you are not sure. Under HIPAA, breaches must be reported within 60 days of discovery. Early notification gives the covered entity time to assess the damage and comply with their own reporting obligations. Attempting to hide a breach or "handle it yourself" makes the situation legally much worse.`,
    ],
    keyPoints: [
      "HIPAA applies to you as a Business Associate — always sign a BAA before handling any PHI.",
      "Memorise the 18 PHI identifiers — if any are in a document, treat it as protected.",
      "Apply the Minimum Necessary Rule: only access what you need for the specific job.",
      "Use encrypted storage, a VPN, and a dedicated work device — not personal cloud accounts.",
      "Report a suspected breach to your client immediately — never try to manage it on your own.",
    ],
    quiz: [], // filled below
  },

  // ── Module 5: Transcription Software & Shortcuts ──────────────────────────
  {
    title: "Module 5: Transcription Software & Shortcuts",
    minutes: 30,
    summary: "Set up your workstation, master the foot pedal, use text expanders effectively, and learn the platform tools used by hospitals and transcription service organisations.",
    content: [
      `Professional medical transcription is done with a specific set of tools — not just Microsoft Word and a media player. Getting your workstation right before you start your first paid job is what separates a smooth workflow from constant frustration.`,

      `**The foot pedal:** This is the single most important piece of hardware for a transcriptionist. A USB transcription foot pedal (Infinity IN-USB-2 and Olympus RS-31H are industry standards) has three pedals: the centre pedal plays the audio, the left pedal rewinds a few seconds, and the right pedal fast-forwards. Your hands never leave the keyboard. The rewind distance is usually configurable in your software — set it to 3–5 seconds to match your natural catch-up pace. Most experienced transcriptionists listen at 80–90% of normal speed to start, then work up to 100% or even 105% as their accuracy improves.`,

      `**Transcription software platforms you will encounter:**\n• *Olympus DSS Player / Olympus Dictation Management System:* common in private practices and small clinics.\n• *Nuance / Dragon Medical One:* the dominant enterprise platform; integrates voice recognition with transcription editing. Many hospital jobs are editing Dragon drafts, not transcribing from raw audio.\n• *Dictaphone ExSpeech / PowerScribe:* older but still found in hospital radiology departments.\n• *nVoq / SpeakWrite / TranscribeMe:* cloud-based platforms used by transcription service organisations (MTSOs). You log in via browser, claim jobs, transcribe, and submit.\n• *InSync / ChartLogic / AdvancedMD:* EHR (Electronic Health Record) systems with built-in dictation modules — you may transcribe directly into structured fields rather than a free-text document.`,

      `**Text expanders save enormous time.** A text expander maps a short abbreviation to a full phrase. You type the shortcut and it immediately expands. Examples:\n• ".sob" → "shortness of breath"\n• ".htn" → "hypertension"\n• ".nkda" → "no known drug allergies"\n• ".vitals" → "Blood pressure: | Heart rate: | Respiratory rate: | Temperature: | Oxygen saturation: |" (with cursor stops at each field)\n• ".hpi" → "HISTORY OF PRESENT ILLNESS\\n"\n• ".norm" → "within normal limits"\nPopular text expander tools: Espanso (free, open-source), PhraseExpress (Windows, free tier), aText (Mac). Set these up before your first job — a well-built expander library can increase your output by 30–40%.`,

      `**Audio quality troubleshooting:** Not all dictation is clean. Background noise, phone audio, accents, and fast speech are normal. Use equalisation settings to boost the mid-range (1–4 kHz), where human voice sits. Noise-cancelling headphones (closed-back, over-ear) make a meaningful difference — studio monitor headphones like Audio-Technica ATH-M50x are popular among transcriptionists. If audio is genuinely unintelligible after adjusting your settings, flag the timestamp and move on — do not guess.`,

      `**Productivity metrics:** Most experienced medical transcriptionists produce 150–250 lines (65-character lines) per hour. A "line" in the industry is 65 keystrokes including spaces. Billing may be per line, per minute of audio, or per report. When evaluating a job offer, calculate your effective hourly rate: if a job pays $0.08/line and you produce 200 lines/hour, that is $16/hour. Track your own production daily to see where you are improving and where audio difficulty is slowing you down.`,
    ],
    keyPoints: [
      "A USB foot pedal is essential — it keeps your hands on the keyboard and dramatically raises output.",
      "Know the major platforms: Nuance/Dragon Medical One for hospitals, cloud MTSOs for freelance work.",
      "Build a text expander library before your first job — it can raise output by 30–40%.",
      "Use closed-back headphones and equalise audio to the 1–4 kHz voice range for difficult dictation.",
      "Track your lines-per-hour to know your real hourly rate on any per-line job.",
    ],
    quiz: [], // filled below
  },

  // ── Module 6: Editing Voice Recognition Drafts ────────────────────────────
  {
    title: "Module 6: Editing Voice Recognition Drafts",
    minutes: 27,
    summary: "Learn how to efficiently edit AI-generated transcription drafts — the primary workflow at most hospitals — catching the errors Dragon and similar systems consistently make.",
    content: [
      `Most hospital transcription jobs today are not raw transcription — they are medical transcription editing (MTE), also called speech recognition editing or front-end voice recognition editing. The physician dictates, an AI (usually Dragon Medical One) produces a draft in seconds, and your job is to listen to the original audio while reading the draft, correcting errors in real time. It is faster than typing from scratch, but it requires a different mental mode: you must actively listen and read simultaneously, rather than just listening.`,

      `**The editing workflow:**\n1. Open the audio and the AI-generated draft side by side.\n2. Start playback with your foot pedal at a comfortable speed (often 90–100% for editing vs. 75–85% for raw transcription).\n3. Read along with the draft while listening. When the audio and draft diverge, stop, correct, and continue.\n4. Never read ahead of the audio — a correct-looking phrase in the draft might have come from the wrong sentence.`,

      `**The errors Dragon makes — the consistent patterns to watch for:**\n• *Homophones and near-homophones:* "ileum" vs. "ilium", "murmur" vs. "mirror", "discreet" vs. "discrete", "affects" vs. "effects", "principal" vs. "principle". These look correct to a spell-checker but are medically wrong.\n• *Medical term mishearing:* Dragon might transcribe "appendectomy" as "a pen deck to me" or "Lasix" (a diuretic) as "lazy x". These are easy to catch if you are listening.\n• *Proper nouns:* Physician names, city names, patient names (where included by facility policy), drug brand names. Dragon often gets these wrong — it has no context for your specific facility's roster.\n• *Negation dropped:* "no fever" becomes "fever." This is a clinically dangerous error. Always verify negation words (no, not, without, denies) are present when the audio says them.\n• *Numbers and dosages:* "10 milligrams" might become "Tim milligrams" or the decimals might be misplaced — "0.5 mg" vs. "5 mg" is a ten-fold dosage error.\n• *Formatting collapsed:* Dragon often runs numbered lists into a single paragraph. You may need to reformat per the facility's style guide even if the words are correct.`,

      `**When to leave a blank vs. make your best guess:** If you are 95%+ confident in a word, type it. If you are below that threshold, leave a blank with a timestamp: [blank 2:14]. Never submit a guessed word that could be clinically wrong — a wrong drug name, a wrong diagnosis, a wrong body part. The physician review step exists precisely because some things require a clinical decision. Your job is to be accurate, not comprehensive.`,

      `**Flagging protocol:** Most platforms have a flag or "hold for review" function. Use it for: any blank you left, any section where the audio was genuinely unintelligible, any discrepancy between the dictated diagnosis and the rest of the note (e.g., the physician says "left knee" in the HPI but "right knee" in the plan), and any dictation that seems to be from the wrong patient (rare but it happens — physicians occasionally dictate into the wrong file).`,

      `**Speed targets for editing:** A skilled MTE editor can process 400–600 lines per hour — roughly double the raw transcription rate. In the first month of a new account, expect to run at 200–300 lines/hour as you learn the account's physicians, template, and style guide. Speed comes from familiarity. Keep a personal "physician quirks" note document: unusual pronunciations, common shorthand, preferred structure. This is your most valuable professional asset on any account.`,
    ],
    keyPoints: [
      "MTE (editing Dragon drafts) is the dominant hospital workflow — learn to listen and read simultaneously.",
      "Always verify negation words ('no', 'denies', 'without') — dropped negations are clinically dangerous.",
      "Homophones and near-homophones (ileum/ilium, murmur/mirror) are Dragon's most common error type.",
      "Number and dosage errors can be 10× off — always verify against the audio.",
      "Leave a timestamped blank rather than guessing any word you are not 95%+ confident in.",
      "A personal 'physician quirks' document is your most valuable long-term professional asset.",
    ],
    quiz: [], // filled below
  },

  // ── Module 7: Specialty Reports (Radiology, Pathology, Operative) ─────────
  {
    title: "Module 7: Specialty Reports (Radiology, Path, Op)",
    minutes: 38,
    summary: "Dive into the three most specialised report types — radiology, pathology, and operative notes — with the terminology and structure you need to transcribe them accurately.",
    content: [
      `Specialty reports are where you earn the higher pay tiers. General clinic notes are relatively straightforward; specialty reports are dense with technical vocabulary, require precise formatting, and leave little room for error. This module covers the three most common specialties in transcription: radiology, pathology, and surgery.`,

      `**Radiology Transcription:**\nYou will transcribe reports dictated by radiologists describing what they see on imaging studies.\n\n*Modalities:*\n• X-ray (plain film): bony structures, air/fluid levels, gross lung disease.\n• CT (computed tomography): cross-sectional images; excellent for bone, solid organs, bleeding, tumours. Often uses contrast (IV or oral) — note the type.\n• MRI (magnetic resonance imaging): soft tissue detail, neurological structures, joints. Protocols include T1, T2, FLAIR, DWI. "FLAIR hyperintensity" is a key phrase in brain MRI.\n• Ultrasound: liver, gallbladder, kidneys, thyroid, obstetric, vascular. Common findings: echogenicity, shadowing, vascularity on Doppler.\n• Nuclear medicine / PET: metabolic activity; key phrase "FDG-avid lesion" (fluorodeoxyglucose uptake = metabolically active, often malignant).\n\n*Structure:* Clinical history → Technique → Comparison → Findings (organ-by-organ) → Impression.\n\n*Critical terms:* mass, lesion, nodule (vague — size/characteristics follow), effusion (fluid in a body cavity), consolidation (airspace filled — often pneumonia), infiltrate, atelectasis (collapsed lung segment), edema, infarct, occlusion.`,

      `**Pathology Transcription:**\nPathologists examine tissue and body fluids removed during surgery or biopsy.\n\n*Structure of a pathology report:*\n• Clinical history (why specimen was taken)\n• Specimen received (what was sent to the lab, how many pieces, fixative used)\n• Gross description (macroscopic appearance — size in three dimensions, colour, consistency, margins)\n• Microscopic description (what is seen under the microscope — cell types, architecture, features)\n• Diagnosis / Final diagnosis (the definitive pathologic conclusion)\n• Comment (optional — additional context, staging information, correlation recommendations)\n\n*Key terminology:* benign vs. malignant, differentiation (well / moderately / poorly differentiated), margins (clear/negative = good; positive = tumour at the cut edge = bad), invasion (capsular, lymphovascular, perineural), necrosis, fibrosis, inflammation (acute = neutrophils, chronic = lymphocytes), dysplasia, carcinoma in situ, staging (pTNM — p = pathologic, T = tumour size, N = nodes, M = metastasis).`,

      `**Operative Report Transcription:**\nOp reports are dictated by the surgeon immediately after surgery.\n\n*Structure:*\n1. Pre-operative diagnosis\n2. Post-operative diagnosis (may differ — the surgeon may find unexpected findings)\n3. Procedure performed\n4. Surgeon(s), assistant(s)\n5. Anaesthesia (general, regional, local, MAC — monitored anaesthesia care)\n6. Indications (why surgery was needed)\n7. Description of procedure (the narrative core — step by step)\n8. Findings (what was actually seen)\n9. Specimens (name and destination — "appendix sent to pathology")\n10. Estimated blood loss (EBL) — in millilitres\n11. Fluids (IV fluids given, blood products)\n12. Drains (type and location if placed)\n13. Complications (or "none")\n14. Condition at close (or "stable to PACU")\n\n*Key vocabulary:* incision (cut into tissue), dissection (separating tissue planes), haemostasis (stopping bleeding), cauterisation/electrocautery, ligation (tying off a vessel), suture (closing tissue — know common sutures: Vicryl, Prolene, PDS, nylon, chromic), stapler (endoscopic stapling device), trocar (port for laparoscopic surgery), insufflation (inflating the abdomen with CO₂ for laparoscopy), anastomosis (joining two hollow structures), resection (removing a segment), lavage (washing out a cavity).`,

      `**A note on staging and grading:** These appear in both pathology and operative reports. "Stage" describes how far a cancer has spread (I through IV, or using pTNM). "Grade" describes how abnormal the cells look (Grade 1 = well differentiated, low-grade; Grade 3/4 = poorly differentiated, high-grade). These distinctions determine treatment — transcribing them incorrectly has direct consequences for the patient's care plan. If staging or grading terminology is unclear in the audio, leave a blank and flag it.`,
    ],
    keyPoints: [
      "Radiology reports always end with an Impression — the most clinician-critical section.",
      "Know the major imaging modalities: X-ray, CT, MRI, Ultrasound, PET — each has its own vocabulary.",
      "Pathology reports include gross and microscopic descriptions — both must be transcribed precisely.",
      "In operative reports, pre-op and post-op diagnoses may legally differ — transcribe both as dictated.",
      "EBL, specimens, and suture materials in op reports are legally significant — never estimate.",
      "Cancer staging and grading language determines treatment — flag unclear terms, never guess.",
    ],
    quiz: [], // filled below
  },

  // ── Module 8: Building Your Freelance Practice ────────────────────────────
  {
    title: "Module 8: Building Your Freelance Practice",
    minutes: 33,
    summary: "Set up a professional home office, find your first clients, price your services correctly, and build a sustainable freelance medical transcription business.",
    content: [
      `Medical transcription is one of the most accessible remote healthcare careers — all you need is a computer, a foot pedal, headphones, a quiet workspace, and the skills from this course. This final module covers the business side: where to find work, how to price it, and how to build a professional reputation that generates referrals.`,

      `**Ergonomics and workspace setup:** You will spend 6–8 hours a day at a keyboard. Invest in this correctly:\n• Monitor at eye level (top of screen at or slightly below eye height) to prevent neck strain.\n• Keyboard and mouse at a height where your elbows are at 90° and your wrists are neutral — not bent up or down.\n• Chair with lumbar support, adjustable height.\n• Dedicated quiet room or corner with a door — background noise bleeds into your focus and occasionally into your own recordings if you ever need to communicate with clients by audio.\n• Good headphone comfort matters over 8-hour sessions — over-ear, padded cups, adjustable headband.`,

      `**Where to find transcription work:**\n\n*MTSOs (Medical Transcription Service Organisations):* Companies that aggregate transcription demand from hospitals and clinics and subcontract to independent transcriptionists. They handle client relationships; you handle the work. Examples: MModal, Nuance/Solventum, Ciox/Datavant, Acusis, Amphion, MTSource. Most require a skills test before onboarding. These are the easiest starting point because volume is guaranteed and you do not need to find clients yourself.\n\n*Job boards:* Indeed, LinkedIn, and health IT-specific boards like Health IT Jobs. Search "medical transcription editor" or "speech recognition editor" — MTE roles pay better than raw transcription and are more commonly listed.\n\n*Direct contracts:* Approach small independent physician practices, urgent care clinics, or mental health private practices directly. These clients often cannot afford an MTSO's enterprise pricing and welcome an affordable, direct relationship. Bring a short service description, your rates, a sample BAA (attorney-reviewed), and proof of any relevant training or certification.\n\n*Freelance platforms:* Upwork and similar platforms host medical transcription gigs, but rates are often low and competition is global. Use them to build early reviews, not as a long-term income strategy.`,

      `**Pricing your services:**\nThe industry standard billing unit is the *65-character line* (counting all characters including spaces). Rates:\n• Entry-level / MTSO subcontract: $0.06–$0.08 per line\n• Experienced direct client work: $0.10–$0.14 per line\n• Specialty work (radiology, pathology): $0.12–$0.18 per line\n• Per audio minute: $1.50–$4.00 depending on specialty and turnaround time\n\nWhen pricing, calculate your effective hourly rate. If you produce 250 lines/hour at $0.10/line, that is $25/hour — a solid starting rate. As your speed increases toward 400 lines/hour, the same rate becomes $40/hour. Speed is your lever.\n\nStat (urgent) turnaround (4-hour or same-day) typically commands a 20–50% premium. Establish your standard turnaround as 24 hours and your stat rate clearly in your contract.`,

      `**Building your portfolio and reputation:**\nBefore approaching direct clients, complete at least 2–3 test transcriptions you can show (these can be anonymised practice audio from publicly available medical dictation training resources — there are many on YouTube and training sites). A portfolio demonstrates skill to clients who cannot evaluate transcription quality themselves.\n\nAsk every satisfied client for a brief written testimonial you can display on a simple professional website (a single-page site with your services, rates, BAA process, and contact info is sufficient). Referrals from one physician to their colleagues in the same practice group are the most reliable growth mechanism in this field.`,

      `**Managing taxes and contracts as a contractor:**\nAs an independent contractor you are responsible for:\n• Self-employment tax (15.3% of net earnings in the US — set aside 25–30% of every payment).\n• Quarterly estimated tax payments (due in April, June, September, January).\n• Business expense tracking: foot pedal, headphones, computer (prorated for work use), internet service (prorated), software subscriptions, professional development.\n• A signed contract with every client: services provided, rates, turnaround times, confidentiality obligations, BAA, payment terms (net 14 or net 30), and termination clause.\n\nUse accounting software (Wave — free, or QuickBooks Self-Employed) from your first invoice. Reconstructing a year of transactions at tax time is a nightmare best avoided.`,
    ],
    keyPoints: [
      "Invest in proper ergonomics — neck and wrist injuries are an occupational hazard in high-volume transcription.",
      "Start with an MTSO to build speed and account familiarity, then add direct client contracts for higher margins.",
      "Standard billing is per 65-character line ($0.06–$0.14 for general, $0.12–$0.18 for specialty).",
      "Stat turnaround (4-hour or same-day) commands a 20–50% premium — establish this rate clearly in contracts.",
      "Sign a contract and BAA with every client before handling any PHI.",
      "Set aside 25–30% of every payment for taxes and pay quarterly estimates — do not wait until April.",
    ],
    quiz: [], // filled below
  },
];

const MEDICAL_TRANSCRIPTIONIST_QUIZZES: QuizQuestion[][] = [
  // Module 1: What Is Medical Transcription?
  [
    {
      q: `What does a medical transcriptionist mainly do?`,
      options: [
        "Diagnose patients and write prescriptions",
        "Listen to doctors' recorded notes and type them into written documents",
        "Take patient blood pressure and vitals",
        "Schedule appointments at a doctor's office",
      ],
      answer: 1,
      explain: `A medical transcriptionist converts spoken audio recordings from doctors and nurses into accurate written records.`,
    },
    {
      q: `Where do most medical transcriptionists work?`,
      options: [
        "Only inside hospital operating rooms",
        "In pharmacies dispensing medication",
        "From home or a remote office, working on a computer",
        "In laboratories running medical tests",
      ],
      answer: 2,
      explain: `Medical transcription is one of the most popular remote healthcare jobs — most transcriptionists work from home using a computer and headset.`,
    },
    {
      q: `Which skill is most important for a medical transcriptionist?`,
      options: [
        "Being able to draw blood",
        "Strong listening and accurate typing",
        "Knowing how to perform surgery",
        "Reading X-rays and scans",
      ],
      answer: 1,
      explain: `The core skill is turning spoken words into error-free written text — which requires careful listening and precise typing.`,
    },
  ],
  // Module 2: Basic Body Knowledge
  [
    {
      q: `If a doctor's note mentions the patient's "left arm," whose left side does that refer to?`,
      options: [
        "The doctor's left as they face the patient",
        "Whichever arm looks injured",
        "The patient's own left arm",
        "It depends on the hospital",
      ],
      answer: 2,
      explain: `In medicine, body directions always refer to the patient's own left and right, not the doctor's perspective.`,
    },
    {
      q: `A doctor says a patient has pain in the "upper abdomen." Where on the body is that?`,
      options: [
        "The lower back",
        "The belly area, toward the chest",
        "The shoulder",
        "The knee",
      ],
      answer: 1,
      explain: `The abdomen is the belly area. "Upper abdomen" means the part closer to the chest, where organs like the stomach and liver sit.`,
    },
    {
      q: `Why is it helpful for a transcriptionist to know basic body parts?`,
      options: [
        "So they can treat patients themselves",
        "To notice when something in the recording sounds out of place and flag it",
        "To pass a surgery licensing exam",
        "Body knowledge is not useful for this job",
      ],
      answer: 1,
      explain: `Basic anatomy helps a transcriptionist catch obvious errors — like an organ being mentioned in the wrong part of the body — so they can flag it rather than type something incorrect.`,
    },
  ],
  // Module 3: Doctor's Notes & Report Structure
  [
    {
      q: `What does the "S" in a SOAP note stand for?`,
      options: ["Surgery", "Subjective (what the patient tells the doctor)", "Symptoms only seen on scans", "Schedule"],
      answer: 1,
      explain: `SOAP stands for Subjective, Objective, Assessment, Plan. The Subjective section records what the patient says about how they feel.`,
    },
    {
      q: `A doctor's note says "Rx: ibuprofen." What does "Rx" mean?`,
      options: [
        "The patient's name",
        "A medical test to be ordered",
        "Prescription or treatment ordered",
        "The doctor's signature",
      ],
      answer: 2,
      explain: `"Rx" is a common medical shorthand for prescription or recommended treatment. A transcriptionist types this correctly rather than guessing.`,
    },
    {
      q: `Why is it important to type a doctor's notes in the correct format?`,
      options: [
        "Formatting doesn't matter as long as the words are right",
        "Other doctors and nurses rely on a predictable structure to quickly find patient information",
        "Only the billing department cares about formatting",
        "Formatting is just about making documents look pretty",
      ],
      answer: 1,
      explain: `Medical staff read notes quickly during busy shifts. Consistent formatting means they can find the information they need fast, which is important for patient safety.`,
    },
  ],
  // Module 4: Privacy & Patient Confidentiality
  [
    {
      q: `HIPAA is a law that mainly protects:`,
      options: [
        "Doctors' salaries",
        "Hospital building codes",
        "Patients' private medical information",
        "Medical equipment warranties",
      ],
      answer: 2,
      explain: `HIPAA (Health Insurance Portability and Accountability Act) protects patients' health information from being shared without their permission.`,
    },
    {
      q: `You receive a medical file by accident that belongs to someone you know. What should you do?`,
      options: [
        "Read it — you already have it open",
        "Tell your friends about what you found",
        "Report the mistake through the proper channel without reading the file",
        "Keep it in case it becomes useful later",
      ],
      answer: 2,
      explain: `Accidentally receiving someone else's file must be reported right away. Reading it without authorization — even out of curiosity — is a privacy violation.`,
    },
    {
      q: `What is the safest way to send a completed medical document to a client?`,
      options: [
        "Your personal email account",
        "A text message",
        "A secure, encrypted platform approved by your employer",
        "Printing it and mailing it yourself",
      ],
      answer: 2,
      explain: `Medical records must travel through secure, encrypted channels. Personal email and text are not secure enough for sensitive patient information.`,
    },
  ],
  // Module 5: Tools of the Trade
  [
    {
      q: `What is a foot pedal used for in medical transcription?`,
      options: [
        "Adjusting your chair height",
        "Controlling audio playback so your hands stay free to type",
        "Printing finished documents",
        "Logging into the transcription software",
      ],
      answer: 1,
      explain: `A foot pedal lets you play, pause, rewind, and fast-forward the audio recording without taking your hands off the keyboard — a major speed booster.`,
    },
    {
      q: `What does "text expander" software do?`,
      options: [
        "Makes the text on your screen larger",
        "Translates documents into other languages",
        "Lets you type a short shortcut that automatically expands into a longer phrase",
        "Checks documents for spelling errors",
      ],
      answer: 2,
      explain: `Text expanders save time on frequently typed phrases. For example, typing "bp" might auto-expand to "blood pressure," reducing keystrokes.`,
    },
    {
      q: `A file is marked "STAT" in your queue. What does that mean?`,
      options: [
        "It's a low-priority file you can do later",
        "The file needs to be done immediately — it's urgent",
        "The audio quality is poor and needs technical review",
        "The file has already been completed",
      ],
      answer: 1,
      explain: `"STAT" is medical slang for immediately. A STAT file needs to jump to the front of the queue because it's urgently needed for patient care.`,
    },
  ],
  // Module 6: Listening, Typing & Accuracy
  [
    {
      q: `A voice recognition program types "high per tension" but the doctor said "hypertension." What should you do?`,
      options: [
        "Leave it as-is — the software is usually correct",
        "Delete the whole sentence",
        "Correct it to the proper term: hypertension",
        "Flag it as an error and skip the rest of the document",
      ],
      answer: 2,
      explain: `Voice recognition software often mishears medical terms. Your job as the editor is to catch and fix these errors before the document goes out.`,
    },
    {
      q: `You hear a medication name in a recording but it's unclear and you don't recognize it. What's the best move?`,
      options: [
        "Type your best guess at the spelling",
        "Substitute a medication name you do know",
        "Leave a blank or flag it so it can be verified before finalizing",
        "Skip that sentence entirely",
      ],
      answer: 2,
      explain: `Guessing a drug name is dangerous — a wrong medication name in a record could affect a patient's treatment. Always flag unclear terms for review.`,
    },
    {
      q: `Why does accuracy matter so much in medical transcription compared to other typing jobs?`,
      options: [
        "It doesn't — any transcription job needs accuracy",
        "Because errors in medical records can affect a patient's diagnosis or treatment",
        "Only for legal documents, not routine doctor's notes",
        "Accuracy only matters if the patient requests a copy",
      ],
      answer: 1,
      explain: `Medical records inform real decisions about patient care. A single typo or mishearing can lead to incorrect treatment — which is why accuracy is the #1 priority in this field.`,
    },
  ],
  // Module 7: Types of Medical Documents
  [
    {
      q: `What is an operative report?`,
      options: [
        "A bill sent to the patient after a hospital visit",
        "A written record of everything that happened during a surgical procedure",
        "A list of medications the patient takes daily",
        "An appointment reminder form",
      ],
      answer: 1,
      explain: `An operative report documents a surgery in detail — what was done, how, and any findings or complications. It becomes a permanent part of the patient's record.`,
    },
    {
      q: `A radiology report describes findings from an X-ray. What does a transcriptionist do with this?`,
      options: [
        "Interpret the X-ray images themselves",
        "Type up the radiologist's spoken description of what they saw on the scan",
        "Order additional scans for the patient",
        "File the physical X-ray images",
      ],
      answer: 1,
      explain: `A radiologist describes what they see in an image out loud; the transcriptionist types that description into a written report accurately.`,
    },
    {
      q: `What is a "discharge summary"?`,
      options: [
        "A document firing a hospital employee",
        "A note summarizing a patient's stay, treatment, and next steps when they leave the hospital",
        "A form patients sign when they arrive",
        "A list of hospital rules for patients",
      ],
      answer: 1,
      explain: `A discharge summary wraps up a hospital stay — what happened, what was treated, and what the patient should do next (medications, follow-ups, etc.).`,
    },
  ],
  // Module 8: Starting Out in the Field
  [
    {
      q: `What is a realistic way to start building experience as a new medical transcriptionist?`,
      options: [
        "Wait for hospitals to contact you",
        "Start with a transcription platform or agency that provides training and feedback on your work",
        "Only take high-paying jobs right away",
        "Avoid signing any agreements with clients",
      ],
      answer: 1,
      explain: `Transcription agencies and online platforms are great starting points — they provide work, feedback, and sometimes training, helping you build a track record.`,
    },
    {
      q: `Why do some transcriptionists choose to focus on one type of medical report (like radiology or cardiology)?`,
      options: [
        "Because general transcription pays more",
        "Specializing has no real benefit",
        "Becoming very familiar with one field's terms and format makes you faster and more accurate, and can lead to higher pay",
        "Clients prefer workers with no specialty",
      ],
      answer: 2,
      explain: `Specialization means you stop looking up every other word and start producing fast, clean documents — which is exactly what clients will pay a premium for.`,
    },
    {
      q: `Which of these is a warning sign when evaluating a transcription job or platform?`,
      options: [
        "They ask you to sign a confidentiality agreement",
        "They pay per line or per report",
        "They want you to handle patient files through your personal email or phone",
        "They offer a short paid test assignment",
      ],
      answer: 2,
      explain: `Legitimate transcription work always uses secure, encrypted systems for patient files. Any employer asking you to use personal email or an unsecured channel is cutting corners on privacy law.`,
    },
  ],
];

export const CATEGORIES = [
  "Healthcare",
  "Business",
  "Technology",
  "Creative",
  "Lifestyle",
] as const;

export const COURSES: Course[] = [
  {
    slug: "medical-transcriptionist",
    title: "Medical Transcriptionist",
    category: "Healthcare",
    tagline: "Turn dictated medical audio into accurate patient records.",
    description:
      "Learn medical terminology, transcription formatting, HIPAA compliance and the workflow used by hospitals and remote transcription agencies.",
    duration: "6 weeks",
    lessons: 8,
    level: "Beginner",
    coursePrice: 19,
    certPrice: 15,
    bundlePrice: 15,
    tutorials: MEDICAL_TRANSCRIPTIONIST_TUTORIALS.map((tut, i) => ({
      ...tut,
      quiz: MEDICAL_TRANSCRIPTIONIST_QUIZZES[i],
    })),
    examQuestions: 15,
  },
  {
    slug: "medical-coding-billing",
    title: "Medical Coding & Billing",
    category: "Healthcare",
    tagline: "ICD-10, CPT and clean claims from day one.",
    description: "Master ICD-10-CM, CPT and HCPCS codes plus the billing cycle, denials and payer rules.",
    duration: "8 weeks",
    lessons: 9,
    level: "Intermediate",
    coursePrice: 19,
    certPrice: 15,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "Intro to the Revenue Cycle",
      "ICD-10-CM Fundamentals",
      "CPT & E/M Coding",
      "HCPCS & Modifiers",
      "Claim Forms (CMS-1500 / UB-04)",
      "Payer Rules & Denials",
      "Compliance & Audits",
      "Practice Cases",
      "Career Paths",
    ]),
    examQuestions: 15,
  },
  {
    slug: "pharmacy-technician",
    title: "Pharmacy Technician Basics",
    category: "Healthcare",
    tagline: "Prep for a retail or hospital pharmacy role.",
    description: "Medication classes, dosage calculations, inventory, insurance and pharmacy law essentials.",
    duration: "5 weeks",
    lessons: 7,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Pharmacy Roles & Settings",
      "Top 200 Medications",
      "Dosage Calculations",
      "Sterile & Non-Sterile Compounding",
      "Insurance & Adjudication",
      "Inventory & Controlled Substances",
      "Pharmacy Law",
    ]),
    examQuestions: 15,
  },
  {
    slug: "medical-scribe",
    title: "Medical Scribe",
    category: "Healthcare",
    tagline: "Real-time EHR documentation for clinicians.",
    description: "Documentation workflows, EHR navigation, clinical terminology and note-taking that keeps up with the visit.",
    duration: "4 weeks",
    lessons: 6,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "The Scribe Role",
      "Common EHR Systems",
      "Chief Complaint & HPI",
      "Physical Exam Documentation",
      "Assessment & Plan",
      "Efficiency & Etiquette",
    ]),
    examQuestions: 15,
  },
  {
    slug: "phlebotomy-essentials",
    title: "Phlebotomy Essentials",
    category: "Healthcare",
    tagline: "Safe, confident blood draws.",
    description: "Venipuncture technique, tube order, patient care and lab safety.",
    duration: "4 weeks",
    lessons: 6,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Anatomy of Veins",
      "Equipment & PPE",
      "Order of Draw",
      "Venipuncture Technique",
      "Patient Interaction",
      "Lab Handling & Safety",
    ]),
    examQuestions: 15,
  },
  {
    slug: "ekg-technician",
    title: "EKG Technician",
    category: "Healthcare",
    tagline: "Read, run and troubleshoot 12-lead EKGs.",
    description: "Cardiac anatomy, lead placement, rhythm recognition and reporting.",
    duration: "5 weeks",
    lessons: 7,
    level: "Intermediate",
    coursePrice: 17,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "Cardiac Anatomy",
      "12-Lead Placement",
      "Reading Normal Sinus",
      "Common Arrhythmias",
      "Artifact & Troubleshooting",
      "Stress & Holter Testing",
      "Reporting to Clinicians",
    ]),
    examQuestions: 15,
  },
  {
    slug: "cna-fundamentals",
    title: "CNA Fundamentals",
    category: "Healthcare",
    tagline: "Foundational nursing assistant skills.",
    description: "Patient care, vitals, ADLs, safety and communication for CNAs.",
    duration: "6 weeks",
    lessons: 8,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Role of the CNA",
      "Infection Control",
      "Vitals & Measurement",
      "Bathing & Hygiene",
      "Mobility & Transfers",
      "Nutrition & Hydration",
      "Documentation",
      "Patient Rights",
    ]),
    examQuestions: 15,
  },
  {
    slug: "mental-health-first-aid",
    title: "Mental Health First Aid",
    category: "Healthcare",
    tagline: "Support people in psychological distress.",
    description: "Recognize signs, respond with the ALGEE framework and refer to appropriate care.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 9,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "Understanding Mental Health",
      "Depression & Anxiety",
      "Substance Use",
      "Crisis Response (ALGEE)",
      "Resources & Referral",
    ]),
    examQuestions: 15,
  },
  {
    slug: "project-management-pm101",
    title: "Project Management 101",
    category: "Business",
    tagline: "Ship projects on time, on scope, on budget.",
    description: "Scope, schedule, risk, stakeholders and both waterfall and agile fundamentals.",
    duration: "5 weeks",
    lessons: 7,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "PM Foundations",
      "Scope & WBS",
      "Scheduling & Gantt",
      "Risk Management",
      "Stakeholders & Comms",
      "Agile vs Waterfall",
      "Closing & Retrospective",
    ]),
    examQuestions: 15,
  },
  {
    slug: "scrum-master",
    title: "Scrum Master Essentials",
    category: "Business",
    tagline: "Facilitate high-performing agile teams.",
    description: "Scrum framework, ceremonies, servant leadership and common anti-patterns.",
    duration: "3 weeks",
    lessons: 5,
    level: "Intermediate",
    coursePrice: 15,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "The Scrum Framework",
      "Roles & Artifacts",
      "Ceremonies Deep Dive",
      "Facilitation Skills",
      "Anti-patterns & Fixes",
    ]),
    examQuestions: 15,
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing Foundations",
    category: "Business",
    tagline: "SEO, ads, email and analytics that actually convert.",
    description: "Build a modern funnel across SEO, paid, email and content with measurable results.",
    duration: "6 weeks",
    lessons: 8,
    level: "Beginner",
    coursePrice: 17,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "Marketing Funnels",
      "Keyword Research & SEO",
      "Google & Meta Ads",
      "Email & Lifecycle",
      "Content Strategy",
      "Landing Pages & CRO",
      "Analytics & Attribution",
      "Reporting to Stakeholders",
    ]),
    examQuestions: 15,
  },
  {
    slug: "bookkeeping-basics",
    title: "Bookkeeping Basics",
    category: "Business",
    tagline: "Keep clean books for any small business.",
    description: "Double-entry bookkeeping, reconciliations, payroll basics and month-end close.",
    duration: "5 weeks",
    lessons: 7,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Accounting Equation",
      "Chart of Accounts",
      "Journals & Ledgers",
      "Bank Reconciliations",
      "Payroll Basics",
      "Month-End Close",
      "Financial Statements",
    ]),
    examQuestions: 15,
  },
  {
    slug: "customer-service-pro",
    title: "Customer Service Pro",
    category: "Business",
    tagline: "Turn hard calls into loyal customers.",
    description: "Communication frameworks, de-escalation, and CSAT-driving habits.",
    duration: "2 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 9,
    certPrice: 9,
    bundlePrice: 12,
    tutorials: makeTutorials([
      "Tone & Empathy",
      "The LAST Framework",
      "De-escalation",
      "Written vs Voice Support",
      "CSAT & Feedback Loops",
    ]),
    examQuestions: 15,
  },
  {
    slug: "notary-public",
    title: "Notary Public Essentials",
    category: "Business",
    tagline: "Understand notarization duties and liability.",
    description: "Notarial acts, ID verification, journals and remote online notarization overview.",
    duration: "2 weeks",
    lessons: 4,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 12,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "Role & Jurisdiction",
      "Types of Notarial Acts",
      "ID & Journal Best Practices",
      "Remote Online Notarization",
    ]),
    examQuestions: 15,
  },
  {
    slug: "web-development-basics",
    title: "Web Development Basics",
    category: "Technology",
    tagline: "HTML, CSS and JavaScript from zero.",
    description: "Build responsive pages, add interactivity and understand how the web works.",
    duration: "6 weeks",
    lessons: 8,
    level: "Beginner",
    coursePrice: 17,
    certPrice: 12,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "How the Web Works",
      "HTML Structure",
      "CSS Layout & Flexbox",
      "Responsive Design",
      "JavaScript Basics",
      "DOM & Events",
      "Fetch & APIs",
      "Deploying Your Site",
    ]),
    examQuestions: 15,
  },
  {
    slug: "python-for-beginners",
    title: "Python for Beginners",
    category: "Technology",
    tagline: "Your first programming language, done right.",
    description: "Syntax, data structures, control flow, files and a small project.",
    duration: "5 weeks",
    lessons: 7,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Setting Up Python",
      "Variables & Types",
      "Control Flow",
      "Lists, Dicts & Sets",
      "Functions & Modules",
      "Files & Errors",
      "Mini Project",
    ]),
    examQuestions: 15,
  },
  {
    slug: "data-analytics-fundamentals",
    title: "Data Analytics Fundamentals",
    category: "Technology",
    tagline: "From spreadsheets to insight.",
    description: "Clean data, run analyses in Excel and SQL, and communicate findings.",
    duration: "6 weeks",
    lessons: 8,
    level: "Intermediate",
    coursePrice: 19,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "Thinking Like an Analyst",
      "Excel Power Features",
      "SQL Basics",
      "Joins & Aggregations",
      "Cleaning Messy Data",
      "Charts That Communicate",
      "Dashboards",
      "Sharing Findings",
    ]),
    examQuestions: 15,
  },
  {
    slug: "cybersecurity-awareness",
    title: "Cybersecurity Awareness",
    category: "Technology",
    tagline: "Protect yourself and your organization.",
    description: "Phishing, passwords, device hygiene, incident basics and compliance frameworks.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 12,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "The Threat Landscape",
      "Phishing & Social Engineering",
      "Passwords & MFA",
      "Device & Data Hygiene",
      "Incident Response Basics",
    ]),
    examQuestions: 15,
  },
  {
    slug: "excel-mastery",
    title: "Excel Mastery",
    category: "Technology",
    tagline: "Formulas, pivots and automation that impress.",
    description: "From SUMIFS to PivotTables to Power Query and lightweight automation.",
    duration: "4 weeks",
    lessons: 6,
    level: "Intermediate",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Formulas That Matter",
      "Lookup Functions",
      "PivotTables",
      "Charts & Dashboards",
      "Power Query",
      "Macros Overview",
    ]),
    examQuestions: 15,
  },
  {
    slug: "ai-prompt-engineering",
    title: "AI Prompt Engineering",
    category: "Technology",
    tagline: "Get consistently great output from LLMs.",
    description: "Prompt patterns, context design, evals and building safe assistants.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 17,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "How LLMs Work",
      "Prompt Patterns",
      "Context & Retrieval",
      "Evals & Iteration",
      "Safety & Guardrails",
    ]),
    examQuestions: 15,
  },
  {
    slug: "graphic-design-basics",
    title: "Graphic Design Basics",
    category: "Creative",
    tagline: "Principles that make good design obvious.",
    description: "Layout, typography, color and a portfolio-worthy final piece.",
    duration: "4 weeks",
    lessons: 6,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Design Principles",
      "Typography",
      "Color Theory",
      "Layout & Grids",
      "Tools Overview",
      "Portfolio Piece",
    ]),
    examQuestions: 15,
  },
  {
    slug: "video-editing-101",
    title: "Video Editing 101",
    category: "Creative",
    tagline: "Cut short-form video like a pro.",
    description: "Editing fundamentals, pacing, sound design and export presets.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 9,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "Story & Pacing",
      "Cuts & Transitions",
      "Sound Design",
      "Color Basics",
      "Export & Delivery",
    ]),
    examQuestions: 15,
  },
  {
    slug: "photography-fundamentals",
    title: "Photography Fundamentals",
    category: "Creative",
    tagline: "Master the exposure triangle and beyond.",
    description: "ISO, shutter, aperture, composition and editing basics.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 9,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "Camera Anatomy",
      "The Exposure Triangle",
      "Composition Rules",
      "Lighting",
      "Editing Workflow",
    ]),
    examQuestions: 15,
  },
  {
    slug: "food-handler-safety",
    title: "Food Handler Safety",
    category: "Lifestyle",
    tagline: "Serve food safely and legally.",
    description: "Hygiene, temperature control, cross-contamination and allergen awareness.",
    duration: "1 week",
    lessons: 4,
    level: "Beginner",
    coursePrice: 9,
    certPrice: 9,
    bundlePrice: 12,
    tutorials: makeTutorials([
      "Personal Hygiene",
      "Time & Temperature",
      "Cross-Contamination",
      "Allergens & Cleaning",
    ]),
    examQuestions: 15,
  },
  {
    slug: "personal-trainer-basics",
    title: "Personal Trainer Basics",
    category: "Lifestyle",
    tagline: "Design safe, effective training programs.",
    description: "Anatomy, program design, coaching cues and business fundamentals.",
    duration: "5 weeks",
    lessons: 7,
    level: "Beginner",
    coursePrice: 17,
    certPrice: 14,
    bundlePrice: 19,
    tutorials: makeTutorials([
      "Functional Anatomy",
      "Movement Screening",
      "Program Design",
      "Coaching Cues",
      "Nutrition Basics",
      "Client Retention",
      "Running Your Business",
    ]),
    examQuestions: 15,
  },
  {
    slug: "real-estate-fundamentals",
    title: "Real Estate Fundamentals",
    category: "Lifestyle",
    tagline: "Understand agency, contracts and closing.",
    description: "How US real estate transactions work, from listing to close.",
    duration: "4 weeks",
    lessons: 6,
    level: "Beginner",
    coursePrice: 15,
    certPrice: 12,
    bundlePrice: 17,
    tutorials: makeTutorials([
      "Agency & Fiduciary Duty",
      "Listings & MLS",
      "Contracts",
      "Financing",
      "Inspections & Appraisals",
      "Closing the Deal",
    ]),
    examQuestions: 15,
  },
  {
    slug: "childcare-provider",
    title: "Childcare Provider",
    category: "Lifestyle",
    tagline: "Safe, nurturing childcare essentials.",
    description: "Developmental stages, safety, communication with families and first aid basics.",
    duration: "3 weeks",
    lessons: 5,
    level: "Beginner",
    coursePrice: 12,
    certPrice: 9,
    bundlePrice: 15,
    tutorials: makeTutorials([
      "Child Development",
      "Safety & Supervision",
      "Discipline & Communication",
      "First Aid Basics",
      "Working With Families",
    ]),
    examQuestions: 15,
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
