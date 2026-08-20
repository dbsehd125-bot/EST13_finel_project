require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const oldSb = createClient(process.env.OLD_PROJECT_URL, process.env.OLD_SERVICE_ROLE_KEY)
const newSb = createClient(process.env.NEW_PROJECT_URL, process.env.NEW_SERVICE_ROLE_KEY)

async function listAllFiles(bucket, prefix = '') {
  const { data, error } = await oldSb.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error) throw error

  let files = []
  for (const item of data || []) {
    const path = `${prefix}${item.name}`
    if (item.metadata) {
      files.push({ path, metadata: item.metadata })
    } else {
      files = files.concat(await listAllFiles(bucket, `${path}/`))
    }
  }
  return files
}

async function ensureBucket(bucket) {
  const { data: existing } = await newSb.storage.getBucket(bucket.name)
  if (!existing) {
    const { error } = await newSb.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit || undefined,
      allowedMimeTypes: bucket.allowed_mime_types || undefined,
    })
    if (error) throw error
  }
}

async function migrate() {
  const { data: buckets, error } = await oldSb.storage.listBuckets()
  if (error) throw error

  const failed = []

  for (const bucket of buckets) {
    await ensureBucket(bucket)
    const files = await listAllFiles(bucket.name)

    for (const file of files) {
      try {
        const { data: blob, error: dErr } = await oldSb.storage.from(bucket.name).download(file.path)
        if (dErr) throw dErr

        const { error: uErr } = await newSb.storage.from(bucket.name).upload(file.path, blob, {
          upsert: true,
          contentType: file.metadata?.mimetype,
          cacheControl: file.metadata?.cacheControl,
        })
        if (uErr) throw uErr

        console.log(`OK: ${bucket.name}/${file.path}`)
      } catch (e) {
        console.error(`FAIL: ${bucket.name}/${file.path} -> ${e.message}`)
        failed.push({ bucket: bucket.name, path: file.path, error: e.message })
      }
    }
  }

  console.log(`Done. failed=${failed.length}`)
  if (failed.length) {
    require('fs').writeFileSync('failed.json', JSON.stringify(failed, null, 2))
  }
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
