/**
 *
 * envertech_pv adapter,
 *		copyright CTJaeger 2020 - 2022, MIT
 *		copyright McM1957 2023, MIT
 *
 */

// REMOVE NEXT LINE WHEN CLEANING UP CODE
// @ts-nocheck

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const Axios = require('axios');

/**
 * envertech cloud communicationclass
 */
class EnvertechCloud {
    constructor(pAdapter, pOptions) {
        this.adapter = pAdapter;
        this.url = pOptions?.url || 'https://www.envertecportal.com';

        this.cookies = null;
        //this.username = null;
        //this.password = null;
        //this.stationId = null;
        this.log = pOptions?.log || false;

        this.axios = Axios.create({
            withCredentials: true,
            timeout: (pOptions?.timeout || 30) * 1000,
        });
    }

    /**
     * login
     */
    async login(pUsername, pPassword) {
        this.adapter.log.debug(`EnvertechCloud.login ( ${pUsername}, ${pPassword})`);

        const ret = {
            status: -1,
            statustext: null,
            err: null,
            data: {},
        };

        {
            const userEnc = encodeURIComponent(pUsername);
            const pwdEnc = encodeURIComponent(pPassword);
            const url = `${this.url}/apiaccount/login?username=${userEnc}&pwd=${pwdEnc}`;
            const urlMasked = `${this.url}/apiaccount/login?username=${userEnc}&pwd=******`;
            if (this.log) this.adapter.log.info(`[REQUEST ] ${urlMasked}`);
            try {
                const resp = await this.axios.post(url, {});
                if (this.log) this.adapter.log.info(`[RESPONSE] status ${resp.status} - ${JSON.stringify(resp.data)}`);
                if (resp.status !== 200) {
                    // http error
                    ret.status = resp.status;
                    ret.statustext = resp.statustext;
                    ret.err = null;
                    return ret;
                }
                if (Number(resp.data.Status) !== 0) {
                    // application error
                    ret.status = Number(resp.data.Status);
                    ret.statustext = resp.data.Result;
                    ret.err = null;
                    return ret;
                }
                this.axios.defaults.headers.cookie = resp.headers['set-cookie'];
            } catch (err) {
                if (this.log) this.adapter.log.info(`[RESPONSE] error: ${err.toString()}}`);
                this.adapter.log.debug(`error: ${err.toString()}}`);
                ret.status = -1;
                ret.statustext = err.toString();
                ret.err = err;
                return ret;
            }
        }

        {
            const url = `${this.url}/terminal/systemoverview`;
            if (this.log) this.adapter.log.info(`[REQUEST ] ${url}`);
            try {
                const resp = await this.axios.get(url, {});
                if (this.log) this.adapter.log.info(`[RESPONSE] status ${resp.status} - ${JSON.stringify(resp.data)}`);
                if (resp.status !== 200) {
                    // http error
                    ret.status = resp.status;
                    ret.statustext = resp.statustext;
                    return ret;
                }
                // var stationId = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
                const match = resp.data.match(/var\s+stationId\s+=\s+'(?<stationId>\w+)';/);
                if (match) {
                    ret.data.stationId = match.groups.stationId;
                } else {
                    // TODO
                }
            } catch (err) {
                this.adapter.log.debug(`error: ${err.toString()}}`);
                ret.status = -1;
                ret.statustext = err.toString();
                ret.err = err;
                return ret;
            }
        }

        this.stationId = ret.data.stationId;
        this.adapter.log.debug(`station id ${this.stationId}`);
        ret.status = 0;
        ret.statustext = 'OK';
        return ret;
    }

    /**
     * getUserInfo
     */
    //async getuserInfo(pUser, pPwd) {}
    /*
        {
            const url = `${this.url}/apiaccount/GetSessionUser`;
            this.adapter.log.debug(`request: ${url}`);
            try {
                const resp = await this.axios.post(url, {});
                this.adapter.log.debug(`response: status ${resp.status} - ${JSON.stringify(resp.data)}`);
                if (resp.status !== 200) {
                    // http error
                    ret.status = resp.status;
                    ret.statustext = resp.statustext;
                    return ret;
                }
                if (Number(resp.data.Status) !== 0) {
                    // application error
                    ret.status = Number(resp.data.Status);
                    ret.statustext = resp.data.Result;
                    ret.err = null;
                    return ret;
                }
                ret.data = { stationId: resp.data.Data.ID };
            } catch (err) {
                this.adapter.log.debug(`error: ${err.toString()}}`);
                ret.status = -1;
                ret.statustext = err.toString();
                ret.err = err;
                return ret;
            }
        }
        */

    /**
     * getStationInfo
     */
    async getStationInfo(pStationId) {
        this.adapter.log.debug(`EnvertechCloud.getStationInfo (${pStationId})`);

        const ret = {
            status: -1,
            statustext: null,
            err: null,
            data: {},
        };

        try {
            const url = `${this.url}/ApiStations/getStationInfo?stationId=${pStationId}`;
            if (this.log) this.adapter.log.info(`[REQUEST ] ${url}`);
            const resp = await this.axios.post(url, {});
            if (this.log) this.adapter.log.info(`[RESPONSE] status ${resp.status} - ${JSON.stringify(resp.data)}`);
            if (resp.status !== 200) {
                // http error
                ret.status = resp.status;
                ret.statustext = resp.statustext;
                return ret;
            }
            if (Number(resp.data.Status) !== 0) {
                // application error
                ret.status = Number(resp.data.Status);
                ret.statustext = resp.data.Result;
                ret.err = null;
                return ret;
            }
            ret.status = 0; // ok
            ret.data = resp.data.Data;
        } catch (err) {
            if (this.log) this.adapter.log.info(`[RESPONSE] error: ${err.toString()}}`);
            this.adapter.log.debug(`error: ${err.toString()}}`);
            ret.status = -1;
            ret.statustext = err.toString();
            ret.err = err;
            return ret;
        }
        return ret;
    }

    /**
     * getGatewayInfo
     */
    async getGatewayInfo(pStationId, pPage) {
        this.adapter.log.debug(`EnvertechCloud.getGatewayInfo (${pStationId}, pPage)`);

        const ret = {
            status: -1,
            statustext: null,
            err: null,
            data: {},
        };

        try {
            const url = `${this.url}/ApiInverters/QueryTerminalReal?page=${pPage}&perPage=20&orderBy=GATEWAYSN&whereCondition=%7B%22STATIONID%22%3A%22${pStationId}%22%7D`;
            if (this.log) this.adapter.log.info(`[REQUEST ] ${url}`);
            const resp = await this.axios.post(url, {});
            if (this.log) this.adapter.log.info(`[RESPONSE] status ${resp.status} - ${JSON.stringify(resp.data)}`);
            if (resp.status !== 200) {
                // http error
                ret.status = resp.status;
                ret.statustext = resp.statustext;
                return ret;
            }
            if (Number(resp.data.Status) !== 0) {
                // application error
                ret.status = Number(resp.data.Status);
                ret.statustext = resp.data.Result;
                ret.err = null;
                return ret;
            }
            ret.status = 0; // ok
            ret.data = resp.data.Data;
        } catch (err) {
            if (this.log) this.adapter.log.info(`[RESPONSE] error: ${err.toString()}}`);
            this.adapter.log.debug(`error: ${err.toString()}}`);
            ret.status = -1;
            ret.statustext = err.toString();
            ret.err = err;
            return ret;
        }
        return ret;
    }
}

module.exports = EnvertechCloud;
