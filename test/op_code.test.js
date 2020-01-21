const { assert } = require('chai')
const { OpCode } = require('../index')


describe('new OpCode()', () => {
  it('must instantiate an OpCode by string', () => {
    const opcode = new OpCode('OP_RETURN')
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.byte, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must throw an error with invalid string', () => {
    assert.throws(_ => new OpCode('fail'), 'Invalid OpCode')
  })
})


describe('OpCode.byByte()', () => {
  it('must find OpCode by number', () => {
    const opcode = OpCode.byByte(106)
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.byte, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must return null with invalid number', () => {
    assert.isNull(OpCode.byByte(20))
  })

  it('must throw error with invalid number and err option', () => {
    assert.throws(_ => OpCode.byByte(20, true), 'Invalid OpCode')
  })
})


describe('OpCode', () => {
  it('must have a cache of all Op Code instances', () => {
    assert.instanceOf(OpCode.OP_RETURN, OpCode)
    assert.instanceOf(OpCode.OP_SHA256, OpCode)
  })

  it('must be a frozen object', () => {
    OpCode.OP_RETURN = null
    OpCode.OP_FAKE_IT = 'testing'
    assert.instanceOf(OpCode.OP_RETURN, OpCode)
    assert.isUndefined(OpCode.OP_FAKE_IT)
  })
})


describe('OpCode#toBuffer()', () => {
  it('must return a data buffer', () => {
    const buf = new OpCode('OP_RETURN').toBuffer()
    assert.instanceOf(buf, Buffer)
    assert.lengthOf(buf, 1)
  })
})
