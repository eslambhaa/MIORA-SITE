// Relaxation exercises. Durations are real: each step runs for its seconds,
// and the whole exercise ends when the last step finishes.
// Texts are educational and need specialist review before public launch.

export const breathPhases = [
  { text: 'شهيق هادئ من الأنف…', seconds: 4 },
  { text: 'زفير طويل وبطيء…', seconds: 6 },
]

const breathCycle = breathPhases.reduce((sum, phase) => sum + phase.seconds, 0)

export const exercises = [
  {
    id: 'breathing',
    title: 'تنفّس بهدوء',
    duration: 'دقيقتان',
    description: 'اتبع إيقاعًا هادئًا للشهيق والزفير دون إجبار نفسك.',
    icon: '/icons/relaxation/breath.svg',
    kind: 'breath',
    totalSeconds: breathCycle * 12,
  },
  {
    id: 'grounding',
    title: 'تمرين التأريض',
    badge: '5-4-3-2-1',
    duration: '٥ دقائق',
    description: 'استخدم حواسك الخمس لتعود بلطف إلى المكان واللحظة الحالية.',
    icon: '/icons/relaxation/leaf.svg',
    kind: 'steps',
    steps: [
      { text: 'لاحظ خمسة أشياء تراها حولك، وسمِّها في سرّك.', seconds: 60 },
      { text: 'لاحظ أربعة أشياء تلمسها: ملمس ملابسك، الكرسي، الأرض تحت قدميك.', seconds: 60 },
      { text: 'أنصت لثلاثة أصوات قريبة أو بعيدة دون أن تحكم عليها.', seconds: 60 },
      { text: 'لاحظ رائحتين من حولك، أو تذكّر رائحتين تحبهما.', seconds: 60 },
      { text: 'لاحظ طعمًا واحدًا في فمك، ثم خذ نفسًا هادئًا.', seconds: 60 },
    ],
  },
  {
    id: 'mindful',
    title: 'لحظة يقظة قصيرة',
    duration: '٣ دقائق',
    description: 'توقّف لدقائق ولاحظ ما يحدث بداخلك وحولك دون أن تحاول تغييره.',
    icon: '/icons/relaxation/sparkles.svg',
    kind: 'steps',
    steps: [
      { text: 'اجلس بوضع مريح، واترك كتفيك ينخفضان قليلًا.', seconds: 30 },
      { text: 'لاحظ أنفاسك كما هي، دون أن تغيّر إيقاعها.', seconds: 30 },
      { text: 'لاحظ أي فكرة تمر، وسمِّها «فكرة» ثم عُد إلى أنفاسك.', seconds: 30 },
      { text: 'لاحظ الشعور الموجود الآن، وامنحه اسمًا بسيطًا.', seconds: 30 },
      { text: 'وسّع انتباهك إلى الأصوات والمكان من حولك.', seconds: 30 },
      { text: 'اسأل نفسك بلطف: ما الذي أحتاجه في الساعة القادمة؟', seconds: 30 },
    ],
  },
  {
    id: 'body',
    title: 'استرخاء لطيف للجسم',
    duration: '٧ دقائق',
    description: 'مرّ بانتباهك على جسمك جزءًا جزءًا، وارخِ ما تستطيع دون ضغط.',
    icon: '/icons/relaxation/heart.svg',
    kind: 'steps',
    steps: [
      { text: 'ابدأ بقدميك: لاحظ ثقلهما على الأرض، وارخِ أصابعهما.', seconds: 60 },
      { text: 'انتقل إلى ساقيك وركبتيك، واتركهما تسترخيان.', seconds: 60 },
      { text: 'لاحظ بطنك وهو يرتفع وينخفض مع أنفاسك.', seconds: 60 },
      { text: 'ارخِ يديك، وافتح أصابعك برفق.', seconds: 60 },
      { text: 'دع كتفيك ينخفضان بعيدًا عن أذنيك.', seconds: 60 },
      { text: 'ارخِ فكّك وجبينك والمنطقة حول عينيك.', seconds: 60 },
      { text: 'لاحظ جسمك كله الآن، وخذ نفسًا هادئًا قبل أن تعود.', seconds: 60 },
    ],
  },
]

for (const exercise of exercises) {
  if (exercise.kind === 'steps') exercise.totalSeconds = exercise.steps.reduce((sum, step) => sum + step.seconds, 0)
}

export const exerciseIds = exercises.map((exercise) => exercise.id)

export function breathPhase(elapsedSeconds) {
  let t = elapsedSeconds % breathCycle
  for (const phase of breathPhases) {
    if (t < phase.seconds) return phase
    t -= phase.seconds
  }
  return breathPhases[0]
}
