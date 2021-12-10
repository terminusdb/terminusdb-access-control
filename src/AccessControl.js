/**
 * @module AccessControl
 */
const {WOQLClient} = require("@terminusdb/terminusdb-client");
const UTILS = require("./documentTemplate")

/**
 * the AccessControl Class to manage users 
 */
class AccessControl {
    /**
     * 
     * @constructor
     * @param {WOQLClient} client - terminusDB client
     * @example 
     * const client = new WOQLClient("http://localhost:6363", {user:"admin",key:"root"})
     * const accessControl = new AccessControl(client)
     * async function newRole (){
     *  await accessControl.createRole("Role/myrole", "myrole" ,[ACTIONS.SCHEMA_READ_ACCESS,
     *                                                    ACTIONS.COMMIT_READ_ACCESS, 
     *                                                    ACTIONS.CLASS_FRAME,
     *                                                    ACTIONS.META_READ_ACCESS])
     * }  
     */
    constructor(client) {
        this.client=client.copy()
        this.client.setSystemDb();      
    }
    
    /**
     * Create a new Role into the system database.
     * 
     * Roles are sets of actions (permissions) that you can use to grant 
     * or restrict access to specific resource and operations.
     * Only the global admin can create Role
     * @param {string} name 
     * @param {string} label 
     * @param {array} actions - array of ACTIONS
     * @returns {Promise}
     */
    createRole (name,label,actions){
        const role = UTILS.docRole(name,label,actions)
        return this.client.addDocument(role)
    }

    /**
     * Create a new User and a new Organization and manage access.
     * @param {string} orgName  - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} userRoleId  - the id of the Role in the system database, example "Role/admin" 
     * @param {string} [key] - the Userpassword for base authentication, 
     *                         if the authentication is made with another system you can pass the NO_KEY   
     * @returns {Promise}
     */
    
    async createUserAndOrganization(orgName,userName,userRoleId,key="NO_KEY"){
        const createOrgCapability= UTILS.docOrganizationAndCapability(orgName,userRoleId)
        const createNewUser = UTILS.docUser(userName,createOrgCapability)
       // console.log(JSON.stringify(createNewUser,null,4))
        await this.client.addDocument(createNewUser,null,null,`create new user ${userName}`) 
        return this.__userUtils(userName,key)
        
    }

    __userUtils(userName,pass){
        const url = this.client.connectionConfig.userURL(userName)  
        return this.client.dispatch("POST", url, {agent_name:userName,password:pass})
    }

    /**
     * Create a new user,  add the Userto an Organization and manage user access
     * @param {string} orgName  - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} userRoleId - the id of the Role in the system database, example "Role/admin" 
     * @param {string} [key] - the Userpassword for base authentication, 
     *                         if the authentication is made with another system you can pass the NO_KEY   
     * @returns {Promise}
     */
    async addNewUserToOrganization(orgName,userName,userRoleId,key="NO_KEY"){
        const org= UTILS.elementID("Organization",orgName)
        const createOrgCapability = UTILS.docCapability(org,userRoleId)
        const createNewUser = UTILS.docUser(userName,createOrgCapability)
        //console.log(JSON.stringify(createNewUser,null,4))

        await  this.client.addDocument(createNewUser,null,null,`create new user ${userName}`)
        return this.__userUtils(userName,key)
    }
   
    /**
     * Create a new Organization, add the Userto an Organization and manage user access
     * @param {string} orgName - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} userRoleId - the id of the Role in the system database, example "Role/admin" 
     * @returns {Promise}
     */

    async createOrganization(orgName,userName,userRoleId){
        const createOrgCapability= UTILS.docOrganizationAndCapability(orgName,userRoleId)
        const user= UTILS.elementID("User",userName)
        const userDoc = await this.client.getDocument({id:user})
        if(userDoc && !userDoc['capability']){
          userDoc['capability'] = []
        }
        userDoc['capability'].push(createOrgCapability)

        //console.log(createOrgCapability)
        
        return this.client.updateDocument(userDoc,null,null,`user ${userName} creates the ${orgName} team`) 
    }

    /**
     * Add an user to an Organization and manage user access
     * @param {string} orgName - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} userRoleId - the id of the Role in the system database, example "Role/admin" 
     * @returns {Promise}
     */

    async addExistsUserToOrganization(orgName,userName,userRoleId){
        const org= UTILS.elementID("Organization",orgName)
        const user= UTILS.elementID("User",userName)
        const query = UTILS.getCapability(org,user)
        const result =  await this.client.query(query) 
        if(Array.isArray(result.bindings) && result.bindings.length>0){
            throw new Error(`the capability beetween ${org} and ${user} already exists`)
        }
        const createOrgCapability = UTILS.docCapability(org,userRoleId)
        const userDoc = await this.client.getDocument({id:user}) 
        if(userDoc && !userDoc['capability']){
            userDoc['capability'] = []
        }
    
        userDoc['capability'].push(createOrgCapability)
        //console.log(JSON.stringify(userDoc,null,4))
        return this.client.updateDocument(userDoc,null,null,`user ${userName} added to the ${orgName} team`) 
    }

    /**
     * Manage user access to a resource (Organization or database)
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} resourceId - the is of the resource inside the system database, like Organization/TeamName
     * @param {string} userRoleId - the id of the Role in the system database, example "Role/admin" 
     * @returns {Promise}
     */
    async createUserCapability(userName,resourceId,userRoleId){
        const user= UTILS.elementID("User",userName) 
        const createCapability = UTILS.docCapability(resourceId,userRoleId)
        const userDoc = await this.client.getDocument({id:user}) 
        if(userDoc && !userDoc['capability']){
            userDoc['capability'] = []
        }    
        userDoc['capability'].push(createCapability)
        return this.client.updateDocument(userDoc,null,null,`add user capability`) 
    }


    /** 
    * Remove the Userfrom an Organization
    * @param {string} orgName - the Organization/team name
    * @param {string} userName - the Username (what you need to identify your user) 
    * @returns {Promise}
    */

    async deleteUserFromOrg(orgName,userName){
        const org= UTILS.elementID("Organization",orgName)
        const user= UTILS.elementID("User",userName)

        const query = UTILS.getCapability(org,user)
        const result = await this.client.query(query)
        //if the capability exists I remove it 
        if(result && Array.isArray(result.bindings) && result.bindings.length>0){
            const capabilityFullID = result.bindings[0].capability;
            const capabilityId = capabilityFullID.substr(capabilityFullID.indexOf("Capability"))
            return this.client.deleteDocument({id:capabilityId})
        }
        //this is the point where throw an error if you need it
        console.log(`Error no connection from ${org} and ${user}`)
    }

    /**
     * Manage user access to a database. 
     * You can use this to grant an higher access (higher than Organization user's role) to a specific database.
     * @param {string} orgName - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} dbName -  the database name 
     * @param {string} userRoleId - the id of the Role in the system database, example "Role/admin" 
     * @return promise 
     */
     async createDatabaseRole(orgName,userName,dbName,userRoleId){
        const org= UTILS.elementID("Organization",orgName)
        //get the database id given the name and the Organization
        const query = UTILS.getDatabaseId(org,dbName)
        const result = await this.client.query(query)

        if(result && Array.isArray(result.bindings) && result.bindings.length>0){
            const dbId= result.bindings[0]["database"]
            return this.createUserCapability(userName,dbId,userRoleId)
        }
    }

    /**
     * Remove a capability (access role) that connect a User with a database
     * @param {string} orgName - the Organization/team name
     * @param {string} userName - the Username (what you need to identify your user) 
     * @param {string} dbName -  the database name 
     * @returns {Promise}
     */
    async deleteDatabaseRole(orgName,userName,dbName){
        const org= UTILS.elementID("Organization",orgName)
        const user= UTILS.elementID("User",userName)

        const query = UTILS.getDatabaseCapability(org,user,dbName)
        const result = await this.client.query(query)
        if(result && Array.isArray(result.bindings) && result.bindings.length>0){
            const capabilityId = result.bindings[0].capability;
            return this.client.deleteDocument({id:capabilityId})
        }
        //this is the point where throw an error if you need it
        console.log(`Error no connection from ${org} , ${user} and ${dbName} database`)
    }

    /**
     * To delete a specific capability/role  
     * @param {string} capId - the capability Id like save in the system database (Capability/......)
     * @returns {Promise}
     */
    deleteCapability(capId){
        return this.client.deleteDocument({id:capId})
    }

    /**
     * Get capability/role list that connect the Userwith databases
     * @param {string} userName - the Username (what you need to identify your user) 
     * @returns {Promise}
     */
    getUserDatabasesRoles(userName){
        const user= UTILS.elementID("User",userName)
        const query = UTILS.getDatabasesUserCapabilities(user)
        return  this.client.query(query)
    }

    /**
     * Given an Organization, get the list of user roles
     * @param {string} orgName - the Organization/team name
     * @returns {Promise}
     */
    getListUserRoles(orgName){
        const org= UTILS.elementID("Organization",orgName)
        const query = UTILS.getCapabilitiesScopeTeam(org)
        return this.client.query(query)        
    }


    /**
     * Get the Organization's database list
     * @param {string} orgName - the Organization/team name
     * @returns {Promise}
     */
    getDatabaseList(orgName){
        const org= UTILS.elementID("Organization",orgName)
        const query = UTILS.getDatabasesTeam(org)
        return this.client.query(query)   
    }

    /**
     * Delete an Organization
     * You must be very careful when you remove database, Organization/team and users
     * the Organization have to be not related with nothing or you can not delete it   
     * if you have databases under your Organization, you have to remove the databases before
     * @param {string} orgName - the Organization/team name
     * @returns {Promise}
     */

    async deleteOrganization(orgName){
        try{
            const org= UTILS.elementID("Organization",orgName)
            const orgDoc = await this.client.getDocument({id:org}) 
            /*
            * using the document interface the database doesn't check if there are databases related with the Organization
            * we have to check and delete before the Organization and the Admin user
            */
            if(orgDoc && Array.isArray(orgDoc['database'])){
                throw new Error("There are database related with the Organization")
            }
            await this.client.deleteDocument({id:org})
        }catch(err){//           
            const errorType = err.data && err.data["api:error"] ? err.data["api:error"]["@type"] : null
            if(errorType !== 'api:DocumentNotFound'){
                throw err
            }
            console.log(`I can not delete ${orgName}, the Organization does not exist`)
        } 
    }

    /**
     * Delete a User
     * Remove all the user's capability-role before remove it   
     * @param {string} userName - the userName
     * @returns {Promise}
     * @example
     * async function removeUser(accessControl){
     *      await accessControl.deleteUserFromOrg(myteam,myuser)
     *      //if the Userhas capability-role at database level
     *      await accessControl.deleteDatabaseRole(myteam,myuser,mydb)
     *      await accessControl.deleteUser(myuser)
     *}
     */

    async deleteUser(userName){
        try{
            const user= UTILS.elementID("User",userName)
            await this.client.deleteDocument({id:user}) 
        }catch(err){
            const errorType = err.data && err.data["api:error"] ? err.data["api:error"]["@type"] : null
            if(errorType !== 'api:DocumentNotFound'){
                throw err
            }
            console.log(`I can not delete ${userName}, the User does not exist`)
 
        }       
    }

    /**
     * Get all the roles available in the system database
     * @returns {Promise}
     */
    getSystemRolesType (){
        return  this.client.getDocument({type:"Role",as_list:true}) 
    };

    /**
     * Get the system database schema
     * @returns {Promise}
     */
    getSystemDBSchema (){
        return  this.client.getDocument({graph_type:"schema",as_list:true}) 
    }

}

module.exports = AccessControl