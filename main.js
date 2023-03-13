/**
 *
 * envertech_pv adapter,
 *		copyright CTJaeger 2020 - 2022, MIT
 *		copyright McM1957 2023, MIT
 *
 */

// @ts-nocheck

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core');
const { iobInit, iobTranslator, iobTranslator } = require('@mcm1957/iobroker.library');
//const { iobInit, iobStates, iobTranslator } = require('e:/github/mcm1957/iobroker.library/library.js');

//const jsl = require('./lib/jslib.js');
//const translib = require('./lib/translib.js');

const EnvCloud = require('./lib/envertechCloud.js');

const translib = iobTranslator;

const STATEs = {};

/* prettier-ignore */
const STATES_CFG = {
    '_Error_':      {'type': 'boolean', 'name': 'error flag',       'desc': 'descError',        'role': 'indicator.maintenance',  'unit': '',    'cvt': null },
    '_ErrorText_':  {'type': 'string',  'name': 'error text',       'desc': 'descErrorText',    'role': 'text',                   'unit': '',    'cvt': null },
    '_LastData_':   {'type': 'string',  'name': 'last data',        'desc': 'descLastData',     'role': 'text',                   'unit': '',    'cvt': null },
    '_LastUpdate_': {'type': 'string',  'name': 'last update',      'desc': 'descLastUpdate',   'role': 'date',                   'unit': '',    'cvt': null },
    '_Online_':     {'type': 'boolean', 'name': 'online flag',      'desc': 'descOnline',       'role': 'indicator.reachable',    'unit': '',    'cvt': null },

    '_MpptOnline_': {'type': 'number', 'name': 'mppt online',       'desc': 'descMpptOnline',   'role': 'value',                  'unit': '',    'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '0,9 kWp'
    '_MpptOffline_':{'type': 'number', 'name': 'mppt offline',      'desc': 'descMpptOffline',  'role': 'value',                  'unit': '',    'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '0,9 kWp'
    '_StationId_':  {'type': 'string', 'name': 'station id',        'desc': 'descStationId',    'role': 'info.serial',            'unit': '',    'cvt': null },                            // ''

    'UnitCapacity': {'type': 'number', 'name': 'unit capacity',     'desc': 'descUnitCapacity', 'role': 'value.power',            'unit': 'kWp', 'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '0,9 kWp'
    'UnitEToday':   {'type': 'number', 'name': 'unit earned today', 'desc': 'descUnitEToday',   'role': 'value.power.production', 'unit': 'kWh', 'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '2.12 kWh'
    'UnitEMonth':   {'type': 'number', 'name': 'unit earned month', 'desc': 'descUnitEMonth',   'role': 'value.power.production', 'unit': 'kWh', 'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '6.99 kWh',
    'UnitEYear':    {'type': 'number', 'name': 'unit earned year',  'desc': 'descUnitEYear',    'role': 'value.power.production', 'unit': 'kWh', 'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     //'40.9 kWh',
    'UnitETotal':   {'type': 'number', 'name': 'unit earned total', 'desc': 'descUnitETotal',   'role': 'value.power.production', 'unit': 'kWh', 'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     //'353.49 kWh',
    'Power':        {'type': 'number', 'name': 'power',             'desc': 'descUnitPower',    'role': 'value.power',            'unit': 'kW',  'cvt': null },     // 0,
    'PowerStr':     {'type': null,     'name': '',                  'desc': '',                 'role': '',                       'unit': '',    'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     // '0 W',        *ignore*
    'Capacity':     {'type': null,     'name': '',                  'desc': '',                 'role': '',                       'unit': '',    'cvt': null },     // 0.9,          *ignore*
    'StrCO2':       {'type': 'number', 'name': 'co2 saved',         'desc': 'descStrCO2',       'role': 'value',                  'unit': 't',   'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     //'0.352 ton',
    'StrTrees':     {'type': 'number', 'name': 'trees',             'desc': 'descStrTrees',     'role': 'value',                  'unit': '',    'cvt': null },     // '1',
    'StrIncome':    {'type': 'number', 'name': 'income',            'desc': 'descStrIncome',    'role': 'value',                  'unit': '',    'cvt': /\w+\s+(?<val>\d+(\.\d+)?)/ },     //:'€ 0.00',
    'PwImg':        {'type': null,     'name': '',                  'desc': '',                 'role': '',                       'unit': '',    'cvt': null },     //'Default.jpg', *ignore*
    'StationName':  {'type': 'string', 'name': 'station name',      'desc': 'descStationName',  'role': 'info.name',              'unit': '',    'cvt': null },     //'KTG6',
    'InvModel1':    {'type': 'string', 'name': 'inverter #1 model', 'desc': 'descInvModel1',    'role': 'info.name',              'unit': '',    'cvt': null },     //null,
    'InvModel2':    {'type': 'string', 'name': 'inverter #2 model', 'desc': 'descInvModel2',    'role': 'info.name',              'unit': '',    'cvt': null },     //null,
    'Lat':          {'type': 'number', 'name': 'latitude',          'desc': 'descLat',          'role': 'value.gps.latitude',     'unit': '',    'cvt': null },     //48.208201762059105,
    'Lng':          {'type': 'number', 'name': 'longitude',         'desc': 'descLng',          'role': 'value.gps.longitude',    'unit': '',    'cvt': null },     //16.371216773986816,
    'TimeZone':     {'type': 'number', 'name': 'timezone',          'desc': 'descTimeZone',     'role': 'value',                  'unit': '',    'cvt': null },     //1,
    'StrPeakPower': {'type': 'number', 'name': 'peak power',        'desc': 'descStrPeakPower', 'role': 'value.power',            'unit': 'W',   'cvt': /(?<val>\d+(\.\d+)?)\s+\w+/ },     //'616.42 W',
    'Installer':    {'type': 'string', 'name': 'installer',         'desc': 'descInstaller',    'role': 'info.name',              'unit': '',    'cvt': null },     //null,
    'CreateTime':   {'type': 'string', 'name': 'create time',       'desc': 'descCreateTime',   'role': 'value',                  'unit': '',    'cvt': null },     //'21/12/2022 GMT +1',
    'CreateYear':   {'type': 'number', 'name': 'create year',       'desc': 'descCreateYear',   'role': 'value',                  'unit': '',    'cvt': null },     //2022,
    'CreateMonth':  {'type': 'number', 'name': 'create month',      'desc': 'descCreateMonth',  'role': 'value',                  'unit': '',    'cvt': null },     //12,
    'Etoday':       {'type': 'number', 'name': 'earning today',     'desc': 'descEtoday',       'role': 'value.power.production', 'unit': 'Wh',  'cvt': null },     //2.12,
    'InvTotal':     {'type': 'number', 'name': 'total inverts',     'desc': 'descInvTotal',     'role': 'value',                  'unit': '',    'cvt': null },     //2

    'GATEWAYALIAS': {'type': 'string', 'name': 'gateway alias',     'desc': 'descGatewayAlias',  'role': 'info.name',             'unit': '',    'cvt': null },     //'EVB300_94001732',
    'GATEWAYSN':    {'type': 'string', 'name': 'gateway sn',        'desc': 'descGatewaySn',     'role': 'info.serial',           'unit': '',    'cvt': null },     //'94001732',
    'SNALIAS':      {'type': 'string', 'name': 'converter alias',   'desc': 'descConverterAlias','role': 'info.name',             'unit': '',    'cvt': null },     //'EVT west',
    'SN':           {'type': 'string', 'name': 'convertser sn',     'desc': 'descConverterSn',   'role': 'info.serial',           'unit': '',    'cvt': null },     //'12866103',
    'DCVOLTAGE':    {'type': 'number', 'name': 'dc voltage',        'desc': 'descDcVoltage',     'role': 'value.voltage',         'unit': 'V',   'cvt': null },     //'32.54',
    'ACVOLTAGE':    {'type': 'number', 'name': 'ac voltage',        'desc': 'descAcVoltage',     'role': 'value.voltage',         'unit': 'V',   'cvt': null },     //'242.25',
    'ACCURRENCY':   {'type': null,     'name': '',                  'desc': 'descAccurency',     'role': '',                      'unit': '',   'cvt': null },     //'0',
    'POWER':        {'type': 'number', 'name': 'power',             'desc': 'descPower',         'role': 'value.power',           'unit': 'W',   'cvt': null },     //'14.19',
    'FREQUENCY':    {'type': 'number', 'name': 'frequency',         'desc': 'descFrequency',     'role': 'value.frequency',       'unit': 'Hz',  'cvt': null },     //'50.02',
    'DAYENERGY':    {'type': 'number', 'name': 'day energy',        'desc': 'descDayEnergy',     'role': 'value.power.production','unit': 'kWh', 'cvt': null },     //'0.24',
    'ENERGY':       {'type': 'number', 'name': 'energy',            'desc': 'descEnergy',        'role': 'value.power.production','unit': 'kWh', 'cvt': null },     //'202.52',
    'TEMPERATURE':  {'type': 'number', 'name': 'temperature',       'desc': 'descTemperature',   'role': 'value.temperature',     'unit': '°C',   'cvt': null },     //'15.4',
    'SITETIME':     {'type': 'string', 'name': 'site datetime',     'desc': 'descSiteDateTime',  'role': 'value',                 'unit': '',    'cvt': null },     //'3/5/2023 1:34:58 PM',
    'STATIONID':    {'type': 'string', 'name': 'station id',        'desc': 'descStationId',     'role': 'value',                 'unit': '',    'cvt': null },     //null,
    'STATUS':       {'type': 'number', 'name': 'status',            'desc': 'descStatus',        'role': 'value',                 'unit': '',    'cvt': null },     //'0',
    'SNID':         {'type': 'string', 'name': 'sn id',             'desc': 'descSnId',          'role': 'value',                 'unit': '',    'cvt': null },     //'9489A29C25BD4A468594E976AD2411E4'0
};

/**
 * main adapter class
 */
class envertech_pv extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'envertech-pv',
        });

        this.on('message', this.onMessage.bind(this));
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));

        //translib.init(this);
        iobInit(this);

        this.minDelayMs = (this.options?.expertMinDelay || 15) * 1000;
        this.cloudUrl = this.options?.expertUrl;
        this.cloudTmo = this.options?.expertTimeout || 30;
        this.stations = {};
    }

    /**
     * onReady - will be called as soon as adapter is ready
     *
     * @param
     * @return
     *
     */
    async onReady() {
        this.log.debug('onReady triggered');

        // reset
        await this.resetStateObjects();

        /*
        // login and retrieve station-id
        let result = 0;
        do {
            result = await this.doLogin();
            if (result === -1) {
                this.log.error('[login] aborting - please correct config');
                return;
            }
            await jsl.sleep(result);
        } while (result);

        this.log.info(`[login] successful login using station-id ${this.stationId}`);
*/
        // start scanning loop
        let stationCnt = 0;
        if (this.config.stations) {
            for (const station of this.config.stations) {
                this.log.info(`[start] scanning station with id ${station.stationId}`);

                let pollIntvl = station.pollIntvl || 60;
                if (pollIntvl < 15) pollIntvl = 15;
                this.stations[station.stationId] = {
                    envCloud: new EnvCloud(this, this.cloudUrl, this.cloudTmo),
                    pollIntvlMs: pollIntvl * 1000,
                    timer: null,
                };

                setImmediate(this.doScan.bind(this), station.stationId);
                stationCnt++;
                this.delay(5000);
            }
        }
        if (stationCnt) this.log.info(`scanning started for ${stationCnt} station(s)`);
        else this.log.warn(`no active station(s) detected - check config`);
        return;
    }

    /**
     * onUnload - called for adapter shuts down
     *
     * @param {callback} callback 	callback function
     * @return
     *
     */
    onUnload(callback) {
        this.log.debug('onUnload triggered');
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

    /**
     * onMessage - called if adapter receives a message
     *
     * @param {object} pObj 	message object
     * @return
     *
     */
    async onMessage(pObj) {
        if (pObj) {
            this.log.debug(`onMessage - ${JSON.stringify(pObj)}`);
            switch (pObj.command) {
                case 'getStationId': {
                    if (pObj.message) {
                        const username = pObj.message?.username;
                        const password = pObj.message?.password;
                        if (username.trim() === '' || password.trim() === '') {
                            if (pObj.callback) {
                                this.sendTo(
                                    pObj.from,
                                    pObj.command,
                                    { error: 'Username and password must not be empty' },
                                    pObj.callback,
                                );
                            }
                            return;
                        }

                        const envCloud = new EnvCloud(this);
                        const result = await envCloud.login(username, password);
                        if (result.status !== 0) {
                            this.log.error(`[login] ${result.statustext}`);
                            if (result.status < 0) {
                                // error raised by axios
                            } else if (result.status == 1) {
                                // envertech error
                            } else if (result.status >= 100) {
                                // http error
                            }
                            if (pObj.callback) {
                                this.sendTo(
                                    pObj.from,
                                    pObj.command,
                                    { error: `Error retrieving station-id: ${result.statustext}` },
                                    pObj.callback,
                                );
                            }
                            return;
                        }

                        this.stationId = result.data.stationId;
                        if (pObj.callback) {
                            this.sendTo(
                                pObj.from,
                                pObj.command,
                                { native: { cloudStationId: `${result.data.stationId}` } },
                                pObj.callback,
                            );
                        }
                        return;
                    }
                    break;
                }
            }
        }
    }

    /**
     * doScan - Scan station data
     *
     * @return  nothing
     *
     */
    async doScan(pStationId) {
        this.log.debug(`doScan triggered (${pStationId})`);
        this.stations[pStationId].timeout = null;

        const start = Date.now();

        // scan gateways
        await this.doQueryStation(pStationId);

        // scan gateways and converters
        await this.doQueryGateways(pStationId);

        // start next scan
        let delayMs = this.stations[pStationId].pollIntvlMs + start - Date.now();
        if (delayMs < this.minDelayMs) delayMs = this.minDelayMs;
        this.stations[pStationId].timeout = setTimeout(this.doScan.bind(this), delayMs, pStationId);
    }

    /**
     * doQueryGateways - Scan station data
     *
     * @return  nothing
     *
     */
    async doQueryGateways(pStationId) {
        this.log.debug(`doQueryGateways (${pStationId}`);

        const result = await this.stations[pStationId].envCloud.getGatewayInfo(pStationId);
        if (result.status < 0) {
            // error raised by axios
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.online`, { val: false, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error`, { val: true, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error_text`, {
                val: result.error_text,
                ack: true,
                q: 0x00,
            });
            return; // abort
        } else if (result.status == 1) {
            //
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.online`, { val: false, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error`, { val: true, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error_text`, {
                val: result.error_text,
                ack: true,
                q: 0x00,
            });
            return; // abort
        } else if (result.status >= 100) {
            //
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.online`, { val: false, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error`, { val: true, ack: true, q: 0x00 });
            await iobStates.setStatesAsync(`ST-${pStationId}.GW-*.info.error_text`, {
                val: result.error_text,
                ack: true,
                q: 0x00,
            });
            return; // abort
        }
        if (!result.data.QueryResults) return;

        for (const row of result.data.QueryResults) {
            const gatewayAlias = row['GATEWAYALIAS'];
            const gatewaySn = row['GATEWAYSN'];

            const gatewayId = `ST-${pStationId}.GW-${gatewaySn}`;
            await this.initObject({
                _id: `${gatewayId}`,
                type: 'device',
                common: {
                    name: `gateway ${gatewayAlias}`,
                    statusStates: {
                        onlineId: `${this.name}.${this.instance}.${gatewayId}.info.online`,
                        errorId: `${this.name}.${this.instance}.${gatewayId}.info.error`,
                    },
                },
                native: {},
            });

            await this.initObject({
                _id: `${gatewayId}.info`,
                type: 'folder',
                common: {
                    name: `gateway ${gatewayAlias} info`,
                },
                native: {},
            });

            await this.initStateObject(`${gatewayId}.info.error`, STATES_CFG['_Error_']);
            await this.initStateObject(`${gatewayId}.info.error_text`, STATES_CFG['_ErrorText_']);
            await this.initStateObject(`${gatewayId}.info.last_update`, STATES_CFG['_LastUpdate_']);
            await this.initStateObject(`${gatewayId}.info.online`, STATES_CFG['_Online_']);

            await this.initStateObject(`${gatewayId}.mppt_online`, STATES_CFG['_MpptOnline_']);
            await this.initStateObject(`${gatewayId}.mppt_offline`, STATES_CFG['_MpptOffline_']);

            /* prettier-ignore */
            await this.setStateAsync(`${gatewayId}.info.last_update`, { val: new Date().toLocaleString(), ack: true, q: 0x00 });
            await this.setStateAsync(`${gatewayId}.info.online`, { val: true, ack: true, q: 0x00 });
            await this.setStateAsync(`${gatewayId}.info.error`, { val: false, ack: true, q: 0x00 });
            await this.setStateAsync(`${gatewayId}.info.error_text`, { val: null, ack: true, q: 0x00 });

            const snAlias = row['SNALIAS'];
            const sn = row['SN'];

            const rootId = `ST-${pStationId}.GW-${gatewaySn}.CVT-${sn}`;
            await this.initObject({
                _id: `${rootId}`,
                type: 'channel',
                common: {
                    name: `converter ${snAlias}`,
                    statusStates: {
                        onlineId: `${this.name}.${this.instance}.${rootId}.info.online`,
                        errorId: `${this.name}.${this.instance}.${rootId}.info.error`,
                    },
                },
                native: {},
            });

            await this.initObject({
                _id: `${rootId}.info`,
                type: 'folder',
                common: {
                    name: `converter ${snAlias} info`,
                },
                native: {},
            });

            await this.initStateObject(`${rootId}.info.online`, STATES_CFG['_Online_']);
            await this.setStateAsync(`${rootId}.info.online`, { val: true, ack: true, q: 0x00 });

            for (const key in row) {
                this.log.debug(`[gatewayinfo] processing ${key}`);
                await this.initStateObject(`${rootId}.${key}`, STATES_CFG[key]);

                if (typeof STATEs[`${this.name}.${this.instance}.${rootId}.${key}`] === 'undefined') continue; // undesired object

                let val = row[key];
                if (STATES_CFG[key].cvt && typeof val === 'string') {
                    const match = result.data[key].match(STATES_CFG[key].cvt);
                    if (match) {
                        val = match.groups.val;
                    } else {
                        this.log.debug(`[gateway] unexpected data format for ${key} - ${val}`);
                    }
                }
                if (STATES_CFG[key].type === 'number') val = Number(val);
                await this.setStateAsync(`${rootId}.${key}`, { val: val, ack: true, q: 0x00 });
            }
        }

        // data total count - total converters
        /*
        for (const key in content.Data.QueryResults) {
            const obj = content.Data.QueryResults[key];
            const gateway = obj['GATEWAYSN'].replace(/ /g, '-');
            const alias = obj['SNALIAS'].replace(/ /g, '-');
*/
    }

    /**
     * doQueryStation - Scan station data
     *
     * @return  nothing
     *
     */
    async doQueryStation(pStationId) {
        this.log.debug(`doQueryStation (${pStationId})`);

        const rootId = `ST-${pStationId}`;

        const result = await this.stations[pStationId].envCloud.getStationInfo(pStationId);
        if (result.status < 0) {
            // error raised by axios
            if (this.stationInitialized) {
                if (!result.statustext.match(/Error: connect ETIMEDOUT/))
                    await this.setStateAsync(`${rootId}.info.error`, { val: true, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.error_text`, { val: result.statustext, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.online`, { val: false, ack: true, q: 0x00 });
            }
            return; // abort
        } else if (result.status == 1) {
            if (this.stationInitialized) {
                await this.setStateAsync(`${rootId}.info.error_text`, { val: result.statustext, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.online`, { val: false, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.error`, { val: true, ack: true, q: 0x00 });
            }
            return; // abort
        } else if (result.status >= 100) {
            // http error
            if (this.stationInitialized) {
                if (!result.statustext.match(/Error: connect ETIMEDOUT/))
                    await this.setStateAsync(`${rootId}.info.error`, { val: true, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.error_text`, { val: result.statustext, ack: true, q: 0x00 });
                await this.setStateAsync(`${rootId}.info.online`, { val: false, ack: true, q: 0x00 });
            }
            return; // abort
        }

        await this.initObject({
            _id: `${rootId}`,
            type: 'folder',
            common: {
                name: `station ${result.data.StationName}`,
                statusStates: {
                    onlineId: `${this.name}.${this.instance}.${rootId}.info.online`,
                    errorId: `${this.name}.${this.instance}.${rootId}.info.error`,
                },
            },
            native: {},
        });

        await this.initObject({
            _id: `${rootId}.info`,
            type: 'channel',
            common: {
                name: `station ${result.data.StationName} info`,
            },
            native: {},
        });

        await this.initStateObject(`${rootId}.info.error`, STATES_CFG['_Error_']);
        await this.initStateObject(`${rootId}.info.error_text`, STATES_CFG['_ErrorText_']);
        //await this.initStateObject(`${rootId}.info.last_data`, STATES_CFG['_LastData_']);
        await this.initStateObject(`${rootId}.info.last_update`, STATES_CFG['_LastUpdate_']);
        await this.initStateObject(`${rootId}.info.online`, STATES_CFG['_Online_']);

        await this.initStateObject(`${rootId}.mppt_online`, STATES_CFG['_MpptOnline_']);
        await this.initStateObject(`${rootId}.mppt_offline`, STATES_CFG['_MpptOffline_']);
        await this.initStateObject(`${rootId}.station_id`, STATES_CFG['_StationId_']);

        this.stationInitialized = true;

        /* prettier-ignore */
        await this.setStateAsync(`${rootId}.info.last_update`, { val: new Date().toLocaleString(), ack: true, q: 0x00 });
        //await this.setStateAsync(`${rootId}.info.last_data`, { val: null, ack: true, q: 0x00 });
        await this.setStateAsync(`${rootId}.info.online`, { val: true, ack: true, q: 0x00 });
        await this.setStateAsync(`${rootId}.info.error`, { val: false, ack: true, q: 0x00 });
        await this.setStateAsync(`${rootId}.info.error_text`, { val: null, ack: true, q: 0x00 });

        await this.setStateAsync(`${rootId}.station_id`, { val: pStationId, ack: true, q: 0x00 });

        for (const key in result.data) {
            this.log.debug(`[stationdatainfo] processing station info ${key}`);
            await this.initStateObject(`${rootId}.${key}`, STATES_CFG[key]);

            if (typeof STATEs[`${this.name}.${this.instance}.${rootId}.${key}`] === 'undefined') continue; // undesired object

            let val = result.data[key];
            if (STATES_CFG[key].cvt && typeof val === 'string') {
                const match = result.data[key].match(STATES_CFG[key].cvt);
                if (match) {
                    val = match.groups.val;
                } else {
                    this.log.debug(`[station] unexpected data format for ${key} - ${val}`);
                }
            }
            if (STATES_CFG[key].type === 'number') val = Number(val);
            await this.setStateAsync(`${rootId}.${key}`, { val: val, ack: true, q: 0x00 });
        }
    }

    /**
     * initObject - create or reconfigure single object
     *
     *		creates object if it does not exist
     *		overrides object data otherwise
     *
     * @param {obj}     pObj    objectstructure
     * @return
     *
     */
    async initObject(pObj) {
        this.log.debug(`initobject [${pObj._id}]`);

        const fullId = `${this.name}.${this.instance}.${pObj._id}`;

        if (typeof STATEs[fullId] === 'undefined') {
            try {
                this.log.debug('creating obj "' + pObj._id + '" with type ' + pObj.type);
                await this.setObjectNotExistsAsync(pObj._id, pObj);
                await this.extendObjectAsync(pObj._id, pObj);
                STATEs[fullId] = 'X';
            } catch (e) {
                this.log.error('error initializing obj "' + pObj._id + '" ' + e.message);
            }
        }
    }

    /**
     * initStateObject - create or reconfigure single state object
     *
     *		creates object if it does not exist
     *		overrides object data otherwise
     *
     * @param    {string}    pId    object id
     * @param    {obj}       pObj   configuration object
     * @return
     *
     */
    async initStateObject(pId, pObj) {
        this.log.debug(`initStateobject (${pId})`);

        if (!pObj.type) return;
        await this.initObject({
            _id: pId,
            type: 'state',
            common: {
                name: pObj.name,
                desc: translib.getTranslations(pObj.desc),
                write: false,
                read: true,
                type: pObj.type,
                role: pObj.role,
                unit: pObj.unit,
            },
            native: {},
        });
    }

    /**
     * resetStateObjects - reset state existing objects
     *
     * @return
     *
     */
    async resetStateObjects() {
        this.log.debug(`resetStateobjects`);

        await iobStates.setStatesAsync('*', { ack: true, q: 0x02 });
        await iobStates.setStatesAsync('*.info.online', { val: false, ack: true, q: 0x00 });
        await iobStates.setStatesAsync('*.info.error', { val: false, ack: true, q: 0x00 });
    }
} /* end of adapter class */

// ---------------------------------------------------------------------------------------------------------------------

/**
 * module export / startup
 */

console.log('DEBUG  : envertech_pv adapter initializing (' + process.argv + ') ...'); //logger not yet initialized

/*
if (process.argv) {
    for (let a = 1; a < process.argv.length; a++) {
        if (process.argv[a] === '--install') {
            doInstall = true;
            process.on('exit', function () {
                if (!didInstall) {
                    console.log('WARNING: migration of config skipped - ioBroker might be stopped');
                }
            });
        }
    }
}
*/

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
