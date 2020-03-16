class ACMElement {
	constructor(id, name, x, y) {
        this.name = name;
        this.id = id;
        this.x = x;
        this.y = y;
        
	}

	toJSON() {
		var ret = this;
		ret.elementType = this.constructor.name;
		return ret;
	}

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }
}

module.exports = ACMElement;
