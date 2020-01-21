# TiddlyBit

A tiddly JavaScript library for constructing, parsing and serializing Bitcoin scripts.

---

When you need to construct and serialize a Bitcoin script for use in something like Money Button, you could just use [bsv.js](https://github.com/moneybutton/bsv) and add 336kb to your website payload... or you could use **TiddlyBit** which is **96.4% more tiddly!**.

* TiddlyBit parses and serializes Bitcoin scripts to and from Buffers, Typed Arrays, and hex or ASM encoded strings.
* Weighing in at just 12kb minimised (4kb when gziped), TiddlyBit is a much leaner option for use on the Web.
* TiddlyBit uses Buffers in Node.js, but in the browser uses native Typed Arrays which is much more performant than putting binary data in Objects.
* Super simple, dev-friendly API.

## Installation

When using NPM:

```console
npm install tiddlybit
```

```js
const {Script, OpCode} = require('tiddlybit')
```

Or using in the browser via CDN:

```html
<script src="//unpkg.com/tiddlybit@latest/dist/tiddlybit.min.js"></script>
```

```js
const {Script, OpCode} = TiddlyBit
```

## Usage

Constructing a new script:

```js
const {Script, OpCode} = require('tiddlybit')

const script = new Script([
  OpCode.OP_FALSE,
  OpCode.OP_RETURN,
  'hello',
  'world'
])

script.toASM()
// => '0 OP_RETURN 68656c6c6f 776f726c64'

script.toHex()
// => '006a0568656c6c6f05776f726c64'
```

Parsing a script:

```js
const {Script} = require('tiddlybit')

const script = Script.fromHex('76a9146afc0d6bb578282ac0f6ad5c5af2294c1971210888ac')
// => Script {
//      chunks: [
//        <OpCode 118 OP_DUP>,
//        <OpCode 169 OP_HASH160>,
//        <Buffer 6a fc 0d 6b b5 78 28 2a c0 f6 ad 5c 5a f2 29 4c 19 71 21 08>,
//        <OpCode 136 OP_EQUALVERIFY>,
//        <OpCode 172 OP_CHECKSIG>
//      ]
//    }
```

The `OpCode` object has properties with cached instances for every valid code. If needed, new `OpCode` instances can be created using the contructor function:

```js
const {OpCode} = require('tiddlybit')

OpCode.OP_RETURN
// => <OpCode 106 OP_RETURN>

// If needed you can find an OpCode by it's byte number
OpCode.byByte(106)
// => <OpCode 106 OP_RETURN>

// Alternatively you can initialise a new OpCode
new OpCode('OP_RETURN')
// => <OpCode 106 OP_RETURN>
```

TiddlyBit also exposes a binary helper for cross-platform binary operations. See the [bops documentation](https://github.com/chrisdickinson/bops) for API details:

```js
const {binary, Script, OpCode} = require('tiddlybit')

const buf = binary.create(4)
binary.writeUInt32LE(buf, 0x12345678, 0)

const script = new Script([
  OpCode.OP_RETURN,
  buf
])
// => Script {
//      chunks: [
//        <OpCode 106 OP_RETURN>,
//        <Buffer 78 56 34 12>
//      ]
//    }
```

## API

### Script class

#### `new Script(array)`

Creates a script instance from the given array of data chunks.

#### `Script.fromASM(str)`

Parses an ASM string and returns a script instance.

#### `Script.fromBuffer(buf)`

Parses a binary transaction and returns a script instance.

#### `Script.fromHex(str)`

Parses a hex encoded script and returns a script instance.

### Script instance

#### `Script#push(array)`

Push a single or array of chunks onto the script.

#### `Script#toASM()`

Searializes the script into an ASM encoded string.

#### `Script#toBuffer()`

Searializes the script into a buffer.

#### `Script#toHex()`

Searializes the script into a hex encoded string.

### OpCode class

#### `new OpCode(string)`

Creates an OpCode instance from the given string.

#### `OpCode.byByte(str)`

Find OpCode instance by byte number.

### OpCode instance

#### `OpCode#toBuffer()`

Searializes the Op Code into a buffer.

## License

MIT License.

© Copyright 2020 libitx.
