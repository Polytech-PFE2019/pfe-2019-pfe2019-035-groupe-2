var ACMElement = require("./ACMElement.js");

class Link extends ACMElement {
    constructor(id, name, x, y, from, to, port = 0, virtual=false) {
        super(id, name,x,y);
        this.from = from;
        this.to = to;
        this.port = port;
        this.virtual = virtual;
    }
    
}

module.exports = Link;
