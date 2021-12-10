exports.addAnchor = function(options) {
    if (this.kind === 'constructor') return false
    return true
}

exports.addSigName = function(options) {
    if (this.kind === 'group') return false
    return true
}

exports.makeAnchor = function(anchorName) {
    //module_AccessControl..AccessControl+createOrganization
    if (typeof anchorName === 'string') {
        const str = anchorName.substr(anchorName.indexOf("+")+1).toLowerCase()
        return str
    }
    return anchorName
}

