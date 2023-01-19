![Logo](admin/envertech-pv.png)
# ioBroker.envertech-pv
[![NPM version](https://img.shields.io/npm/v/iobroker.envertech-pv.svg)](https://www.npmjs.com/package/iobroker.envertech-pv)
![Current version in stable repository](https://iobroker.live/badges/envertech-pv-stable.svg)
![Number of Installations](https://iobroker.live/badges/envertech-pv-installed.svg)
[![Test and Release](https://github.com/iobroker-community-adapters/ioBroker.envertech-pv/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/envertech-pv/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.envertech-pv.svg)](https://www.npmjs.com/package/iobroker.envertech-pv)

[![NPM](https://nodei.co/npm/iobroker.envertech-pv.png?downloads=true)](https://nodei.co/npm/iobroker.envertech-pv/)

<!--
**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.**
For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.
-->

## ioBroker.envertech-pv

This adapter supports retrieving PV data from www.envertecportal.com website.

## Disclaimer
**All product and company names or logos are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them or any associated subsidiaries! This personal project is maintained in spare time and has no business goal.**
**Envertec® is a registered trademark of Zhejiang Envertech Corporation Limited**


## Manual find Station ID

Die Station ID erhält ihr folgendermaßen:
Meldet euch mit euren Zugangsdaten unter www.envertecportal.com an.
Nach dem Login einen Rechtsklick auf die Seite und "Seitenquelltext anzeigen" klicken.
Danach sucht ihr nach "var stationId =".
Sollte ca. so aussehen: var stationId = '3EH583732993048DDX706VT57F8708452'; oder 4 stellen.
Ihr benötigt nur die zahlen und Buchstaben Kombination (3EH58373299348DDX706VT57F8708452).
Diese zahlen und Buchstaben Kombination müsst ihr unter den Einstellungen im Adapter eintragen.


## Credits
The work of the adapter would not had been possible without the great work of @adcrafter27 (https://github.com/adcrafter27).

## How to report issues and feature requests

Please use GitHub issues for this.

Best is to set the adapter to Debug log mode (Instances -> Expert mode -> Column Log level). Then please get the logfile from disk (subdirectory "log" in ioBroker installation directory and not from Admin because Admin cuts the lines). If you do not like providing it in GitHub issue you can also send it to me via email (mcm57@gmx.at). Please add a reference to the relevant GitHub issue AND also describe what I see in the log at which time.

## Changelog

<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**
* (mcm1957) moved adapter to iobroker-community-adapters organisation
* (mcm1957) Note: This is an intermediate release.

### 0.0.8
* (adcrafter27) add setting for more log output

### 0.0.7
* (adcrafter27) add more functions

### 0.0.6
* (adcrafter27) code fix

### 0.0.5
* (adcrafter27) release

### 0.0.3
* (adcrafter27) Update new functions

### 0.0.2
* (adcrafter27) First test release

### 0.0.1
* (adcrafter27) initial release

## License
MIT License

Copyright (c) 2023 mcm1957 <mcm57@gmx.at>, adcrafter27 <adcrafter27@gmail.com>

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