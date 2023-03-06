/**
 *  jslib.js - javascript utility library
 *
 *		copyright McM1957 2023, MIT
 *
 */

/**
 * isObject - Tests whether the given variable is a real object and not an Array
 *
 * @param   {any}       pObj    the variable to test
 * @returns {boolean}   true    if object is really an object
 */
function isObject(pObj) {
    // This is necessary because:
    // typeof null === 'object'
    // typeof [] === 'object'
    // [] instanceof Object === true
    return Object.prototype.toString.call(pObj) === '[object Object]';
}

/**
 * isArray - tests whether the given variable is really an Array
 *
 * @param   {any}       pObj    the variable to test
 * @returns {boolean}   true    if object is really an array
 */
function isArray(pObj) {
    if (typeof Array.isArray === 'function') return Array.isArray(pObj);
    return Object.prototype.toString.call(pObj) === '[object Array]';
}

/**
 * sleep - delay execution for a specified amount of time
 *
 * @param   {number}    pTime     delay time in ms
 * @returns nothing
 */
async function sleep(pTime) {
    if (pTime < 1) return;
    return new Promise((resolve) => setTimeout(resolve, pTime));
}

module.exports = {
    isArray,
    isObject,
    sleep,
};
