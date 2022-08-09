const {WOQL,UTILS} = require("@terminusdb/terminusdb-client")

/**
 * the default roles in terminusDB system database
 */
const ROLES = {admin:"Role/admin",consumer:"Role/consumer"}
/**
 * the list of the available action in the system database
 */
const ACTIONS = {"BRANCH":"branch",
          "CLASS_FRAME" : "class_frame",
          "CLONE": "clone",
          "COMMIT_READ_ACCESS" : "commit_read_access",
          "COMMIT_WRITE_ACCESS" : "commit_write_access",
          "CREATE_DATABASE": "create_database",
          "DELETE_DATABASE" :"delete_database", 
          "FETCH" : "fetch",
          "INSTANCE_READ_ACCESS" : "instance_read_access",
          "INSTANCE_WRITE_ACCESS" :  "instance_write_access",
          "MANAGE_CAPABILITIES" : "manage_capabilities",
          "META_READ_ACCESS" :  "meta_read_access",
          "META_WRITE_ACCESS" :  "meta_write_access",
          "PUSH" : "push",
          "REBASE" :  "rebase",
          "SCHEMA_READ_ACCESS" : "schema_read_access",
          "SCHEMA_WRITE_ACCESS" : "schema_write_access", 
}

/**
 * The User document json object
 * @param {string} userName - the Username (what you need to identify your user)  
 * @param {string | object} capability - the capability id or the capability object
 * @returns {object}
 */
function docUser(userName,capability){
    let jsonld = 
        {  "@type":"User",
            "name":userName,
            "key_hash": "NO_KEY",
            "capability":[capability]
        }
        return jsonld
}

/** 
 * WOQL query to get the capability id that connect a user with a resource
 * @param {string} scope - the resource id 
 * @param {string} userId 
 * @param {string} dbName 
 * @returns {WOQL}
 */

function getCapability(scope,userId){
    return  WOQL.triple(userId,"capability","v:capability")
    .triple("v:capability", "scope", scope)
    .triple("v:capability","role","v:role")
}

/** 
 * WOQL query to get the capability id that connect a user with a database
 * @param {string} teamId 
 * @param {string} userId 
 * @param {string} dbName 
 * @returns {WOQL}
 */

function getDatabaseCapability(teamId,userId,dbName){
    return  WOQL.triple(teamId, "database", "v:database")
    .triple("v:database","name","v:name").eq("v:name",WOQL.string(dbName))
    .triple("v:capability", "scope", "v:database")
    .triple(userId,"capability","v:capability")
    .triple("v:capability","role","v:role")
}

/**
 * WOQL query to get capability/role list that connect the Userwith databases
 * @param {string} userId - the Userid 
 * @returns {WOQL}
 */
function getDatabasesUserCapabilities(userId){
    return WOQL.triple("v:database","rdf:type","@schema:UserDatabase")
    .triple(userId,"capability","v:capability") 
    .triple("v:capability","scope","v:database")
    .triple("v:capability","role","v:role")
    .triple("v:database","name","v:name")
    .triple("v:team","database","v:database")
}

/** 
* WOQL query to get all the user's roles for a given team
* @param {string} teamId - the id of the team in the document  
* @returns {WOQL}
*/
function getCapabilitiesScopeTeam(teamId){
    return  WOQL.triple("v:capability", "scope", teamId)
    .triple("v:capability","role","v:role")
    .opt().triple("v:user","capability","v:capability")
    .opt().triple("v:user","name","v:name")
}

/** 
* WOQL query to get all the databases in an Organization 
* @param {string} teamId - the id of the team in the document  
* @returns {WOQL}
*/
function getDatabasesTeam(teamId){
    return  WOQL.triple(teamId, "database", "v:database")
    .triple("v:database","name","v:dbname")
}

/** 
* WOQL query to get the database document id given the name
* @param {string} teamId - the id of the team in the document  
* @param {string} dbName - the database name 
* @returns {WOQL}
*/
function getDatabaseId(teamId,dbName){
    return  WOQL.triple(teamId, "database", "v:database")
    .triple("v:database","name","v:name").eq("v:name",WOQL.string(dbName))
}

/**
 * the Organization and Capability documents json object
 * @param {string} teamName - the name of the team
 * @param {string} roleId - the role id
 * @returns {object}
 */

function docOrganizationAndCapability(teamName, roleId="Role/admin"){
    let jsonld = { 
                "@type" : "Capability",
                "scope" : { 
                            "@type" : "Organization",
                            "name" : teamName,
                            "database" : [] },
                "role" : roleId } 

    return jsonld
}

/**
 * the Capability document json object
 * @param {string} scope 
 * @param {string} role 
 * @param {string} id 
 * @returns {object}
 */

function docCapability(scope,role="Role/admin",id=null){
    let jsonld = { 
                "@type" : "Capability",
                "scope" : scope,
                "role" : role } 
    if(id)jsonld['id']=id;
    return jsonld
}

/**
 * the Role document json object
 * @param {string} id 
 * @param {string} label 
 * @param {strin} actions 
 * @returns {object}
 */
function docRole(id,label,actions){
    return {
        "@id": id,
        "@type": "Role",
        "action": actions,
        "name": label
    }
}


/**
 * Format the document id
 * @param {string} docType 
 * @param {string} docName 
 * @returns {string}
 */
function elementID(docType,docName){
    return `${docType}/${UTILS.encodeURISegment(docName)}`
}


module.exports = {docRole,
                 elementID,
                 docCapability,
                 docOrganizationAndCapability,
                 getCapabilitiesScopeTeam,
                 getCapability,
                 getDatabasesTeam,
                 getDatabaseId,
                 getDatabaseCapability,
                 getDatabasesUserCapabilities,
                 docUser,
                 ACTIONS,
                 ROLES}