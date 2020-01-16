const binary = require('bops')
const OpCode = require('./op_code')

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
    const chunks = str
      .split(' ')
      .map(token => {
        if (token === '0') return OpCode(0);
        if (token === '-1') return OpCode('OP_1NEGATE');
        try {
          return OpCode(token)
        } catch(e) {
          return binary.from(token, 'hex')
        }
      })
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

    const chunks = this._parseBufferR(data, [])
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
   * Recursively parses a buffer and and array of script chunks.
   * @static
   * @private
   */
  static _parseBufferR(data, chunks) {
    if (data.length === 0) return chunks;

    const op = binary.readUInt8(data, 0)
    let buf, size, len;

    if (op > 0 && op < 76) {
      buf = binary.subarray(data, 1, op+1)
      len = buf.length + 1
    }
    else if (op === 76) {
      size = binary.readUInt8(data, 1)
      buf = binary.subarray(data, 2, size+2)
      len = buf.length + 2
    }
    else if (op === 77) {
      size = binary.readUInt16LE(data, 1)
      buf = binary.subarray(data, 3, size+3)
      len = buf.length + 3
    }
    else if (op === 78) {
      size = binary.readUInt32LE(data, 1)
      buf = binary.subarray(data, 5, size+5)
      len = buf.length + 5
    }
    else {
      buf = OpCode(op)
      len = 1
    }

    chunks.push(buf)
    return this._parseBufferR(binary.subarray(data, len), chunks)
  }

  /**
   * Push a single or array of chunks onto the script.
   * @param {Array|String|OpCode} chunks Data chunks
   * @return
   */
  push(chunks = []) {
    if (!Array.isArray(chunks)) return this.push([chunks]);

    chunks.forEach(chunk => {
      const type = typeof chunk
      let data

      if (binary.is(chunk) || chunk.constructor.name === 'OpCode') {
        data = chunk
      }
      else if (Array.isArray(chunk) && chunk.every(i => Number.isInteger(i) && i <= 255)) {
        data = binary.from(chunk)
      }
      else if (type === 'string') {
        data = binary.from(chunk)
      }
      
      this.chunks.push(data)
    })

    return this
  }

  /**
   * Push a single or array of op codes (as string or integer) onto the script.
   * @param {Array|String|Number} ops Op Codes
   * @return
   */
  pushOp(ops = []) {
    if (!Array.isArray(ops)) return this.push([ops]);

    ops.forEach(op => {
      const opcode = OpCode(op)
      this.chunks.push(opcode)
    })
  }

  /**
   * Searializes the script into an ASM encoded string.
   * @return {String}
   */
  toASM() {
    return this.chunks
      .map(data => {
        if (data.constructor.name === 'OpCode') {
          if (data.code === 0) return '0';
          if (data.op === 'OP_1NEGATE') return '-1';
          return data.op;
        } else {
          return binary.to(data, 'hex');
        }
      })
      .join(' ')
  }

  /**
   * Searializes the script into a buffer.
   * @return {Buffer}
   */
  toBuffer() {
    return this.chunks.reduce((buf, data) => {
      if (data.constructor.name === 'OpCode') {
        return binary.join([buf, data.toBuffer()])
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
        data = binary.join([OpCode('OP_PUSHDATA1').toBuffer(), lbuf, data])
      }
      else if (len < 0x10000) {
        lbuf = binary.create(2)
        binary.writeUInt16LE(lbuf, len, 0)
        data = binary.join([OpCode('OP_PUSHDATA2').toBuffer(), lbuf, data])
      }
      else if (len < 0x100000000) {
        lbuf = binary.create(4)
        binary.writeUInt32LE(lbuf, len, 0)
        data = binary.join([OpCode('OP_PUSHDATA4').toBuffer(), lbuf, data])
      }

      return binary.join([buf, data])
    }, binary.from(''))
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
  OpCode
}