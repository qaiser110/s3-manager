const test = require('ava')

const S3Manager = require('../../lib')

const filePath = 'fixtures/binaries/sample.jpeg'
const bucket = 'ss-wcms-iapi-primary-bucket-preview-test-automation'
const s3 = new S3Manager(bucket)

const prefix = 'test-003'
const keys = [`${prefix}-1`, `${prefix}-2-1`, `${prefix}-2-2`]

test.before('Create s3 objects', async t => {
  const uploadProms = keys.map(key => s3.upload(key, filePath))
  const upload = await Promise.all(uploadProms)
  t.is(upload.length, 3)
})

test.after('Destroy the three s3 objects', async t => {
  const data = await s3.list(prefix)
  t.is(data.Contents.length, 0)
})

test('Delete the binary', async t => {
  const key = keys[0]
  const upload = await s3.upload(key, filePath)
  t.is(upload.Key, key)

  const data = await s3.delete([key], filePath)
  t.is(data.Deleted[0].Key, key)
})

test('Delete multiple binaries by prefix', async t => {

  const k = [keys[1], keys[2]]
  const uploadProms = k.map(key => s3.upload(key, filePath))
  const upload = await Promise.all(uploadProms)
  t.is(upload.length, 2)

  const data = await s3.deleteByPrefix(`${prefix}-2`)

  t.is(data.Deleted.length, 2)
  t.true(data.Deleted[0].Key.includes(`${prefix}-2`))
})

test('rejects with a non-existing bucket', async t => {
  const s3 = new S3Manager('invalid-bucket')
  const res = s3.upload('000111', filePath)
  const error = await t.throwsAsync(res, Error)

  t.is(error.message, 'The specified bucket does not exist')
})
