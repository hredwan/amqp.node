var codec = require('../lib/codec');
var assert = require('assert');

// These just test known encodings; to generate the answers I used
// RabbitMQ's binary generator module.

var testCases = [
    // integers
    ['byte', {byte: 127}, [4,98,121,116,101,98,127]],
    ['byte max value', {byte: 255}, [4,98,121,116,101,98,255]],
    ['byte min value', {byte: 0}, [4,98,121,116,101,98,0]],
    ['< 0 promoted to signed short', {short: -1}, [5,115,104,111,114,116,115,255,255]],
    ['> 255 promoted to short', {short: 256}, [5,115,104,111,114,116,115,1,0]],
    ['< 2^15 still a short', {short: 0x7fff}, [5,115,104,111,114,116,115,127,255]],
    ['-2^15 still a short', {short: -0x8000}, [5,115,104,111,114,116,115,128,0]],
    ['>= 2^15 promoted to int', {int: 0x8000}, [3,105,110,116,73,0,0,128,0]],
    ['< -2^15 promoted to int', {int: -0x8001}, [3,105,110,116,73,255,255,127,255]],
    ['< 2^31 still an int', {int: 0x7fffffff}, [3,105,110,116,73,127,255,255,255]],
    ['>= -2^31 still an int', {int: -0x80000000}, [3,105,110,116,73,128,0,0,0]],
    ['>= 2^31 promoted to long', {long: 0x80000000}, [4,108,111,110,103,108,0,0,0,0,128,0,0,0]],
    ['< -2^31 promoted to long', {long: -0x80000001}, [4,108,111,110,103,108,255,255,255,255,127,255,255,255]],

    // floating point
    ['float value', {double: 0.5}, [6,100,111,117,98,108,101,100,63,224,0,0,0,0,0,0]],
    ['negative float value', {double: -0.5}, [6,100,111,117,98,108,101,100,191,224,0,0,0,0,0,0]],
    // %% test some boundaries of precision?
    
    // string
    ['string', {string: "boop"}, [6,115,116,114,105,110,103,83,0,0,0,4,98,111,111,112]],

    // buffer -> byte array
    ['byte array from buffer', {bytes: new Buffer([1,2,3,4])},
     [5,98,121,116,101,115,120,0,0,0,4,1,2,3,4]],

    // boolean, void
    ['true', {bool: true}, [4,98,111,111,108,116,1]],
    ['false', {bool: false}, [4,98,111,111,108,116,0]],
    ['null', {'void': null}, [4,118,111,105,100,86]],

    // array, object
    ['array', {array: [6, true, "foo"]},
     [5,97,114,114,97,121,65,0,0,0,12,98,6,116,1,83,0,0,0,3,102,111,111]],
    ['object', {object: {foo: "bar", baz: 12}},
     [6,111,98,106,101,99,116,70,0,0,0,18,3,102,111,111,83,0,
      0,0,3,98,97,114,3,98,97,122,98,12]],

    // exotic types
    ['timestamp', {timestamp: {'!': 'timestamp', value: 1357212277527}},
     [9,116,105,109,101,115,116,97,109,112,84,0,0,1,60,0,39,219,23]],
    ['decimal', {decimal: {'!': 'decimal', value: {digits: 2345, places: 2}}},
     [7,100,101,99,105,109,97,108,68,2,0,0,9,41]],
    ['float', {float: {'!': 'float', value: 0.1}},
     [5,102,108,111,97,116,102,61,204,204,205]],,
];

testCases.forEach(function(tc) {
    var name = tc[0], val = tc[1], expect = tc[2];
    module.exports[name] = function() {
        var buffer = new Buffer(1000);
        var size = codec.encodeTable(buffer, val, 0);
        var result = buffer.slice(4, size);
        assert.deepEqual(expect, bufferToArray(result));
    };
});

function bufferToArray(b) {
    return Array.prototype.slice.call(b);
}
