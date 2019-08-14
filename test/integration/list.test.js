const test = require('ava')

const S3Manager = require('../../lib')
const getFileMd5 = require('../../lib/md5')

const hasKey = (key, array) =>
  !!array.find(obj => obj.Key === key)

const filePath = 'fixtures/binaries/sample.jpeg'
const bucket = 'ss-wcms-iapi-primary-bucket-preview-test-automation'
const s3 = new S3Manager(bucket)

const prefix = 'test-001'
const keys = [`${prefix}-1`, `${prefix}-2`]
const key3 = `${prefix}-3`
const key3Md5 = getFileMd5(filePath)

test.before('Create two s3 objects', async t => {
  const uploadProms = keys.map(key => s3.upload(key, filePath))
  const upload = await Promise.all(uploadProms)
  t.is(upload.length, 2)

})
test.before('Create s3 objects with metadata and tags', async t => {
  const optionalData = {
    ContentType: 'media/jpeg',
    Tagging: 'state=published',
  }

  const data = await s3.upload(key3, filePath, {
    optionalParams: Object.assign(optionalData, { Metadata: { md5: key3Md5 } })
  })
  t.is(data.Location, `https://${bucket}.s3.amazonaws.com/${key3}`)
})

test.after('Destroy the three s3 objects', async t => {
  const data = await s3.deleteByPrefix(prefix)
  t.is(data.Deleted.length, 3)
})

test('Lists details for a s3 object', async t => {
  const data = await s3.getKey(key3)
  t.is(data.Metadata.md5, key3Md5)
  t.deepEqual(data.TagSet[0], { Key: 'state', Value: 'published' })
})

test('Lists the s3 objects', async t => {

  const data = await s3.list(prefix)
  t.true(hasKey(keys[0], data.Contents))
  t.true(hasKey(keys[1], data.Contents))
  t.is(data.Name, bucket)
  t.is(data.Prefix, prefix)
})
