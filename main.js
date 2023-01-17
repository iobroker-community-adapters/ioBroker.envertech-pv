// REMOVE NEXT LINE WHEN CLEANING UP CODE
// @ts-nocheck

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const request = require('request');

class envertech_pv extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'envertech-pv',
        });
        this.killTimeout = null;

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        const self = this;
        let pow1 = 0;
        let powergateway = 0;
        let gat = 0;
        let mppt_online = 0;
        let mppt_offline = 0;

        if (this.config.morelogoutput) {
            this.log.info('Loading envertech-pv');
        }
        if (this.config.station_id) {
            self.setObjectNotExists('data.info.last-data-received', {
                type: 'state',
                common: {
                    name: 'last-data-received',
                    type: 'string',
                    role: 'value',
                    def: 'no data received',
                    read: true,
                    write: false,
                },
                native: {},
            });

            self.setObjectNotExists('data.info.last-data-error', {
                type: 'state',
                common: {
                    name: 'last-data-error',
                    type: 'string',
                    role: 'value',
                    def: 'no error',
                    read: true,
                    write: false,
                },
                native: {},
            });
            self.setObjectNotExists('data.info.last-error-code', {
                type: 'state',
                common: {
                    name: 'last-error-code',
                    type: 'string',
                    role: 'value',
                    def: 'no error',
                    read: true,
                    write: false,
                },
                native: {},
            });

            self.setObjectNotExists('overview.info.last-data-received', {
                type: 'state',
                common: {
                    name: 'last-data-received',
                    type: 'string',
                    role: 'value',
                    def: 'no data received',
                    read: true,
                    write: false,
                },
                native: {},
            });

            self.setObjectNotExists('data.info.mppt_online', {
                type: 'state',
                common: {
                    name: 'mppt_online',
                    type: 'string',
                    role: 'value',
                    def: '0',
                    read: true,
                    write: false,
                },
                native: {},
            });

            self.setObjectNotExists('data.info.mppt_offline', {
                type: 'state',
                common: {
                    name: 'mppt_offline',
                    type: 'string',
                    role: 'value',
                    def: '0',
                    read: true,
                    write: false,
                },
                native: {},
            });

            request(
                {
                    method: 'POST',
                    url:
                        'https://www.envertecportal.com/ApiStations/getStationInfo?stationId=' + this.config.station_id,
                    json: true,
                    time: true,
                    timeout: 4500,
                },

                (error, response, content) => {
                    if (this.config.morelogoutput) {
                        self.log.info('request station done');
                    }

                    if (response) {
                        if (!error && response.statusCode == 200) {
                            if (this.config.morelogoutput) {
                                self.log.info('station data ok');
                            }
                            for (const key in content.Data) {
                                const obj = content.Data[key];
                                //self.log.info(key);
                                //self.log.info(obj);
                                //const unit = null;

                                let newtype1;
                                if (typeof obj == 'number') {
                                    newtype1 = 'number';
                                } else {
                                    newtype1 = 'string';
                                }

                                self.setObjectNotExists('overview.station.' + key, {
                                    type: 'state',
                                    common: {
                                        name: key,
                                        type: newtype1,
                                        role: 'value',
                                        read: true,
                                        write: false,
                                    },
                                    native: {},
                                });
                                self.setState('overview.station.' + key, { val: obj, ack: true });
                            }
                            //self.log.info('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                            const datum_string = new Date().toLocaleString();
                            self.setState('overview.info.last-data-received', { val: datum_string, ack: true });
                        }
                    } else if (error) {
                        self.log.error(error);
                    }
                },
            );

            request(
                {
                    method: 'POST',
                    url:
                        'https://www.envertecportal.com/ApiInverters/QueryTerminalReal?page=1&perPage=20&orderBy=GATEWAYSN&whereCondition=%7B%22STATIONID%22%3A%22' +
                        this.config.station_id +
                        '%22%7D',
                    json: true,
                    time: true,
                    timeout: 4500,
                },
                (error, response, content) => {
                    if (this.config.morelogoutput) {
                        self.log.info('request data done');
                    }

                    if (response) {
                        //self.log.info('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                        if (!error && response.statusCode == 200) {
                            if (this.config.morelogoutput) {
                                self.log.info('data ok');
                            }
                            const unitList = {
                                DCVOLTAGE: 'V',
                                ACVOLTAGE: 'V',
                                POWER: 'watt',
                                FREQUENCY: 'Hz',
                                DAYENERGY: 'kWh',
                                ENERGY: 'kWh',
                                TEMPERATURE: '°C',
                            };

                            for (const key in content.Data.QueryResults) {
                                const obj = content.Data.QueryResults[key];
                                const gateway = obj['GATEWAYSN'].replace(/ /g, '-');
                                const alias = obj['SNALIAS'].replace(/ /g, '-');

                                // eslint-disable-next-line prefer-const
                                for (let [key, value] of Object.entries(obj)) {
                                    //self.log.info(gateway);
                                    //self.log.info(gat);
                                    if (gat == 0 || gat == gateway) {
                                        gat = gateway;
                                        if (key == 'DAYENERGY') {
                                            const x = parseFloat(value);
                                            //self.log.info(x);
                                            pow1 += x;
                                            //self.log.info(pow1);
                                        }
                                        if (key == 'POWER') {
                                            const y = parseFloat(value);
                                            //self.log.info(x);
                                            powergateway += y;
                                            //self.log.info(pow1);
                                        }
                                        if (key == 'STATUS') {
                                            if (parseFloat(value) == '0') {
                                                mppt_online += 1;
                                            }
                                            if (parseFloat(value) == '1') {
                                                mppt_offline += 1;
                                            }
                                        }

                                        self.setObjectNotExists('data.gateway_' + gat + '.info.gateway_power_now', {
                                            type: 'state',
                                            common: {
                                                name: 'gateway_power_now',
                                                type: 'string',
                                                role: 'value',
                                                unit: 'watt',
                                                read: true,
                                                write: false,
                                            },
                                            native: {},
                                        });

                                        self.setState('data.gateway_' + gat + '.info.gateway_power_now', {
                                            val: powergateway.toFixed(0),
                                            ack: true,
                                        });
                                        //powergateway = 0;
                                    } else {
                                        powergateway = 0;
                                        //self.log.info(pow1);
                                        //self.log.info(gateway);

                                        self.setObjectNotExists('data.gateway_' + gat + '.info.gateway_day_energy', {
                                            type: 'state',
                                            common: {
                                                name: 'gateway_day_energy',
                                                type: 'string',
                                                role: 'value',
                                                unit: 'kWh',
                                                read: true,
                                                write: false,
                                            },
                                            native: {},
                                        });

                                        self.setState('data.gateway_' + gat + '.info.gateway_day_energy', {
                                            val: pow1.toFixed(3),
                                            ack: true,
                                        });

                                        //self.log.info("else");
                                        pow1 = 0;
                                        //self.log.info(pow1);
                                        if (key == 'DAYENERGY') {
                                            const x = parseFloat(value);
                                            //self.log.info(x);
                                            pow1 += x;
                                            //self.log.info(pow1);
                                        }
                                        if (key == 'POWER') {
                                            const y = parseFloat(value);
                                            //self.log.info(x);
                                            powergateway += y;
                                            //self.log.info(pow1);
                                        }

                                        gat = gateway;
                                    }

                                    let unit = null;

                                    if (Object.prototype.hasOwnProperty.call(unitList, key)) {
                                        unit = unitList[key];
                                    }

                                    self.setObjectNotExists('data.gateway_' + gateway + '.' + alias + '.' + key, {
                                        type: 'state',
                                        common: {
                                            name: alias + '.' + key,
                                            type: 'string',
                                            role: 'value',
                                            unit: unit,
                                            read: true,
                                            write: false,
                                        },
                                        native: {},
                                    });
                                    self.setState('data.gateway_' + gateway + '.' + alias + '.' + key, {
                                        val: value,
                                        ack: true,
                                    });
                                }
                            }
                            //self.log.info(pow1);
                            //self.log.info(gat);
                            self.setObjectNotExists('data.gateway_' + gat + '.info.gateway_day_energy', {
                                type: 'state',
                                common: {
                                    name: 'gateway_day_energy',
                                    type: 'string',
                                    role: 'value',
                                    unit: 'kWh',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            self.setObjectNotExists('data.gateway_' + gat + '.info.gateway_power_now', {
                                type: 'state',
                                common: {
                                    name: 'gateway_power_now',
                                    type: 'string',
                                    role: 'value',
                                    unit: 'watt',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                            self.setState('data.gateway_' + gat + '.info.gateway_day_energy', {
                                val: pow1.toFixed(3),
                                ack: true,
                            });
                            self.setState('data.gateway_' + gat + '.info.gateway_power_now', {
                                val: powergateway.toFixed(0),
                                ack: true,
                            });
                            self.setState('data.info.mppt_online', { val: mppt_online.toFixed(0), ack: true });
                            self.setState('data.info.mppt_offline', { val: mppt_offline.toFixed(0), ack: true });
                            mppt_online = 0;

                            const datum_string = new Date().toLocaleString();
                            self.setState('data.info.last-data-received', { val: datum_string, ack: true });
                        }
                    } else if (error) {
                        const datum_string = new Date().toLocaleString();
                        self.setState('data.info.last-data-error', { val: datum_string, ack: true });
                        self.setState('data.info.last-error-code', { val: error.toString(), ack: true });
                        self.log.error(error);
                    }
                },
            );
        } else {
            self.log.error('Station_id Error');
        }

        //setTimeout(this.stop.bind(this), 10000);
        this.killthetimeout = setTimeout(this.stop.bind(this), 10000);
    }

    onUnload(callback) {
        try {
            if (this.killthetimeout) {
                this.log.debug('clearing and kill timeout');
                clearTimeout(this.killthetimeout);
            }
            this.log.debug('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }
}
// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new envertech_pv(options);
} else {
    // otherwise start the instance directly
    new envertech_pv();
}
