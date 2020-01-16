const binary = require('bops')
const {OpCode, Ops} = require('./op_code')

/**
 * Class for working with Bitcoin scripts.
 *
 * A Bitcoin transaction contains inputs and outputs, each of which contain a
 * script to validate spending. A script contains many "chunks" of data. Each
 * chunk can either be an Op Code or a binary chunk of data.
 * @class {Script}
 */
class Script {
  /**
   * Creates a script instance.
   * @contructor
   * @param {Array} chunks An array of chunks of data
   */
  constructor(chunks) {
    this.chunks = []
    this.push(chunks)
  }

  /**
   * Parses an ASM string and returns a script instance.
   * @static
   * @param {String} str ASM script string
   @ @return {Script}
   */
  static fromASM(str) {
    const tokens = str.split(' '),
          chunks = [];

    for(let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token === '0') {
        chunks.push(Ops.OP_0)
      }
      else if (token === '-1') {
        chunks.push(Ops.OP_1NEGATE) 
      }
      else {
        const chunk = Ops[token] || binary.from(token, 'hex')
        chunks.push(chunk)
      }
    }

    return new this(chunks)
  }

  /**
   * Parses a binary transaction and returns a script instance.
   * @static
   * @param {Buffer} data Binary transaction
   @ @return {Script}
   */
  static fromBuffer(data) {
    if (!binary.is(data)) throw new Error('Data not a valid binary buffer');

    const chunks = []
    let pos = 0

    while(pos < data.length) {
      const op = binary.readUInt8(data, pos)
      let buf, size, len;

      if (op > 0 && op < 76) {
        buf = binary.subarray(data, pos+1, pos+op+1)
        len = buf.length + 1
      }
      else if (op === 76) {
        size = binary.readUInt8(data, pos+1)
        buf = binary.subarray(data, pos+2, pos+size+2)
        len = buf.length + 2
      }
      else if (op === 77) {
        size = binary.readUInt16LE(data, pos+1)
        buf = binary.subarray(data, pos+3, pos+size+3)
        len = buf.length + 3
      }
      else if (op === 78) {
        size = binary.readUInt32LE(data, pos+1)
        buf = binary.subarray(data, pos+5, pos+size+5)
        len = buf.length + 5
      }
      else {
        buf = Ops.byCode(op, true)
        len = 1
      }

      chunks.push(buf)
      pos += len
    }
    
    return new this(chunks)
  }

  /**
   * Parses a hex encoded script and returns a script instance.
   * @static
   * @param {String} str Hex script string
   @ @return {Script}
   */
  static fromHex(str) {
    const buf = binary.from(str, 'hex')
    return this.fromBuffer(buf)
  }

  /**
   * Push a single or array of chunks onto the script.
   * @param {Array|String|OpCode} chunks Data chunks
   * @return
   */
  push(chunks = []) {
    if (!Array.isArray(chunks)) return this.push([chunks]);

    for(let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i],
          type = typeof chunk;
      let data;

      if (binary.is(chunk) || chunk instanceof OpCode) {
        data = chunk
      }
      else if (Array.isArray(chunk) && chunk.every(i => Number.isInteger(i) && i <= 255)) {
        data = binary.from(chunk)
      }
      else if (type === 'string') {
        data = binary.from(chunk)
      }
      else if (type === 'number') {
        data = Ops.byCode(chunk)
      }
      
      if (!!data) this.chunks.push(data);
    }

    return this
  }

  /**
   * Searializes the script into an ASM encoded string.
   * @return {String}
   */
  toASM() {
    const chunks = [];
    for(let i = 0; i < this.chunks.length; i++) {
      const data = this.chunks[i];

      if (data instanceof OpCode) {
        if (data.code === 0) {
          chunks.push('0')
          continue
        }
        else if (data.op === 'OP_1NEGATE') {
          chunks.push('-1')
          continue
        }
        chunks.push(data.op)
      } else {
        const hex = binary.to(data, 'hex')
        chunks.push(hex)
      }
    }
    return chunks.join(' ')
  }

  /**
   * Searializes the script into a buffer.
   * @return {Buffer}
   */
  toBuffer() {
    let buf = binary.from('')

    for(let i = 0; i < this.chunks.length; i++) {
      let data = this.chunks[i];

      if (data instanceof OpCode) {
        buf = binary.join([buf, data.toBuffer()])
        continue
      }

      const len = data.length
      let lbuf

      if (len > 0 && len < 76) {
        lbuf = binary.create(1)
        binary.writeUInt8(lbuf, len, 0)
        data = binary.join([lbuf, data])
      }
      else if (len < 0x100) {
        lbuf = binary.create(1)
        binary.writeUInt8(lbuf, len, 0)
        data = binary.join([Ops.OP_PUSHDATA1.toBuffer(), lbuf, data])
      }
      else if (len < 0x10000) {
        lbuf = binary.create(2)
        binary.writeUInt16LE(lbuf, len, 0)
        data = binary.join([Ops.OP_PUSHDATA2.toBuffer(), lbuf, data])
      }
      else if (len < 0x100000000) {
        lbuf = binary.create(4)
        binary.writeUInt32LE(lbuf, len, 0)
        data = binary.join([Ops.OP_PUSHDATA4.toBuffer(), lbuf, data])
      }

      buf = binary.join([buf, data])
    }

    return buf
  }

  /**
   * Searializes the script into a hex encoded string.
   * @return {String}
   */
  toHex() {
    return binary.to(this.toBuffer(), 'hex')
  }
}

module.exports = {
  binary,
  Script,
  OpCode,
  Ops
}