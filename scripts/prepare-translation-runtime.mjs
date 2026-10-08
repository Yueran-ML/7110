import { mkdir, readdir, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const source = resolve('node_modules/onnxruntime-web/dist')
const destination = resolve('public/runtime/onnx')
await mkdir(destination, { recursive: true })
const files = (await readdir(source)).filter((name) =>
  name.startsWith('ort-wasm-') && (name.endsWith('.wasm') || name.endsWith('.mjs')),
)
if (!files.length) throw new Error('ONNX Runtime Web files are missing; run npm ci first.')
await Promise.all(files.map((name) => copyFile(resolve(source, name), resolve(destination, name))))
await copyFile(resolve('node_modules/onnxruntime-web/README.md'), resolve(destination, 'ONNX-RUNTIME-NOTICE.md'))
await copyFile(resolve('node_modules/@huggingface/transformers/LICENSE'), resolve(destination, 'TRANSFORMERS-LICENSE.txt'))
console.log(`Prepared ${files.length} local ONNX runtime files.`)
