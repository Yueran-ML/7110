import test from 'node:test'
import assert from 'node:assert/strict'
import { artefacts, pathologyQuickActions, sources } from '../src/content.js'

test('the pathology pathway includes one reviewed official Healthdirect hand-off', () => {
  const pathology = artefacts.find((artefact) => artefact.id === 'pathology')
  assert.ok(pathology, 'Pathology artefact should exist')

  const linkedSources = pathology.steps
    .map((step) => sources[step.source])
    .filter((source) => source?.url)

  assert.equal(linkedSources.length, 1)

  const source = linkedSources[0]
  const url = new URL(source.url)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'www.healthdirect.gov.au')
  assert.match(url.pathname, /understanding-pathology-tests/)
  assert.ok(source.linkLabel.en)
  assert.ok(source.linkLabel.zh)
  assert.match(source.reviewed, /^\d{4}-\d{2}-\d{2}$/)
})

test('every prototype step still references a known source', () => {
  for (const artefact of artefacts) {
    for (const step of artefact.steps) {
      assert.ok(sources[step.source], `${artefact.id} references unknown source ${step.source}`)
    }
  }
})

test('pathology quick actions provide an official finder and bilingual questions', () => {
  const finder = new URL(pathologyQuickActions.finderUrl)
  assert.equal(finder.protocol, 'https:')
  assert.equal(finder.hostname, 'www.healthdirect.gov.au')
  assert.match(finder.pathname, /australian-health-services/)

  assert.ok(pathologyQuickActions.finderLabel.en)
  assert.ok(pathologyQuickActions.finderLabel.zh)
  assert.ok(pathologyQuickActions.copyLabel.en)
  assert.ok(pathologyQuickActions.copyLabel.zh)
  assert.equal(pathologyQuickActions.questions.length, 4)

  for (const question of pathologyQuickActions.questions) {
    assert.ok(question.en)
    assert.ok(question.zh)
  }
})
