import { env, pipeline } from '@huggingface/transformers'

const MODEL_ID = 'waypoint-zh-en-v1'
let translatorPromise = null
let disposeRequested = false

async function loadTranslator(modelRoot, runtimeRoot, id) {
  if (translatorPromise) return translatorPromise
  env.allowRemoteModels = false
  env.allowLocalModels = true
  env.localModelPath = modelRoot
  env.useFS = false
  env.useFSCache = false
  env.useBrowserCache = true
  env.backends.onnx.wasm.wasmPaths = runtimeRoot
  // GitHub Pages does not provide cross-origin isolation headers.
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.wasm.proxy = false
  const progress = new Map()
  translatorPromise = pipeline('translation', MODEL_ID, {
    dtype: 'q8', device: 'wasm',
    progress_callback(info) {
      if (info.status === 'progress') progress.set(info.file, { loaded: info.loaded, total: info.total })
      const loaded = [...progress.values()].reduce((sum, file) => sum + (file.loaded ?? 0), 0)
      self.postMessage({ type: 'progress', id, phase: 'loading', loaded })
    },
  }).catch((error) => {
    translatorPromise = null
    throw error
  })
  return translatorPromise
}

self.addEventListener('message', async ({ data }) => {
  if (data.type === 'dispose') {
    disposeRequested = true
    try {
      const translator = await translatorPromise
      await translator?.dispose()
    } finally {
      self.close()
    }
    return
  }
  if (data.type !== 'translate') return
  const { id, fields, modelRoot, runtimeRoot } = data
  try {
    const translator = await loadTranslator(modelRoot, runtimeRoot, id)
    if (disposeRequested) return
    self.postMessage({ type: 'progress', id, phase: 'translating' })
    const translated = {}
    for (const [field, text] of Object.entries(fields)) {
      const tokens = translator.tokenizer(text)
      if (tokens.input_ids.dims[1] > 128) {
        self.postMessage({ type: 'error', id, code: 'tooLong' })
        return
      }
      const output = await translator(text, { max_new_tokens: 96, num_beams: 2, do_sample: false })
      const result = output[0]?.translation_text?.trim()
      if (!result) throw new Error('The model returned an empty translation')
      translated[field] = result
    }
    if (!disposeRequested) self.postMessage({ type: 'result', id, translated })
  } catch (error) {
    // Do not send user text or runtime internals into the product UI.
    if (!disposeRequested) self.postMessage({ type: 'error', id, code: 'failed' })
  }
})
