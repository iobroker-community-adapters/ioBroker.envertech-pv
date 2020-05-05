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
        var pow1 = 0;
		var gat = 0;
        this.log.info('Loading envertech-pv');
        if (this.config.station_id){

        	self.setObjectNotExists("data.info.last-data-received", {
                                        type: 'state',
                                            common: {
                                                name: "last-data-received",
                                                type: 'string',
                                                role: 'value',
                                                def:  'no data received',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                    });

        	self.setObjectNotExists("data.info.last-data-error", {
                                        type: 'state',
                                            common: {
                                                name: "last-data-error",
                                                type: 'string',
                                                role: 'value',
                                                def:  'no error',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                    });
        	self.setObjectNotExists("data.info.last-error-code", {
                                        type: 'state',
                                            common: {
                                                name: "last-error-code",
                                                type: 'string',
                                                role: 'value',
                                                def:  'no error',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                    });

        	self.setObjectNotExists("overview.info.last-data-received", {
                                        type: 'state',
                                            common: {
                                                name: "last-data-received",
                                                type: 'string',
                                                role: 'value',
                                                def:  'no data received',
                                                read: true,
                                                write: false
                                            },
                                        native: {}
                                    });

        	request(
                {   method: 'POST',
                    url: 'https://www.envertecportal.com/ApiStations/getStationInfo?stationId=' +this.config.station_id,
                    json: true,
                    time: true,
                    timeout: 4500
                },

                (error, response, content) => {
                    self.log.info('request station done');

                    if (response) {
                    	if (!error && response.statusCode == 200) {
                                self.log.info('station data ok');
						    for (var key in content.Data){
		                        const obj = content.Data[key];
		                        //self.log.info(key);
		                        //self.log.info(obj);
		                         let unit = null;


			                        self.setObjectNotExists("overview.station."+key, {
			                        type: 'state',
			                            common: {
			                                name: key,
			                                type: 'string',
			                                role: 'value',
			                                read: true,
			                                write: false
			                            },
			                        native: {}
			                        });
			                    	self.setState("overview.station."+key, {val: obj, ack: true});
						}	
			            //self.log.info('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                        var datum_string = new Date().toLocaleString();
	                    self.setState("overview.info.last-data-received", {val: datum_string, ack: true});
		            	}

                    } 	else if (error) {
	                    	self.log.error(error);
                      	}

                }
			);


            request(
                    {   method: 'POST',
                        url: 'https://www.envertecportal.com/ApiInverters/QueryTerminalReal?page=1&perPage=20&orderBy=GATEWAYSN&whereCondition=%7B%22STATIONID%22%3A%22' +this.config.station_id+ '%22%7D',
                        json: true,
                        time: true,
                        timeout: 4500
                    },
                    (error, response, content) => {
                        self.log.info('request data done');

                        if (response) {
                            //self.log.info('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                            if (!error && response.statusCode == 200) {
                                self.log.info('data ok');
                                const unitList = {
					                DCVOLTAGE: 'V',
					                ACVOLTAGE: 'V',
					                POWER: 'watt',
					                FREQUENCY: 'Hz',
					                DAYENERGY: 'kWh',
					                ENERGY: 'kWh',
					                TEMPERATURE: '°C',
					            };

	                            for (var key in content.Data.QueryResults){
	                                const obj = content.Data.QueryResults[key];
	                                const gateway = obj["GATEWAYSN"].replace(/\ /g, '-');
	                                const alias = obj["SNALIAS"].replace(/\ /g, '-');

	                                    for (var [key, value] of Object.entries(obj)) {
	                                    	//self.log.info(gateway);
	                                    	//self.log.info(gat);
	                                    	if (gat == 0 || gat == gateway){
			                                    gat = gateway;
			                                    if (key == "DAYENERGY"){
			                                    		var x = parseFloat(value);
			                                    		//self.log.info(x);
			                                    		pow1 += x;
			                                    		//self.log.info(pow1);
			                                    	};
			                                }else {
			                                	//self.log.info(pow1);
			                                	//self.log.info(gateway);

		                                        self.setObjectNotExists("data.gateway_"+gat+".info.gateway_day_energy", {
			                                        type: 'state',
			                                            common: {
			                                                name: "gateway_day_energy",
			                                                type: 'string',
			                                                role: 'value',
			                                                unit: 'kWh',
			                                                read: true,
			                                                write: false
			                                            },
			                                        native: {}
		                                        });
		                                    	self.setState("data.gateway_"+gat+".info.gateway_day_energy", {val: pow1.toFixed(3), ack: true});
	                                   


			                                	//self.log.info("else");
			                                	pow1 = 0;
			                                	//self.log.info(pow1);
			                                	if (key == "DAYENERGY"){
			                                    		var x = parseFloat(value);
			                                    		//self.log.info(x);
			                                    		pow1 += x;
			                                    		//self.log.info(pow1);
			                                    	};
			                                    gat = gateway;

			                                };


			                                let unit = null;
    
                                            if (Object.prototype.hasOwnProperty.call(unitList, key)) {
                                                unit = unitList[key];
                                            }

		                                    	
	                                    	


	                                        self.setObjectNotExists("data.gateway_"+gateway+"."+alias+"."+key, {
	                                        type: 'state',
	                                            common: {
	                                                name: alias+"."+key,
	                                                type: 'string',
	                                                role: 'value',
	                                                unit: unit,
	                                                read: true,
	                                                write: false
	                                            },
	                                        native: {}
	                                        });
	                                    self.setState("data.gateway_"+gateway+"."+alias+"."+key, {val: value, ack: true});
	                                    };

	                            };
	                            //self.log.info(pow1);
	                            //self.log.info(gat);
								self.setObjectNotExists("data.gateway_"+gat+".info.gateway_day_energy", {
                                    type: 'state',
                                        common: {
                                            name: "gateway_day_energy",
                                            type: 'string',
                                            role: 'value',
                                            unit: 'kWh',
                                            read: true,
                                            write: false
                                        },
                                    native: {}
                                });
                            	self.setState("data.gateway_"+gat+".info.gateway_day_energy", {val: pow1.toFixed(3), ack: true});


	                            
	                            var datum_string = new Date().toLocaleString();
	                            self.setState("data.info.last-data-received", {val: datum_string, ack: true});
                           
                            };
                        } else if (error) {
                        	var datum_string = new Date().toLocaleString();
                        	self.setState("data.info.last-data-error", {val: datum_string, ack: true});
                        	self.setState("data.info.last-error-code", {val: error.toString(), ack: true});
                            self.log.error(error);
                        }
                    }

                )
        }	else {
         		self.log.error("Station_id Error");
         	}

        

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

