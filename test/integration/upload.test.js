const test = require('ava')

const S3Manager = require('../../lib')
const getFileMd5 = require('../../lib/md5')

const filePath = 'fixtures/binaries/sample.jpeg'
const bucket = 'ss-wcms-iapi-primary-bucket-preview-test-automation'
const s3 = new S3Manager(bucket)
const prefix = 'test-002'

test.after('Destroy the three s3 objects', async t => {
  const data = await s3.deleteByPrefix(prefix)
  t.is(data.Deleted.length, 1)
})


test('Uploads the binary', async t => {
  const key = `${prefix}-2`
  const md5 = getFileMd5(filePath)

  const optionalData = {
    // ContentLength: 345,
    ContentType: 'media/jpeg',
    Tagging: 'state=published',
  }

  const data = await s3.upload(key, filePath, {
    optionalParams: Object.assign(optionalData, { Metadata: {md5} })
  })

  t.log(data)
  t.is(data.Location, `https://${bucket}.s3.amazonaws.com/${key}`)
  t.is(data.Key, key)
  t.is(data.Bucket, bucket)
})

test('throws and error when Bucket is not set', async t => {
  const error = t.throws(() => {
    // eslint-disable-next-line no-new
    new S3Manager()
  }, Error)

  t.is(error.message, 'Bucket name is required')
})

test('rejects with a non-existing bucket', async t => {
  const s3 = new S3Manager('invalid-bucket')
  const res = s3.upload('000111', 'fixtures/binaries/sample.jpeg')
  const error = await t.throwsAsync(res, Error)

  t.is(error.message, 'The specified bucket does not exist')
})
