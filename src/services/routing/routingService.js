function EndPointBuilder() {
    this.endpoint = '';  
}

/**  
 * @param {string} route
 * @returns {EndPointBuilder} 
 */
EndPointBuilder.prototype.addRoute = function(route) {
    this.endpoint += `/${route}`;
    return this; 
}

/**  
 * @param {string} param
 * @returns {EndPointBuilder}
 */
EndPointBuilder.prototype.addParam = function(param) {
    this.endpoint += `/${param}`;
    return this;
}

/**  
 * @param {string} query
 * @returns {EndPointBuilder} 
 */
EndPointBuilder.prototype.addQuery = function(query) {
    this.endpoint += `?${query}`;
    return this;
} 

/**  
 * @returns {string} 
 */
EndPointBuilder.prototype.build = function() {
    return this.endpoint;
}

export default EndPointBuilder;
  