![Logo](admin/envertech.png)
# ioBroker.envertech-pv
[![NPM version](http://img.shields.io/npm/v/iobroker.envertech-pv.svg)](https://www.npmjs.com/package/iobroker.envertech-pv)
[![Downloads](https://img.shields.io/npm/dm/iobroker.envertech-pv.svg)](https://www.npmjs.com/package/iobroker.envertech-pv)
[![Stable](http://iobroker.live/badges/envertech-pv-stable.svg)](http://iobroker.live/badges/envertech-pv-stable.svg)
[![installed](http://iobroker.live/badges/envertech-pv-installed.svg)](http://iobroker.live/badges/envertech-pv-installed.svg)
[![Dependency Status](https://img.shields.io/david/adcrafter27/iobroker.envertech-pv.svg)](https://david-dm.org/adcrafter27/iobroker.envertech-pv)
[![Known Vulnerabilities](https://snyk.io/test/github/adcrafter27/ioBroker.envertech-pv/badge.svg)](https://snyk.io/test/github/adcrafter27/ioBroker.envertech-pv)
[![Build Status](http://img.shields.io/travis/adcrafter27/ioBroker.envertech-pv.svg)](https://travis-ci.org/adcrafter27/ioBroker.envertech-pv)

[![NPM](https://nodei.co/npm/iobroker.envertech-pv.png?downloads=true)](https://nodei.co/npm/iobroker.envertech-pv/)



## ioBroker.envertech-pv

You can read Data from Envertech.com Web

## Manual find Station ID

Die Station ID erhält ihr folgendermaßen:
Meldet euch mit euren Zugangsdaten unter www.envertecportal.com an.
Nach dem Login einen Rechtsklick auf die Seite und "Seitenquelltext anzeigen" klicken.
Danach sucht ihr nach "var stationId =".
Sollte ca. so aussehen: var stationId = '3EH583732993048DDX706VT57F8708452'; oder 4 stellen.
Ihr benötigt nur die zahlen und Buchstaben Kombination (3EH58373299348DDX706VT57F8708452).
Diese zahlen und Buchstaben Kombination müsst ihr unter den Einstellungen im Adapter eintragen.


## Changelog
## 0.0.7
* (adcrafter27) add more functions

## 0.0.6
* (adcrafter27) code fix

## 0.0.5
* (adcrafter27) release

## 0.0.3
* (adcrafter27) Update new functions

## 0.0.2
* (adcrafter27) First test release

## 0.0.1
* (adcrafter27) initial release

## License
MIT License

Copyright (c) 2020 adcrafter27 <adcrafter27@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.