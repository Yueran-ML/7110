import { useEffect, useRef, useState } from 'react'

export default function useLocalTranslation() {
  const workerRef = useRef(null)
  const jobRef = useRef(null)
  const idRef = useRef(0)
  const mounted = useRef(false)
  const [status, setStatus] = useState({ phase: 'idle', loaded: 0, error: null })

  const release = () => {
    const worker = workerRef.current
    workerRef.current = null
    if (worker) {
      worker.postMessage({ type: 'dispose' })
      // Termination also releases resources if a load or inference is still busy.
      window.setTimeout(() => worker.terminate(), 500)
    }
    if (jobRef.current) {
      jobRef.current.reject(new DOMException('Translation cancelled', 'AbortError'))
      jobRef.current = null
    }
  }

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; release() }
  }, [])

  const translate = (fields) => {
    if (jobRef.current) return Promise.reject(new Error('Translation already running'))
    const id = ++idRef.current
    setStatus({ phase: 'loading', loaded: 0, error: null })
    return new Promise((resolve, reject) => {
      jobRef.current = { id, resolve, reject }
      try {
        if (!workerRef.current) {
          const worker = new Worker(new URL('./translation.worker.js', import.meta.url), { type: 'module' })
          workerRef.current = worker
          worker.onmessage = ({ data }) => {
            const job = jobRef.current
            if (workerRef.current !== worker || !mounted.current || !job || job.id !== data.id) return
            if (data.type === 'progress') {
              setStatus((previous) => ({ ...previous, phase: data.phase, loaded: data.loaded ?? previous.loaded }))
            } else if (data.type === 'result') {
              jobRef.current = null
              setStatus({ phase: 'idle', loaded: 0, error: null })
              job.resolve(data.translated)
            } else if (data.type === 'error') {
              jobRef.current = null
              setStatus({ phase: 'idle', loaded: 0, error: data.code })
              job.reject(new Error(data.code))
            }
          }
          worker.onerror = () => {
            if (workerRef.current !== worker) return
            const job = jobRef.current
            jobRef.current = null
            worker.terminate()
            workerRef.current = null
            if (mounted.current) setStatus({ phase: 'idle', loaded: 0, error: 'failed' })
            job?.reject(new Error('failed'))
          }
        }
        const base = new URL(import.meta.env.BASE_URL, document.baseURI)
        workerRef.current.postMessage({ type: 'translate', id, fields,
          modelRoot: new URL('models/', base).href,
          runtimeRoot: new URL('runtime/onnx/', base).href,
        })
      } catch (error) {
        jobRef.current = null
        if (mounted.current) setStatus({ phase: 'idle', loaded: 0, error: 'failed' })
        reject(error)
      }
    })
  }

  const cancel = () => {
    release()
    if (mounted.current) setStatus({ phase: 'idle', loaded: 0, error: null })
  }
  return { translate, cancel, status, busy: status.phase !== 'idle' }
}
