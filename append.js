const appender = (separator = ' ', txt = '') => word => {
  txt += separator + word
  return txt
}

const append = appender('\n')

append('abc')
append('def')
append('ghi')

const final = append('')

console.log('----final---')
console.log(final !== '\n' ? final : 'nothing')
