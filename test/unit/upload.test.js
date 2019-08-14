const test = require('ava')
const uuid = require('uuid')
const sinon = require('sinon')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')
const pick = require('lodash/fp/pick')

const S3Manager = require('../../lib')
const getFileMd5 = require('../../lib/md5')

const bucket = 'fakeBucket'
const filePath = 'fixtures/binaries/sample.jpeg'

const pickData = pick(['ContentLength','ContentType','Tagging',])

const getParams = () => {
  const key = `000-test-${uuid()}`
  return {
    key,
    s3Response: {
      Key: key,
      Location: `https://fakeBucket.s3.amazonaws.com/${key}`,
      Bucket: bucket,
    }
  }
}

test.afterEach(() => {
  sinon.restore()
  AWSMock.restore('S3')
})

test.serial('Upload success without optionalParams', async t => {

  const {key, s3Response} = getParams()
  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('S3', 'upload', s3Response)

  const s3mgr = new S3Manager(bucket)
  const data = await s3mgr.upload(key, filePath)
  t.deepEqual(data, s3Response)

  t.true(AWS.S3.calledOnce)

  const args = s3mgr.s3.upload.getCall(0).args[0]
  t.is(args.Key, key)
  t.is(args.Bucket, bucket)
})

test.serial('Upload success with optionalParams', async t => {

  const {key, s3Response} = getParams()
  const md5 = getFileMd5(filePath)

  const optionalData = {
    ContentLength: 345,
    ContentType: 'media/jpeg',
    Tagging: 'state=published',
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('S3', 'upload', s3Response)

  const s3mgr = new S3Manager(bucket)
  const data = await s3mgr.upload(key, filePath, {
    optionalParams: Object.assign({}, optionalData, { Metadata: {md5} })
  })
  t.deepEqual(data, s3Response)

  t.true(AWS.S3.calledOnce)

  const args = s3mgr.s3.upload.getCall(0).args[0]
  t.is(args.Key, key)
  t.is(args.Bucket, bucket)
  t.is(args.Metadata.md5, md5)

  t.deepEqual(pickData(args), optionalData)
})
