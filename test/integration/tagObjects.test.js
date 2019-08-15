const test = require('ava')

const S3Manager = require('../../lib')

const filePath = 'fixtures/binaries/sample.jpeg'
const bucket = 'ss-wcms-iapi-primary-bucket-preview-test-automation'
const s3 = new S3Manager(bucket)

const prefix = 'test-004'
const keys = [`${prefix}-1`, `${prefix}-2`]

test.before('Create text fixtures for tagObjects() test', async t => {
  const optionalParams = {
    ContentType: 'media/jpeg',
    Tagging: 'state=published&draft=false',
  }
  const uploadProms = [
    s3.upload(keys[0], filePath),
    s3.upload(keys[1], filePath, { optionalParams }),
  ]
  const upload = await Promise.all(uploadProms)
  t.is(upload.length, 2)

  const key1 = await s3.getKey(keys[1])
  t.is(key1.TagSet.length, 2)
})

test.after('Destroy the three s3 objects', async t => {
  const data = await s3.deleteByPrefix(prefix)
  t.is(data.Deleted.length, 2)
})

test('Lists details for a s3 object', async t => {
  await s3.tagObjects(keys, 'state', 'unpublished')

  let expectedTag = {
    Key: 'state',
    Value: 'unpublished',
  }

  const key0 = await s3.getKey(keys[0])
  t.is(key0.TagSet.length, 1)
  t.deepEqual(key0.TagSet[0], expectedTag)

  const key1 = await s3.getKey(keys[1])
  t.is(key1.TagSet.length, 1)
  t.deepEqual(key1.TagSet[0], expectedTag)
})
