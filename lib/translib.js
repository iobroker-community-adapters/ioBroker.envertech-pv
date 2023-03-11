/**
 *  translib.js - iob  trannslation support library
 *
 *		copyright McM1957 2023, MIT
 *
 */
// @ts-ignore
global.systemDictionary = {};

class iobTranslator {
    constructor() {
        this.adapter = null;
        this.words = null;
    }

    init(pAdapter) {
        this.adapter = pAdapter;
        require(`${this.adapter.adapterDir}/admin/words.js`);
    }

    translate(pKey, pLang, _arg1, _arg2, _arg3, _arg4, _arg5) {
        if (global.systemDictionary && global.systemDictionary[pKey] && global.systemDictionary[pKey][pLang]) {
            return global.systemDictionary[pKey][pLang]
                .replace('%1', _arg1 || '')
                .replace('%2', _arg2 || '')
                .replace('%3', _arg3 || '')
                .replace('%4', _arg4 || '')
                .replace('%5', _arg5 || '');
        }
        return pKey;
    }

    getTranslations(pKey) {
        if (global.systemDictionary && global.systemDictionary[pKey]) return global.systemDictionary[pKey];
        return pKey;
    }
}

module.exports = new iobTranslator();
