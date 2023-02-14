(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
function validateForm() {

  // Updating the swear word detection and censoring using advance profanity libraries present on Github
  // Using this one : https://github.com/raymondjavaxx/swearjar-node

  // Initializing the swearjar profanity fil
  var swearjar = require('swearjar');

  var question = document.forms["myForm"]["question"].value.toLowerCase();
  var answer = document.forms["myForm"]["answer"].value.toLowerCase();
  
  // var swear_words = ["arse", "arsehole", "as useful as tits on a bull", "balls", "bastard", "beaver", "beef curtains", "bell", "bellend", "bent", "berk", "bint", "bitch", "blighter", "blimey", "blimey o'reilly", "bloodclaat", "bloody", "bloody hell", "blooming", "bollocks", "bonk", "bugger", "bugger me", "bugger off", "built like a brick shit-house", "bukkake", "bullshit", "cack", "cad", "chav", "cheese eating surrender monkey", "choad", "chuffer", "clunge", "cobblers", "cock", "cock cheese", "cock jockey", "cock-up", "cocksucker", "cockwomble", "codger", "cor blimey", "corey", "cow", "crap", "crikey", "cunt", "daft", "daft cow", "damn", "dick", "dickhead", "did he bollocks!", "did i fuck as like!", "dildo", "dodgy", "duffer", "fanny", "feck", "flaps", "fuck", "fuck me sideways!", "fucking cunt", "fucktard", "gash", "ginger", "git", "gob shite", "goddam", "gorblimey", "gordon bennett", "gormless", "he’s a knob", "hell", "hobknocker", "I'd rather snort my own cum", "jesus christ", "jizz", "knob", "knobber", "knobend", "knobhead", "ligger", "like fucking a dying man's handshake", "mad as a hatter", "manky", "minge", "minger", "minging", "motherfucker", "munter", "muppet", "naff", "nitwit", "nonce", "numpty", "nutter", "off their rocker", "penguin", "pillock", "pish", "piss off", "piss-flaps", "pissed", "pissed off", "play the five-fingered flute", "plonker", "ponce", "poof", "pouf", "poxy", "prat", "prick", "prick", "prickteaser", "punani", "punny", "pussy", "randy", "rapey", "rat arsed", "rotter", "scrubber", "shag", "shit", "shite", "shitfaced", "skank", "slag", "slapper", "slut", "snatch", "sod", "sod-off", "son of a bitch", "spunk", "stick it up your arse!", "swine", "taking the piss", "tits", "toff", "tosser", "trollop", "tuss", "twat", "twonk", "u fukin wanker", "wally", "wanker", "wankstain", "wazzack", "whore"];

  // for (var i = 0; i < swear_words.length; i++) {
  //   if (question.includes(swear_words[i]) || answer.includes(swear_words[i])) {
  //     alert("Question or answer contains the word, `" + swear_words[i] + "` which cannot be used in this website.");
  //     return false;
  //   }
  // }

  if (swearjar.profane(question) || swearjar.profane(answer)) {
        alert("Your input contains some sort of profane words which cannot be allowed on our site!");
        return false;
  }


  // Later the swearjar's censor() function could be used to censor those words too
  // var clean = swearjar.censor("f-bomb you"); // **** you
  // more such filters targetting different languages could be used here to increase the strictness

  return true;
}
},{"swearjar":5}],4:[function(require,module,exports){
module.exports={
  "anus": ["sexual"],
  "arse": ["insult"],
  "arsehole": ["insult"],
  "ass": ["sexual","insult"],
  "ass-hat": ["insult"],
  "ass-pirate": ["discriminatory"],
  "assbag": ["insult"],
  "assbandit": ["discriminatory"],
  "assbanger": ["discriminatory"],
  "assbite": ["insult"],
  "assclown": ["sexual"],
  "asscock": ["insult"],
  "asscracker": ["sexual"],
  "assface": ["sexual"],
  "assfuck": ["sexual"],
  "assfucker": ["discriminatory"],
  "assgoblin": ["discriminatory"],
  "asshat": ["sexual"],
  "asshead": ["insult"],
  "asshole": ["insult"],
  "asshopper": ["discriminatory"],
  "assjacker": ["discriminatory"],
  "asslick": ["insult"],
  "asslicker": ["insult"],
  "assmonkey": ["insult"],
  "assmunch": ["insult"],
  "assmuncher": ["sexual"],
  "assnigger": ["discriminatory"],
  "asspirate": ["discriminatory"],
  "assshit": ["insult"],
  "assshole": ["sexual"],
  "asssucker": ["insult"],
  "asswad": ["sexual"],
  "asswipe": ["sexual"],
  "bampot": ["insult"],
  "bastard": ["insult"],
  "beaner": ["discriminatory"],
  "beastial": ["sexual"],
  "beastiality": ["sexual"],
  "beastility": ["sexual"],
  "bestial": ["sexual"],
  "bestiality": ["sexual"],
  "bitch": ["insult"],
  "bitchass": ["insult"],
  "bitcher": ["insult"],
  "bitchin": ["inappropriate"],
  "bitching": ["inappropriate"],
  "bitchtit": ["discriminatory"],
  "bitchy": ["insult"],
  "blow job": ["sexual"],
  "blowjob": ["sexual"],
  "bollocks": ["sexual"],
  "bollox": ["sexual"],
  "boner": ["sexual"],
  "bullshit": ["inappropriate"],
  "butt plug": ["sexual"],
  "camel toe": ["sexual"],
  "choad": ["sexual"],
  "chode": ["sexual"],
  "clit": ["sexual"],
  "clitface": ["insult"],
  "clitfuck": ["sexual"],
  "clusterfuck": ["inappropriate"],
  "cock": ["sexual"],
  "cockbite": ["insult"],
  "cockburger": ["insult"],
  "cockface": ["insult"],
  "cockfucker": ["insult"],
  "cockhead": ["insult"],
  "cockmonkey": ["insult"],
  "cocknose": ["insult"],
  "cocknugget": ["insult"],
  "cockshit": ["insult"],
  "cocksuck": ["sexual"],
  "cocksucked": ["sexual"],
  "cocksucker": ["discriminatory","sexual"],
  "cocksucking": ["sexual","discriminatory"],
  "cocksucks": ["sexual","discriminatory"],
  "coochie": ["sexual"],
  "coochy": ["sexual"],
  "cooter": ["sexual"],
  "cum": ["sexual"],
  "cumbubble": ["insult"],
  "cumdumpster": ["sexual"],
  "cummer": ["sexual"],
  "cumming": ["sexual"],
  "cumshot": ["sexual"],
  "cumslut": ["sexual","insult"],
  "cumtart": ["insult"],
  "cunillingus": ["sexual"],
  "cunnie": ["sexual"],
  "cunnilingus": ["sexual"],
  "cunt": ["insult","sexual"],
  "cuntface": ["insult"],
  "cunthole": ["sexual"],
  "cuntlick": ["sexual"],
  "cuntlicker": ["sexual","discriminatory"],
  "cuntlicking": ["sexual"],
  "cuntrag": ["insult"],
  "cuntslut": ["insult"],
  "cyberfuc": ["sexual"],
  "cyberfuck": ["sexual"],
  "cyberfucked": ["sexual"],
  "cyberfucker": ["sexual"],
  "cyberfucking": ["sexual"],
  "dago": ["discriminatory"],
  "damn": ["inappropriate"],
  "deggo": ["discriminatory"],
  "dick": ["sexual","insult"],
  "dickbag": ["insult"],
  "dickbeaters": ["sexual"],
  "dickface": ["insult"],
  "dickfuck": ["insult"],
  "dickhead": ["insult"],
  "dickhole": ["sexual"],
  "dickjuice": ["sexual"],
  "dickmilk": ["sexual"],
  "dickslap": ["sexual"],
  "dickwad": ["insult"],
  "dickweasel": ["insult"],
  "dickweed": ["insult"],
  "dickwod": ["insult"],
  "dildo": ["sexual"],
  "dink": ["insult","sexual"],
  "dipshit": ["insult"],
  "doochbag": ["insult"],
  "dookie": ["inappropriate"],
  "douche": ["insult"],
  "douche-fag": ["insult"],
  "douchebag": ["insult"],
  "douchewaffle": ["discriminatory"],
  "dumass": ["insult"],
  "dumb ass": ["insult"],
  "dumbass": ["insult"],
  "dumbfuck": ["insult"],
  "dumbshit": ["insult"],
  "dumshit": ["insult"],
  "ejaculate": ["sexual"],
  "ejaculated": ["sexual"],
  "ejaculates": ["sexual"],
  "ejaculating": ["sexual"],
  "ejaculation": ["sexual"],
  "fag": ["discriminatory"],
  "fagbag": ["discriminatory"],
  "fagfucker": ["discriminatory"],
  "fagging": ["discriminatory"],
  "faggit": ["discriminatory"],
  "faggot": ["discriminatory"],
  "faggotcock": ["discriminatory"],
  "faggs": ["discriminatory"],
  "fagot": ["discriminatory"],
  "fags": ["discriminatory"],
  "fagtard": ["discriminatory"],
  "fart": ["inappropriate"],
  "farted": ["inappropriate"],
  "farting": ["inappropriate"],
  "farty": ["inappropriate"],
  "fatass": ["insult"],
  "felatio": ["sexual"],
  "fellatio": ["sexual"],
  "feltch": ["sexual"],
  "fingerfuck": ["sexual"],
  "fingerfucked": ["sexual"],
  "fingerfucker": ["sexual"],
  "fingerfucking": ["sexual"],
  "fingerfucks": ["sexual"],
  "fistfuck": ["sexual"],
  "fistfucked": ["sexual"],
  "fistfucker": ["sexual"],
  "fistfucking": ["sexual"],
  "flamer": ["discriminatory"],
  "fuck": ["sexual"],
  "fuckass": ["insult"],
  "fuckbag": ["insult"],
  "fuckboy": ["insult"],
  "fuckbrain": ["insult"],
  "fuckbutt": ["sexual"],
  "fucked": ["sexual"],
  "fucker": ["sexual","insult"],
  "fuckersucker": ["insult"],
  "fuckface": ["insult"],
  "fuckhead": ["sexual"],
  "fuckhole": ["insult"],
  "fuckin": ["sexual"],
  "fucking": ["sexual"],
  "fuckme": ["sexual"],
  "fucknut": ["insult"],
  "fucknutt": ["insult"],
  "fuckoff": ["insult"],
  "fuckstick": ["sexual"],
  "fucktard": ["insult"],
  "fuckup": ["insult"],
  "fuckwad": ["insult"],
  "fuckwit": ["insult"],
  "fuckwitt": ["insult"],
  "fudgepacker": ["discriminatory"],
  "fuk": ["sexual"],
  "gangbang": ["sexual"],
  "gangbanged": ["sexual"],
  "goddamn": ["inappropriate","blasphemy"],
  "goddamnit": ["inappropriate","blasphemy"],
  "gooch": ["sexual"],
  "gook": ["discriminatory"],
  "gringo": ["discriminatory"],
  "guido": ["discriminatory"],
  "handjob": ["sexual"],
  "hardcoresex": ["sexual"],
  "heeb": ["discriminatory"],
  "hell": ["inappropriate"],
  "ho": ["discriminatory"],
  "hoe": ["discriminatory"],
  "homo": ["discriminatory"],
  "homodumbshit": ["insult"],
  "honkey": ["discriminatory"],
  "horniest": ["sexual"],
  "horny": ["sexual"],
  "hotsex": ["sexual"],
  "humping": ["sexual"],
  "jackass": ["insult"],
  "jap": ["discriminatory"],
  "jigaboo": ["discriminatory"],
  "jism": ["sexual"],
  "jiz": ["sexual"],
  "jizm": ["sexual"],
  "jizz": ["sexual"],
  "jungle bunny": ["discriminatory"],
  "junglebunny": ["discriminatory"],
  "kike": ["discriminatory"],
  "kock": ["sexual"],
  "kondum": ["sexual"],
  "kooch": ["sexual"],
  "kootch": ["sexual"],
  "kum": ["sexual"],
  "kumer": ["sexual"],
  "kummer": ["sexual"],
  "kumming": ["sexual"],
  "kums": ["sexual"],
  "kunilingus": ["sexual"],
  "kunt": ["sexual"],
  "kyke": ["discriminatory"],
  "lezzie": ["discriminatory"],
  "lust": ["sexual"],
  "lusting": ["sexual"],
  "mcfagget": ["discriminatory"],
  "mick": ["discriminatory"],
  "minge": ["sexual"],
  "mothafuck": ["sexual"],
  "mothafucka": ["sexual","insult"],
  "mothafuckaz": ["sexual"],
  "mothafucked": ["sexual"],
  "mothafucker": ["sexual","insult"],
  "mothafuckin": ["sexual"],
  "mothafucking": ["sexual"],
  "mothafucks": ["sexual"],
  "motherfuck": ["sexual"],
  "motherfucked": ["sexual"],
  "motherfucker": ["sexual","insult"],
  "motherfuckin": ["sexual"],
  "motherfucking": ["sexual"],
  "muff": ["sexual"],
  "muffdiver": ["discriminatory","sexual"],
  "munging": ["sexual"],
  "negro": ["discriminatory"],
  "nigga": ["discriminatory"],
  "nigger": ["discriminatory"],
  "niglet": ["discriminatory"],
  "nut sack": ["sexual"],
  "nutsack": ["sexual"],
  "orgasim": ["sexual"],
  "orgasm": ["sexual"],
  "paki": ["discriminatory"],
  "panooch": ["sexual"],
  "pecker": ["sexual"],
  "peckerhead": ["insult"],
  "penis": ["sexual"],
  "penisfucker": ["discriminatory"],
  "penispuffer": ["discriminatory"],
  "phonesex": ["sexual"],
  "phuk": ["sexual"],
  "phuked": ["sexual"],
  "phuking": ["sexual"],
  "phukked": ["sexual"],
  "phukking": ["sexual"],
  "phuks": ["sexual"],
  "phuq": ["sexual"],
  "pis": ["sexual"],
  "pises": ["sexual"],
  "pisin": ["sexual"],
  "pising": ["sexual"],
  "pisof": ["sexual"],
  "piss": ["inappropriate"],
  "pissed": ["inappropriate"],
  "pisser": ["sexual"],
  "pisses": ["sexual"],
  "pissflaps": ["sexual"],
  "pissin": ["sexual"],
  "pissing": ["sexual"],
  "pissoff": ["sexual"],
  "polesmoker": ["discriminatory"],
  "pollock": ["discriminatory"],
  "poon": ["sexual"],
  "poonani": ["sexual"],
  "poonany": ["sexual"],
  "poontang": ["sexual"],
  "porch monkey": ["discriminatory"],
  "porchmonkey": ["discriminatory"],
  "porn": ["sexual"],
  "porno": ["sexual"],
  "pornography": ["sexual"],
  "pornos": ["sexual"],
  "prick": ["sexual"],
  "punanny": ["sexual"],
  "punta": ["insult"],
  "pusies": ["sexual","insult"],
  "pussies": ["sexual","insult"],
  "pussy": ["sexual","insult"],
  "pussylicking": ["sexual"],
  "pusy": ["sexual"],
  "puto": ["insult"],
  "renob": ["sexual"],
  "rimjob": ["sexual"],
  "ruski": ["discriminatory"],
  "sandnigger": ["discriminatory"],
  "schlong": ["sexual"],
  "scrote": ["sexual"],
  "shit": ["sexual","inappropriate"],
  "shitass": ["insult"],
  "shitbag": ["insult"],
  "shitbagger": ["insult"],
  "shitbrain": ["insult"],
  "shitbreath": ["insult"],
  "shitcunt": ["insult"],
  "shitdick": ["insult"],
  "shited": ["sexual"],
  "shitface": ["insult"],
  "shitfaced": ["inappropriate","insult"],
  "shitfull": ["sexual"],
  "shithead": ["insult"],
  "shithole": ["insult"],
  "shithouse": ["inappropriate"],
  "shiting": ["sexual"],
  "shitspitter": ["sexual"],
  "shitstain": ["inappropriate","insult"],
  "shitted": ["sexual"],
  "shitter": ["sexual"],
  "shittiest": ["inappropriate"],
  "shitting": ["inappropriate"],
  "shitty": ["inappropriate"],
  "shity": ["sexual"],
  "shiz": ["inappropriate"],
  "shiznit": ["inappropriate"],
  "skank": ["insult"],
  "skeet": ["sexual"],
  "skullfuck": ["sexual"],
  "slut": ["discriminatory"],
  "slutbag": ["discriminatory"],
  "sluts": ["sexual"],
  "smeg": ["inappropriate"],
  "smut": ["sexual"],
  "snatch": ["sexual"],
  "spic": ["discriminatory"],
  "spick": ["discriminatory"],
  "splooge": ["sexual"],
  "spunk": ["sexual"],
  "tard": ["discriminatory"],
  "testicle": ["sexual"],
  "thundercunt": ["insult"],
  "tit": ["sexual"],
  "tits": ["sexual"],
  "titfuck": ["sexual"],
  "tittyfuck": ["sexual"],
  "twat": ["sexual"],
  "twatlips": ["insult"],
  "twatwaffle": ["discriminatory"],
  "unclefucker": ["discriminatory"],
  "va-j-j": ["sexual"],
  "vag": ["sexual"],
  "vagina": ["sexual"],
  "vjayjay": ["sexual"],
  "wank": ["sexual"],
  "wetback": ["discriminatory"],
  "whore": ["insult"],
  "whorebag": ["insult"],
  "whoreface": ["insult"]
}

},{}],5:[function(require,module,exports){
// swearjar-node
var path = require('path');
var swearjar = {

  _badWords: {},

  scan: function (text, callback) {
    var word, key, match;
    var regex = /\w+/g

    while (match = regex.exec(text)) {
      word = match[0];
      key  = word.toLowerCase();

      if (key in this._badWords && Array.isArray(this._badWords[key])) {
        if (callback(word, match.index, this._badWords[key]) === false) {
          break;
        }
      }
    }
  },

  profane: function (text) {
    var profane = false;

    this.scan(text, function (word, index, categories) {
      profane = true;
      return false; // Stop on first match
    });

    return profane;
  },

  scorecard: function (text) {
    var scorecard = {};

    this.scan(text, function (word, index, categories) {
      for (var i = 0; i < categories.length; i+=1) {
        var cat = categories[i];

        if (cat in scorecard) {
          scorecard[cat] += 1;
        } else {
          scorecard[cat] = 1;
        }
      };
    });

    return scorecard;
  },

  censor: function (text) {
    var censored = text;

    this.scan(text, function (word, index, categories) {
      censored = censored.substr(0, index) +
                  word.replace(/\S/g, '*') +
                  censored.substr(index + word.length);
    });

    return censored;
  },

  loadBadWords: function (relativePath) {
    var basePath = path.dirname(module.parent.filename);
    var fullPath = path.join(basePath, relativePath);
    this._badWords = require(fullPath);
  },
  
  setBadWords: function (badWords) {
    this._badWords = badWords || {};
  }
};

swearjar._badWords = require("./config/en_US.json");

module.exports = swearjar;

},{"./config/en_US.json":4,"path":1}]},{},[3]);
