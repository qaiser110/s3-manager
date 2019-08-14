const AWS = require('aws-sdk')
const fs = require('fs')

class S3Manager {
  constructor(bucket = process.env.s3Bucket) {
    if (!bucket) throw new Error('Bucket name is required')
    this.bkt = bucket
    this.bkts = [bucket]
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01' })
  }

  set bucket(bucketName) {
    this.bkt = bucketName
    this.bkts = [bucketName]
  }
  set addBucket(bucketName) {
    this.bkts.push(bucketName)
  }

  async list(prefix) {
    const params = {
      Bucket: this.bkt,
      Prefix: prefix,
    }
    return this.s3.listObjects(params).promise()
  }

  async getKey(key) {
    const params = {
      Bucket: this.bkt,
      Key: key,
    }
    const data = await Promise.all([
      this.s3.getObject(params).promise(),
      this.s3.getObjectTagging(params).promise(),
    ])

    data[0].TagSet = data[1].TagSet
    return data[0]
  }

  async upload(key, filePath, { optionalParams = {} } = {}) {
    const fileStream = fs.createReadStream(filePath)
    fileStream.on('error', err => console.log('File Error', err))
    const params = Object.assign({
      Bucket: this.bkt,
      Key: key,
      Body: fileStream,
    }, optionalParams)
    return this.s3.upload(params).promise()
  }

  async delete(keys) {
    if (!Array.isArray(keys) || !keys.length) {
      throw new Error(
        'Array of keys to delete in S3Manager.delete() is required.'
      )
    }
    const params = {
      Bucket: this.bkt,
      Delete: {
        Objects: keys.map(Key => ({ Key })),
        Quiet: false,
      },
    }
    return this.s3.deleteObjects(params).promise()
  }

  async deleteByPrefix(prefix) {
    if (typeof prefix !== 'string') {
      throw new Error('prefix in S3Manager.deleteByPrefix() must be String.')
    }
    const { Contents } = await this.list(prefix)

    if (!Contents || !Contents.length) {
      console.log(
        `No items found in bucket "${this.bkt}" matching prefix ${prefix}`
      )
      return Promise.resolve({
        code: 200,
        message: `No items found in bucket "${this.bkt}" matching prefix ${prefix}`,
        Bucket: this.bkt,
      })
    }
    const params = {
      Bucket: this.bkt,
      Delete: {
        Objects: Contents.map(({ Key }) => ({ Key })),
        Quiet: false,
      },
    }
    return this.s3.deleteObjects(params).promise()
  }
}

module.exports = S3Manager
