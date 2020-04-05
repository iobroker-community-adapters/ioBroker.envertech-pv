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
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }


    async onReady() {
        const self = this;
        this.log.info('Loading envertech-pv');
        //this.log.info('config station_id: ' + this.config.station_id);

            request(
                    {   method: 'POST',
                        url: 'https://www.envertecportal.com/ApiInverters/QueryTerminalReal?page=1&perPage=20&orderBy=GATEWAYSN&whereCondition=%7B%22STATIONID%22%3A%22' +this.config.station_id+ '%22%7D',
                        json: true,
                        time: true,
                        timeout: 4500
                    },
                    (error, response, content) => {
                        self.log.info('request done');

                        if (response) {
                            //self.log.info('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                            if (!error && response.statusCode == 200) {
                                self.log.info('alles ok');

                            for (var key in content.Data.QueryResults){
                                const obj = content.Data.QueryResults[key];
                                const ordner = obj["SNALIAS"].replace(/\ /g, '-');

                                self.setObjectNotExists(ordner, {
                                        type: 'state',
                                            common: {
                                                name: ordner,
                                                type: 'string',
                                                role: 'value',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                    });
                                self.setState(ordner, {val: null, ack: true});

                                    for (var [key, value] of Object.entries(obj)) {

                                        self.setObjectNotExists(ordner+"."+key, {
                                        type: 'state',
                                            common: {
                                                name: ordner+"."+key,
                                                type: 'string',
                                                role: 'value',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                        });
                                    self.setState(ordner+"."+key, {val: value, ack: true});
                                    };
                            };
                           
                            };
                        } else if (error) {
                            self.log.info(error);
                        }
                    }

                );


        setTimeout(this.stop.bind(this), 10000);
        
    };



    onUnload(callback) {
        try {
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