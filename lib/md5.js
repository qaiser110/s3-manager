const crypt = require('crypto')
const fs = require('fs')

module.exports = file => {
  const data = fs.readFileSync(file)
  return crypt
    .createHash('md5')
    .update(data)
    .digest('base64')
}
