const S3Manager = require('./index')

const bucket = 'ss-wcms-iapi-primary-bucket-preview-test-automation'
const prefix = 'test-00'

const cleanup = async () => {
  const s3mgr = new S3Manager(bucket)
  const data = await s3mgr.deleteByPrefix(prefix)
  console.log(data)
}

cleanup()
