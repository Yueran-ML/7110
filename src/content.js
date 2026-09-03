// All user-facing content for the Waypoint prototype, in English and Chinese.
// Every claim about the Australian system is written as a step or a plain explanation,
// never as a diagnosis or a price promise. Each step names who does it and where it came from.

export const CONTENT_DATE = '2026-09-04'

export const ui = {
  appName: { en: 'Waypoint', zh: 'Waypoint' },
  tagline: { en: 'Your GP visit, one step at a time', zh: '看 GP，一步一步来' },
  prototype: { en: 'Prototype for research testing', zh: '研究测试用原型' },
  tabs: {
    home: { en: 'Home', zh: '首页' },
    before: { en: 'Before', zh: '就诊前' },
    visit: { en: 'Visit', zh: '就诊中' },
    after: { en: 'After', zh: '就诊后' },
    terms: { en: 'Terms', zh: '术语' },
    notes: { en: 'My notes', zh: '我的笔记' },
  },
  home: {
    title: { en: 'Where are you in your visit?', zh: '你现在走到哪一步了？' },
    lead: {
      en: 'Pick the stage you are at. Each screen answers one question: what do I do next?',
      zh: '选一个阶段。每一屏只回答一个问题：接下来我该做什么？',
    },
    notesLink: { en: 'Open my notes', zh: '打开我的笔记' },
    termsLink: { en: 'Look up a term', zh: '查一个术语' },
  },
  stages: {
    before: {
      title: { en: 'Before you go', zh: '去之前' },
      q: { en: 'Which service? What will it cost? How do I book?', zh: '去哪种诊所？花多少钱？怎么预约？' },
    },
    visit: {
      title: { en: 'At the appointment', zh: '看医生时' },
      q: { en: 'How do I explain my symptoms and what should I ask?', zh: '怎么说清症状？该问什么？' },
    },
    after: {
      title: { en: 'After the doctor', zh: '看完医生' },
      q: { en: 'I have a prescription, a referral, a receipt. Now what?', zh: '手里有处方、转诊信、收据，然后呢？' },
    },
  },
  before: {
    sections: {
      services: { en: 'Which service', zh: '去哪里' },
      cost: { en: 'Cost & OSHC', zh: '费用与 OSHC' },
      booking: { en: 'Booking', zh: '预约' },
    },
    servicesLead: {
      en: 'Four places students end up. This guide does not judge how serious your symptoms are: if you are unsure, use the Healthdirect Symptom Checker or call 1800 022 222, 24 hours. In Queensland you can also call 13 HEALTH on 13 43 25 84.',
      zh: '学生通常会去的四个地方。本指南不判断你的症状有多严重：不确定时，用 Healthdirect 的症状自查（Symptom Checker），或拨打 1800 022 222（24 小时）。在昆士兰也可以拨打 13 HEALTH：13 43 25 84。',
    },
    emergency: { en: 'Emergency? Call 000.', zh: '紧急情况？拨打 000。' },
    costLead: {
      en: 'You cannot know the exact cost in advance unless you ask. Here is how the money moves, and the two questions that settle it.',
      zh: '不问就没法提前知道确切费用。下面是钱怎么走的，以及两个问清楚就够的问题。',
    },
    askTitle: { en: 'Ask the clinic when you book', zh: '预约时问诊所' },
    bookingLead: {
      en: 'Most clinics take online bookings. Have these ready.',
      zh: '大多数诊所可以网上预约。准备好这些。',
    },
    whatLabel: { en: 'What it is for', zh: '管什么' },
    costLabel: { en: 'Cost', zh: '费用' },
    tipLabel: { en: 'Tip', zh: '提示' },
  },
  visit: {
    title: { en: 'Prep card', zh: '准备卡' },
    lead: {
      en: 'Fill this in before you go in. Show the English card to the doctor; the Chinese line is for you.',
      zh: '进诊室前填好。英文卡片给医生看，中文那行给你自己看。',
    },
    example: { en: 'Example filled in. Edit it to match you.', zh: '这是示例，改成你自己的情况。' },
    symptom: { en: 'What is wrong?', zh: '哪里不舒服？' },
    symptomPh: { en: 'e.g. sore throat and a cough', zh: '例如：喉咙痛、咳嗽' },
    since: { en: 'Since when?', zh: '从什么时候开始？' },
    severity: { en: 'How bad, 0 to 10?', zh: '有多严重，0 到 10 分？' },
    trend: { en: 'Is it changing?', zh: '有变化吗？' },
    tried: { en: 'What have you tried?', zh: '你试过什么？' },
    triedPh: { en: 'e.g. rest, throat lozenges from the pharmacy', zh: '例如：休息、药房买的润喉糖' },
    questions: { en: 'Questions to ask', zh: '想问的问题' },
    showDoctor: { en: 'Show this to the doctor', zh: '给医生看这段（英文）' },
    forYou: { en: 'For you', zh: '给你自己看' },
    copy: { en: 'Copy card', zh: '复制卡片' },
    copied: { en: 'Copied', zh: '已复制' },
    tip: {
      en: 'Ask the doctor to write down the diagnosis and the medicine name. You can look the words up in Terms afterwards.',
      zh: '请医生把诊断和药名写下来。之后可以在"术语"里查。',
    },
  },
  after: {
    title: { en: 'What did you leave with?', zh: '你从诊所带走了什么？' },
    lead: {
      en: 'Tap everything the doctor gave you. Your next steps appear below, with who does each one.',
      zh: '点选医生给你的所有东西。下面会列出下一步，以及每一步归谁做。',
    },
    exampleHint: {
      en: 'Example: prescription and referral are selected. Tap the slips to match your visit.',
      zh: '示例：已选中处方和转诊信。点一下换成你自己的情况。',
    },
    dismiss: { en: 'Got it', zh: '知道了' },
    stepsTitle: { en: 'Your next steps', zh: '你的下一步' },
    empty: { en: 'Select at least one item above.', zh: '先在上面选至少一项。' },
    progress: { en: 'done', zh: '已完成' },
    saveNotes: { en: 'Keep these in my notes', zh: '存到我的笔记' },
    saved: { en: 'Added to my notes', zh: '已加入我的笔记' },
    sourceLabel: { en: 'Source', zh: '来源' },
  },
  terms: {
    title: { en: 'Terms you will hear', zh: '你会听到的词' },
    lead: {
      en: 'Words that show up on forms, receipts and in the consultation. Tap one to open it.',
      zh: '表格、收据和问诊里会出现的词。点开看解释。',
    },
    search: { en: 'Search in English or 中文', zh: '用中文或英文搜索' },
    none: { en: 'No matching term. Try a shorter word.', zh: '没有匹配的词，试试更短的词。' },
    count: { en: 'terms', zh: '个词' },
  },
  notes: {
    title: { en: 'My notes', zh: '我的笔记' },
    lead: {
      en: 'Saved only on this phone. Nothing is uploaded, and nobody else can see it.',
      zh: '只保存在这台手机上。不会上传，别人看不到。',
    },
    example: { en: 'Example note. Edit any field to replace it.', zh: '示例笔记。改任意一项就会替换。' },
    date: { en: 'Visit date', zh: '就诊日期' },
    clinic: { en: 'Clinic', zh: '诊所' },
    said: { en: 'What the doctor said', zh: '医生说了什么' },
    saidPh: { en: 'Write it while you remember. Diagnosis, medicine, how long.', zh: '趁还记得写下来：诊断、药、要多久。' },
    comeBack: { en: 'Come back if…', zh: '什么情况要回去…' },
    comeBackPh: { en: 'e.g. fever lasts more than 3 days', zh: '例如：发烧超过 3 天' },
    steps: { en: 'Next steps from this visit', zh: '这次就诊的下一步' },
    noSteps: { en: 'No steps yet. Choose what you left with on the After screen.', zh: '还没有步骤。去"就诊后"选你带走了什么。' },
    copy: { en: 'Copy as text', zh: '复制为文字' },
    clear: { en: 'Clear notes', zh: '清空笔记' },
    cleared: { en: 'Cleared', zh: '已清空' },
  },
  owners: {
    you: { en: 'You', zh: '你' },
    clinic: { en: 'Clinic', zh: '诊所' },
    pharmacy: { en: 'Pharmacy', zh: '药房' },
    insurer: { en: 'Insurer', zh: '保险公司' },
    uni: { en: 'University', zh: '学校' },
  },
  footer: {
    disclaimer: {
      en: 'Waypoint explains steps and terms. It does not diagnose, replace your doctor’s advice, or guarantee costs or coverage. In an emergency call 000.',
      zh: 'Waypoint 只解释流程和术语，不做诊断、不替代医生的建议、不保证费用或保险范围。紧急情况请拨打 000。',
    },
    sources: { en: 'Sources: Healthdirect, your OSHC provider, your clinic. Content dated', zh: '来源：Healthdirect、你的 OSHC 保险公司、你的诊所。内容日期' },
  },
}

export const sources = {
  healthdirect: { en: 'Healthdirect', zh: 'Healthdirect' },
  oshc: { en: 'Your OSHC provider', zh: '你的 OSHC 保险公司' },
  clinic: { en: 'Your clinic', zh: '你的诊所' },
  uni: { en: 'Your university', zh: '你的学校' },
}

export const services = [
  {
    id: 'pharmacy',
    name: { en: 'Pharmacy', zh: '药房（药剂师）' },
    what: {
      en: 'Advice on minor problems such as colds, coughs, mild pain and skin irritation, plus over-the-counter medicines. No appointment.',
      zh: '感冒、咳嗽、轻微疼痛、皮肤刺激等小问题的建议，以及非处方药。不用预约。',
    },
    cost: { en: 'Advice is free. You pay for medicines.', zh: '咨询免费，药自费。' },
    tip: { en: 'If the pharmacist says "see a GP", book one.', zh: '药剂师说"去看 GP"，就去预约。' },
  },
  {
    id: 'gp',
    name: { en: 'GP clinic', zh: 'GP 诊所（全科医生）' },
    what: {
      en: 'First stop for most health problems. A GP diagnoses, prescribes, orders tests, refers you to specialists and writes medical certificates.',
      zh: '大多数健康问题的第一站。GP 负责诊断、开药、开化验、转诊专科、开病假证明。',
    },
    cost: {
      en: 'The clinic sets the fee. Your OSHC pays a benefit and you pay any gap. Some clinics bill your insurer directly.',
      zh: '诊费由诊所定。OSHC 报销一部分，差额（gap）自付。有些诊所直接向保险公司结算。',
    },
    tip: { en: 'Prefer not to phone? Most clinics take online bookings.', zh: '不想打电话？大多数诊所可以网上预约。' },
  },
  {
    id: 'urgent',
    name: { en: 'Urgent care clinic', zh: '紧急护理诊所（Urgent care）' },
    what: {
      en: 'Same-day care for problems that need attention today but are not life-threatening: cuts that need stitches, sprains, minor burns, suspected simple fractures.',
      zh: '当天要处理、但不危及生命的问题：需要缝合的伤口、扭伤、轻度烧伤、疑似简单骨折。',
    },
    cost: { en: 'Ask about fees for OSHC holders before you go.', zh: '去之前先问清 OSHC 持有者的收费。' },
    tip: { en: 'Walk-in. Bring your OSHC details.', zh: '直接去，带上 OSHC 信息。' },
  },
  {
    id: 'ed',
    name: { en: 'Emergency department', zh: '急诊科（Emergency）' },
    what: {
      en: 'Life-threatening or serious: chest pain, trouble breathing, heavy bleeding, sudden weakness or confusion, severe allergic reaction. Call 000 for an ambulance.',
      zh: '危及生命或严重的情况：胸痛、呼吸困难、大出血、突然无力或意识混乱、严重过敏反应。叫救护车请拨 000。',
    },
    cost: {
      en: 'Hospital and ambulance fees may apply; check your OSHC. You are seen in order of urgency, not arrival.',
      zh: '医院和救护车可能收费，查看你的 OSHC。按病情紧急程度看诊，不是按到达先后。',
    },
    tip: { en: 'A long wait usually means others are more urgent, not that you were forgotten.', zh: '等得久通常是别人更紧急，不是把你忘了。' },
  },
]

export const costFacts = [
  {
    text: {
      en: 'Clinics set their own fees. Your OSHC pays a benefit based on the standard fee, called the MBS fee. If the clinic charges more, the difference is your gap.',
      zh: '诊所自己定价。OSHC 按标准费用（MBS fee）报销。诊所收费高于标准的部分，就是你自付的差额（gap）。',
    },
    source: 'oshc',
  },
  {
    text: {
      en: 'Direct billing: the clinic claims from your insurer on the spot, so you pay only the gap, or nothing. Some clinics call this bulk billing.',
      zh: '直接结算（direct billing）：诊所当场向保险公司结算，你只付差额或不付。有的诊所叫它 bulk billing。',
    },
    source: 'clinic',
  },
  {
    text: {
      en: 'Pay and claim: you pay the full fee, keep the itemised receipt and claim the benefit back in your insurer’s app.',
      zh: '先付后报：你先付全款，保留明细收据，再在保险公司 app 里申请报销。',
    },
    source: 'oshc',
  },
  {
    text: {
      en: 'Medicines are separate. International students usually pay the private price; OSHC refunds part of it up to a limit per item and per year. Keep the receipt.',
      zh: '药费另算。国际学生通常按自费价买药，OSHC 按每种药和每年的上限报销一部分。保留收据。',
    },
    source: 'oshc',
  },
]

export const askClinic = [
  { en: 'Do you direct bill OSHC from my insurer?', zh: '你们和我的 OSHC 保险公司直接结算吗？' },
  { en: 'What is the fee for a standard consultation, and what will my gap be?', zh: '标准问诊多少钱？我自付的差额是多少？' },
  { en: 'Do you take new patients who are international students?', zh: '你们接收国际学生新病人吗？' },
  { en: 'Can I book online?', zh: '可以网上预约吗？' },
]

export const bookingChecklist = [
  { id: 'oshc', en: 'OSHC card or app, with your member number', zh: 'OSHC 卡或 app，带会员号' },
  { id: 'id', en: 'Photo ID: passport or student card', zh: '身份证件：护照或学生卡' },
  { id: 'meds', en: 'Names of any medicines you already take', zh: '正在吃的药的名字' },
  { id: 'prep', en: 'Your symptoms written down. Use the Prep card.', zh: '写好的症状描述。用"准备卡"。' },
  { id: 'cert', en: 'Ask for a medical certificate if uni needs one', zh: '如需大学请假证明，记得让医生开' },
]

export const prep = {
  since: [
    { id: 'today', en: 'since today', zh: '今天', zhSentence: '今天开始' },
    { id: 'days', en: 'for two or three days', zh: '两三天', zhSentence: '两三天前开始' },
    { id: 'week', en: 'for about a week', zh: '大约一周', zhSentence: '大约一周前开始' },
    { id: 'longer', en: 'for more than a week', zh: '一周多', zhSentence: '一周多前开始' },
  ],
  trend: [
    { id: 'better', en: 'getting better', zh: '在好转' },
    { id: 'same', en: 'about the same', zh: '差不多' },
    { id: 'worse', en: 'getting worse', zh: '在加重' },
  ],
  questions: [
    { id: 'howlong', en: 'How long should this take to get better?', zh: '多久能好？' },
    { id: 'tests', en: 'Do I need any tests?', zh: '需要做检查吗？' },
    { id: 'write', en: 'Could you write down the diagnosis and the medicine name?', zh: '能把诊断和药名写下来吗？' },
    { id: 'return', en: 'Do I need to come back, and when?', zh: '要复诊吗？什么时候？' },
    { id: 'cert', en: 'Could I have a medical certificate for university?', zh: '能开一张给学校的病假证明吗？' },
    { id: 'cost', en: 'What will this cost, and do you direct bill my OSHC?', zh: '这次多少钱？能和我的 OSHC 直接结算吗？' },
  ],
  example: {
    symptom: 'sore throat and a cough',
    since: 'days',
    severity: 5,
    trend: 'same',
    tried: 'rest and throat lozenges from the pharmacy',
    questions: ['howlong', 'write', 'cost'],
  },
}

export const artefacts = [
  {
    id: 'prescription',
    label: { en: 'Prescription', zh: '处方' },
    steps: [
      {
        owner: 'you',
        text: { en: 'Take it to any pharmacy. If it came as an eScript, show the QR code from the SMS or email.', zh: '拿到任意药房。如果是电子处方（eScript），出示短信或邮件里的二维码。' },
        source: 'healthdirect',
      },
      {
        owner: 'pharmacy',
        text: { en: 'The pharmacist dispenses the medicine and explains how to take it. Ask about side effects and anything to avoid.', zh: '药剂师配药并说明用法。问清副作用和禁忌。' },
        source: 'healthdirect',
      },
      {
        owner: 'you',
        text: { en: 'Pay the private price and keep the receipt. Your OSHC app shows how to claim the pharmacy benefit.', zh: '按自费价付款，保留收据。OSHC app 里有药费报销的方法。' },
        source: 'oshc',
      },
      {
        owner: 'you',
        text: { en: 'If you are not better by the time the doctor said, go back to the GP.', zh: '到了医生说的时间还没好转，回去复诊。' },
        source: 'clinic',
      },
    ],
  },
  {
    id: 'referral',
    label: { en: 'Referral letter', zh: '转诊信' },
    steps: [
      {
        owner: 'you',
        text: { en: 'You book the specialist. The clinic usually does not do it for you.', zh: '专科预约要你自己打电话或网上约，诊所通常不代约。' },
        source: 'clinic',
      },
      {
        owner: 'you',
        text: { en: 'Find a specialist: ask the GP for names or search by suburb. When booking, ask the fee and the OSHC benefit. Specialist gaps can be large.', zh: '找专科医生：让 GP 推荐，或按区搜索。预约时问诊费和 OSHC 报销额。专科自付差额可能很大。' },
        source: 'oshc',
      },
      {
        owner: 'you',
        text: { en: 'Bring the letter to the appointment. Check the validity period written on it, often 12 months.', zh: '就诊时带上转诊信。看清信上写的有效期，通常是 12 个月。' },
        source: 'clinic',
      },
      {
        owner: 'clinic',
        text: { en: 'The specialist reports back to your GP afterwards. Ask whether you need a follow-up GP visit.', zh: '专科医生看完后会把报告发给 GP。问清是否需要回 GP 复诊。' },
        source: 'clinic',
      },
    ],
  },
  {
    id: 'pathology',
    label: { en: 'Pathology form', zh: '化验单' },
    steps: [
      {
        owner: 'you',
        text: { en: 'Take the form to a pathology collection centre, not back to the GP clinic. Search the lab name printed on the form.', zh: '拿化验单去采样点（collection centre），不是回 GP 诊所。按单上印的化验机构名搜索。' },
        source: 'healthdirect',
      },
      {
        owner: 'you',
        text: { en: 'Check the form for "fasting". If it says so, do not eat or drink anything except water for the hours stated.', zh: '看单上有没有"fasting"（空腹）。有就按规定小时数不吃不喝，水除外。' },
        source: 'healthdirect',
      },
      {
        owner: 'clinic',
        text: { en: 'Results go to your GP, not to you. Ask the clinic how you will hear: a call, an app, or a follow-up appointment.', zh: '结果发给 GP，不直接给你。问诊所你怎么得到结果：电话、app 还是复诊。' },
        source: 'clinic',
      },
      {
        owner: 'you',
        text: { en: 'Pathology is usually billed separately from the GP visit. Ask the collection centre whether they bill your OSHC directly.', zh: '化验费通常和诊费分开算。问采样点是否和 OSHC 直接结算。' },
        source: 'oshc',
      },
    ],
  },
  {
    id: 'receipt',
    label: { en: 'Receipt', zh: '收据' },
    steps: [
      {
        owner: 'you',
        text: { en: 'Check it is itemised: item numbers, date, provider name and the amount you paid.', zh: '确认是明细收据：项目号、日期、医生姓名、你付的金额。' },
        source: 'oshc',
      },
      {
        owner: 'you',
        text: { en: 'Open your insurer’s app, photograph the receipt and submit the claim. Keep the original until the money arrives.', zh: '打开保险公司 app，拍照上传，提交报销。钱到账前保留原件。' },
        source: 'oshc',
      },
      {
        owner: 'insurer',
        text: { en: 'The benefit is paid to your nominated bank account. Timing varies by insurer.', zh: '报销打到你指定的银行账户，到账时间各家不同。' },
        source: 'oshc',
      },
    ],
  },
  {
    id: 'certificate',
    label: { en: 'Medical certificate', zh: '病假证明' },
    steps: [
      {
        owner: 'you',
        text: { en: 'Check the dates cover the days you need.', zh: '确认日期覆盖你需要的天数。' },
        source: 'clinic',
      },
      {
        owner: 'uni',
        text: { en: 'Submit it through your university’s extension or absence process before the deadline.', zh: '在截止日期前，通过学校的延期或缺勤流程提交。' },
        source: 'uni',
      },
    ],
  },
  {
    id: 'advice',
    label: { en: 'Advice only', zh: '只有口头建议' },
    steps: [
      {
        owner: 'you',
        text: { en: 'Write down what the doctor said while you remember it. Save it in My notes.', zh: '趁还记得，把医生说的写下来，存到"我的笔记"。' },
        source: 'clinic',
      },
      {
        owner: 'you',
        text: { en: 'Note the "come back if" conditions: what should improve by when, and what means going back sooner.', zh: '记下"什么情况要回来"：多久应该好转，什么情况要提前回去。' },
        source: 'clinic',
      },
      {
        owner: 'you',
        text: { en: 'Not improving or getting worse? Call Healthdirect on 1800 022 222, or 000 in an emergency.', zh: '没好转或加重？打 Healthdirect 1800 022 222，紧急情况拨 000。' },
        source: 'healthdirect',
      },
    ],
  },
]

export const glossary = [
  { en: 'GP', zh: '全科医生', defEn: 'General practitioner. Your first-contact doctor for most problems; can prescribe, refer you and order tests.', defZh: 'General practitioner，大多数问题的第一位医生，可以开药、转诊、开化验。' },
  { en: 'OSHC', zh: '海外学生健康保险', defEn: 'Overseas Student Health Cover. The insurance international students must hold for their visa. It pays part of doctor, hospital and medicine costs; limits and exclusions apply.', defZh: 'Overseas Student Health Cover，国际学生签证要求的健康保险。报销部分医生、医院和药费，有上限和除外项目。' },
  { en: 'Bulk billing', zh: '全额直接结算', defEn: 'The clinic bills the insurer directly and you pay nothing for the consultation. For OSHC holders, clinics may say "direct billing" instead.', defZh: '诊所直接向保险方结算，问诊你不用付钱。对 OSHC 持有者，诊所可能说"direct billing"。' },
  { en: 'Direct billing', zh: '直接结算', defEn: 'The clinic claims your OSHC benefit on the spot; you pay only the gap, if there is one.', defZh: '诊所当场向你的 OSHC 申请报销，你只付差额（如果有）。' },
  { en: 'Gap / gap fee', zh: '自付差额', defEn: 'The part of the fee that your insurance does not cover.', defZh: '保险不报的那部分费用。' },
  { en: 'Out-of-pocket', zh: '自费部分', defEn: 'What you end up paying yourself after any benefit.', defZh: '报销之后你自己最终付的钱。' },
  { en: 'Benefit / rebate', zh: '报销金额', defEn: 'The amount your insurer pays back for a service.', defZh: '保险公司为某项服务报给你的钱。' },
  { en: 'Claim', zh: '报销申请', defEn: 'Asking your insurer to pay the benefit, usually by uploading a receipt in the app.', defZh: '向保险公司申请报销，通常是在 app 里上传收据。' },
  { en: 'Item number', zh: '项目号', defEn: 'The code on a receipt that identifies the service. Insurers use it to work out your benefit.', defZh: '收据上标识服务的编号，保险公司用它计算报销额。' },
  { en: 'MBS fee', zh: '标准费用', defEn: 'The government’s standard fee for a service, from the Medicare Benefits Schedule. OSHC benefits are based on it.', defZh: '政府为某项服务定的标准费用（Medicare Benefits Schedule）。OSHC 按它计算报销。' },
  { en: 'Referral', zh: '转诊信', defEn: 'A letter from your GP that lets you see a specialist. You usually book the specialist yourself.', defZh: 'GP 写的信，让你能去看专科。专科通常要你自己预约。' },
  { en: 'Specialist', zh: '专科医生', defEn: 'A doctor in one field, such as a dermatologist for skin. Usually needs a referral.', defZh: '某一领域的医生，比如皮肤科（dermatologist）。通常需要转诊信。' },
  { en: 'Pathology', zh: '化验', defEn: 'Blood, urine or other laboratory tests. You go to a collection centre; results go to your GP.', defZh: '血液、尿液等实验室检查。你去采样点，结果发给 GP。' },
  { en: 'Collection centre', zh: '采样点', defEn: 'Where pathology samples are taken. Not the same place as the GP clinic.', defZh: '抽血、采样的地方，不是 GP 诊所。' },
  { en: 'Fasting', zh: '空腹', defEn: 'No food or drink except water before a test, for the hours stated on the form.', defZh: '检查前按单上写的小时数不吃不喝，水除外。' },
  { en: 'Prescription / script', zh: '处方', defEn: 'A doctor’s order for a medicine, on paper or as an eScript.', defZh: '医生开的药单，纸质或电子（eScript）。' },
  { en: 'eScript', zh: '电子处方', defEn: 'An electronic prescription sent by SMS or email as a QR code. Show it at the pharmacy.', defZh: '通过短信或邮件发来的二维码处方，在药房出示。' },
  { en: 'Over-the-counter', zh: '非处方药', defEn: 'Medicines you can buy without a prescription.', defZh: '不需要处方就能买的药。' },
  { en: 'Pharmacist / chemist', zh: '药剂师 / 药房', defEn: 'Dispenses medicines and gives advice on minor problems. "Chemist" also means the pharmacy shop.', defZh: '配药并给小问题提建议的人。"Chemist" 也指药房这个店。' },
  { en: 'Urgent care', zh: '紧急护理', defEn: 'Same-day care for injuries and illnesses that are not life-threatening.', defZh: '当天处理、但不危及生命的伤病。' },
  { en: 'Emergency department', zh: '急诊科', defEn: 'The hospital department for serious or life-threatening conditions. Often called ED or emergency.', defZh: '医院里处理严重或危及生命情况的科室，常叫 ED 或 emergency。' },
  { en: 'Triage', zh: '分诊', defEn: 'Sorting patients by urgency. The most serious are seen first, not the first to arrive.', defZh: '按紧急程度排序。最严重的先看，不是先到先看。' },
  { en: 'Medical certificate', zh: '病假证明', defEn: 'A doctor’s note confirming you were unwell, used for university extensions or work.', defZh: '医生开的证明你生病的文件，用于学校延期或请假。' },
  { en: 'Follow-up', zh: '复诊', defEn: 'A second appointment to check progress or results.', defZh: '再去一次，看进展或看结果。' },
  { en: 'Telehealth', zh: '远程问诊', defEn: 'A consultation by phone or video.', defZh: '通过电话或视频问诊。' },
  { en: 'Healthdirect', zh: 'Healthdirect（政府健康热线）', defEn: 'Australian government health advice: an online symptom checker and a 24-hour nurse line, 1800 022 222.', defZh: '澳大利亚政府的健康建议服务：在线症状自查和 24 小时护士热线 1800 022 222。' },
]

export const exampleNote = {
  example: true,
  date: '2026-09-02',
  clinic: 'Example clinic, St Lucia',
  said: 'Viral infection. Rest, fluids, paracetamol if needed. Should settle within a week.',
  comeBack: 'Fever lasts more than 3 days, or breathing gets harder.',
}
