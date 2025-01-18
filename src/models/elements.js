class Element {
    constructor(name, type = 'basic') {
        this.name = name;
        this.type = type;
        this.id = Math.random().toString(36).substring(7);
        this.discovered = type === 'basic';
    }
}

module.exports = Element;