import test from 'node:test'
import assert from 'node:assert/strict'
import { applyTranslations, englishCard, englishFor, untranslatedFields } from '../src/translation.js'

test('editing Chinese notes immediately invalidates an old English translation', () => {
  const previous = { symptom: '喉咙痛', tried: '', translations: {
    symptom: { source: '喉咙痛', text: 'I have a sore throat.' },
  } }
  assert.equal(englishFor(previous, 'symptom'), 'I have a sore throat.')
  const changed = { ...previous, symptom: '我没有发烧' }
  assert.deepEqual(untranslatedFields(changed), ['symptom'])
  const card = englishCard(changed, { en: 'since today' }, { en: 'about the same' }, [])
  assert.match(card, /Translation needed/)
  assert.doesNotMatch(card, /sore throat|喉咙痛|我没有发烧/)
})

test('a late background result cannot replace a translation for newly edited notes', () => {
  const current = { symptom: '我没有发烧', tried: '', translations: {
    symptom: { source: '我没有发烧', text: 'I have no fever.' },
  } }
  const result = applyTranslations(current, { symptom: '喉咙痛' }, { symptom: 'I have a sore throat.' })
  assert.equal(englishFor(result, 'symptom'), 'I have no fever.')
})

test('English input works without a model and translated sentences are not wrapped in another subject', () => {
  const direct = { symptom: 'sore throat', tried: 'rest', severity: 3 }
  assert.deepEqual(untranslatedFields(direct), [])
  const translated = applyTranslations({ symptom: '我喉咙痛', tried: '', severity: 3 },
    { symptom: '我喉咙痛' }, { symptom: 'I have a sore throat.' })
  const card = englishCard(translated, { en: 'for two or three days' }, { en: 'getting better' }, [])
  assert.match(card, /Symptoms: I have a sore throat\. Duration: two or three days\./)
  assert.doesNotMatch(card, /I've had I have|\.\./)
})

test('a Chinese value typed in the English draft still requires completion', () => {
  const form = { symptom: '喉咙痛', tried: '', translations: {
    symptom: { source: '喉咙痛', text: '喉咙痛' },
  } }
  assert.deepEqual(untranslatedFields(form), ['symptom'])
})
