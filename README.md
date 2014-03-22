# NXT-NODE

An implementation of a LEGO NXT logic control suite in Node.js

## Installation
1. Clone the repo locally and switch into the directory:
```bash
$ git clone https://github.com/Codesleuth/nxt-node.git && cd nxt-node
```
2. Ensure python 2.7 is accessible by npm. To check your version of python, type:
```bash
$ python --version
Python 2.7.6
```
3. Install the packages with:
```bash
$ npm install
```
In some cases, Windows users will see `node-gyp` errors when `npm` attempts to compile `serialport`. The easiest way to solve this is to install [Visual Studio Express 2013 for Windows](http://www.visualstudio.com/en-us/products/visual-studio-express-vs.aspx), reopen the command prompt, and try again. The [serialport](https://github.com/voodootikigod/node-serialport) module needs to be built before it can be used and uses python to execute VSC to build. Please see the `serialport` readme for help if you have problems.
4. If all went well, you should be able to execute the script with:
```bash
$ npm start
```

## What to expect
Currently this script will start motor A, play a tone, then stop motor A.<br/>
If you wish to capture debug information, add `NXT`, `nxt-node` and `nxt-lib` to your `DEBUG` environment variable. You can do this with the following command in bash:
```bash
$ export DEBUG=NXT,nxt-node,nxt-lib

$ echo $DEBUG
NXT,nxt-node,nxt-lib
```
In Windows, use the following command:
```bat
> SET DEBUG=NXT,nxt-node,nxt-lib

> ECHO %DEBUG%
NXT,nxt-node,nxt-lib
```

## What's next?
The goal of this project is to simply move a motor at a gradually reducing rate, but in my personal typical fashion I prefer to push dependencies down into reusable modules.<br/>
There are no tests, which is a problem for me since I like writing tested code, but given that I don't know how the NXT Brick will respond to commands I make, I can't reliably mock it up. So, there may eventually be tests, but not right now.

### References
* [nxt tentacle project](http://ornella.iwr.uni-heidelberg.de/ROBOTICSLAB/ROBPROJECTS/COMPLETED/NXT_DAME/data/nxt_direct_command.pdf) (available from this repository here: [nxt_direct_command.pdf](https://github.com/Codesleuth/nxt-node/blob/master/nxt_direct_command.pdf))
* [serialport](https://github.com/voodootikigod/node-serialport)
* [node-nxt](https://github.com/paulcuth/node-nxt)
* [node-mindstorm-bt](https://github.com/davsebamse/node-mindstorm-bt)