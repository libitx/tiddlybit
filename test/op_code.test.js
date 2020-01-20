const { assert } = require('chai')
const { OpCode, Ops } = require('../index')


describe('new OpCode()', () => {
  it('must instantiate an OpCode by string', () => {
    const opcode = new OpCode('OP_RETURN')
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.code, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must throw an error with invalid string', () => {
    assert.throws(_ => new OpCode('fail'), 'Invalid OpCode')
  })
})


describe('OpCode#toBuffer()', () => {
  it('must return a data buffer', () => {
    const buf = new OpCode('OP_RETURN').toBuffer()
    assert.instanceOf(buf, Buffer)
    assert.lengthOf(buf, 1)
  })
})


describe('Ops', () => {
  it('must be a frozen object', () => {
    assert.typeOf(Ops, 'object')
    Ops.OP_RETURN = null
    Ops.OP_FAKE_IT = 'testing'
    assert.instanceOf(Ops.OP_RETURN, OpCode)
    assert.isUndefined(Ops.OP_FAKE_IT)
  })
})


describe('Ops.byCode()', () => {
  it('must find OpCode by number', () => {
    const opcode = Ops.byCode(106)
    assert.equal(opcode.op, 'OP_RETURN')
    assert.equal(opcode.code, 106)
    assert.isTrue(opcode.isValid)
  })

  it('must return null with invalid number', () => {
    assert.isNull(Ops.byCode(20))
  })

  it('must throw error with invalid number and err option', () => {
    assert.throws(_ => Ops.byCode(20, true), 'Invalid OpCode')
  })
})