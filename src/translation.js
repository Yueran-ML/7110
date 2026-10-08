export const containsChinese = (text = '') => /\p{Script=Han}/u.test(text)
export const translationFields = ['symptom', 'tried']

export function englishFor(form, field) {
  const original = (form[field] ?? '').trim()
  if (!containsChinese(original)) return original
  const draft = form.translations?.[field]
  // Changing a source invalidates its old translation immediately.
  if (draft?.source !== form[field] || containsChinese(draft.text ?? '')) return ''
  return (draft.text ?? '').trim()
}

export function untranslatedFields(form) {
  return translationFields.filter((field) => containsChinese(form[field]) && !englishFor(form, field))
}

export function applyTranslations(form, originals, translated) {
  const translations = { ...form.translations }
  for (const field of translationFields) {
    // An older background job must never overwrite newly edited input.
    if (originals[field] === form[field] && typeof translated[field] === 'string') {
      translations[field] = { source: originals[field], text: translated[field] }
    }
  }
  return { ...form, translations }
}

const sentence = (text) => /[.!?。！？]$/.test(text) ? text : `${text}.`

export function englishCard(form, since, trend, questions) {
  const symptom = englishFor(form, 'symptom')
  const tried = englishFor(form, 'tried')
  return [
    sentence(`Symptoms: ${symptom || (containsChinese(form.symptom) ? 'Translation needed' : '…')}`),
    sentence(`Duration: ${since.en.replace(/^(since|for)\s+/i, '')}`),
    sentence(`Severity: ${form.severity}/10; ${trend.en}`),
    tried ? sentence(`Tried: ${tried}`) : containsChinese(form.tried) ? 'Tried: Translation needed.' : '',
    questions.length ? `Questions: ${questions.map((question) => question.en).join(' ')}` : '',
  ].filter(Boolean).join(' ')
}
