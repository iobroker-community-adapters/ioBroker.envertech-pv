/**
 *  translib.js - iob  trannslation support library
 *
 *		copyright McM1957 2023, MIT
 *
 */

class iobTranslator {
    constructor() {
        this.adapter = null;
        this.words = null;
    }

    init(pAdapter) {
        this.adapter = pAdapter;

        this.words = require(`${this.adapter.adapterDir}/admin/words.js`);
    }

    translate(pKey, pLang) {
        if (words[key][pLang]) return words[key][pLang];
        return pKey;
    }
}

module.exports = new iobTranslator();
