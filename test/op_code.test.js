const { assert } = require('chai')
const { OpCode } = require('../index')


describe('OpCode()', () => {
  it('must instantiate an OpCode by string', () => {
    const opcode = OpCode('OP_RETURN')
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.code, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must instantiate an OpCode by number', () => {
    const opcode = OpCode(106)
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.code, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must throw an error with invalid string', () => {
    assert.throws(_ => OpCode('fail'), 'Invalid OpCode')
  })

  it('must throw an error with invalid number', () => {
    assert.throws(_ => OpCode(20), 'Invalid OpCode')
  })
})

describe('OpCode#toBuffer()', () => {
  it('must return a data buffer', () => {
    const buf = OpCode('OP_RETURN').toBuffer()
    assert.instanceOf(buf, Buffer)
    assert.lengthOf(buf, 1)
  })
})