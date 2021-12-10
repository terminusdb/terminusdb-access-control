 //The following code example uses the AccessControl class 
 //to manage users access control to Organizations and databases

/* Import terminusdb-client */
const TerminusClient = require("@terminusdb/terminusdb-client")
const AccessControl = require("./AccessControl")

/*Import the list of allowed actions */
const {ACTIONS} = require("./documentTemplate")

/*We are using TerminusDB for Authorization 
so we'll create all the User with a NO_KEY*/
const NO_KEY = "NO_KEY"

/*TerminusDB server host url*/
const serverHost ="http://localhost:6363"
//Initialize the Terminusdb Client with the admin's credentials. Only the global admin can create Organizations and Users 
const client = new TerminusClient.WOQLClient(serverHost, {user:"admin",key:"root"})
const accessControl = new AccessControl(client)

/*
* roles name
*/
const adminRole = "Role/admin"
const customRole =  "Role/reader"


// Roles are sets of actions (permissions) that you can use to grant or restrict access to specific resource and operations.
// Only the global admin can create Roles
async function createCustomRole(){
    const label = "reader Role"
    try{
        const actions = [ACTIONS.SCHEMA_READ_ACCESS,
                         ACTIONS.COMMIT_READ_ACCESS,
                         ACTIONS.CLASS_FRAME,
                         ACTIONS.META_READ_ACCESS]
        const result = await accessControl.createRole(customRole,label,actions)
    }catch(err){
        const errorType = err.data && err.data["api:error"] ? err.data["api:error"]["@type"] : null
        if(errorType !== 'api:DocumentIdAlreadyExists'){
            throw err
        }
        console.log(`The Document ${customRole} already exists`)
    }
}


// The databases are create under an Organization. By linking a User to an Organization (capability), the User has access to all the Databases under this Organization

// The list of all the users, organizations and databases that we are going to create
const user__01 = "User__01"
const team__01 = "Team__01"

const user__02 = "User__02"
const user__03 = "User__03"

const team__02 = "Team__02"
const team__03 = "Team__03"

const db__01 = "Database__01"
const db__02 = "Database__02"


//The database administrator (admin) can create such capability-role that lets another user to access a specific resource

// A capability is a connection between Role and Resource (organizations or batabases) 
async function createUsersAndTeams(){
        /*
        *Create the new Organization Team__01 and the User User__01 with Role/admin to access this Organization
        *this means that the user has admin level of access over this Organization 
        *and the databases controlled by the organization.
        *We are creating the User with NO_KEY, 
        *we are using TerminusDB for authorization.
        */
        await accessControl.createUserAndOrganization(team__01,user__01,adminRole)
        
        /*Create another Organization for the User User__01 with Role/admin*/
        await accessControl.createOrganization(team__03,user__01,adminRole)

        /*Add a new User user__02, assign the custom role Role/reader to access the Organization resource Team__01*/
        await accessControl.addNewUserToOrganization(team__01,user__02,customRole)
       
        /*Create the new Organization Team__02 and the User User__03 with Role/admin to access this Organization*/
        await accessControl.createUserAndOrganization(team__02,user__03,adminRole)

        /*assign the custom role (Role/reader) to the User User__03 over the Organization Team__01*/
        await accessControl.addExistsUserToOrganization(team__01,user__03,customRole)

        

}


//Create a new TerminusDB client instance for the User__01 with NO_KEY setting. 
//We assuming that the User is already logged in the system, the identity of the User is verified,
//so we don't need to verify this again in TerminusDB.
//The User can create a database under an Organization only if he has a Role that allow to "create_database"

async function createDB(){
          const clientTeam01 = new TerminusClient.WOQLClient(serverHost, {user:user__01,key:NO_KEY,organization:team__01})
          await clientTeam01.createDatabase(db__01, {label: db__01 , comment: "add db", schema: true}) 
          await clientTeam01.createDatabase(db__02, {label: db__02 , comment: "add db", schema: true}) 
}


async function deleteDatabase (db){
    try{
        const clientTeam01 = new TerminusClient.WOQLClient(serverHost, {user:user__01,key:NO_KEY,organization:team__01})
        await clientTeam01.deleteDatabase(db)
    }catch(err){
        console.log(`the database ${db} doesn't exists`)
    }
}
/*
* this is only for test purpose
* You must be very careful when you remove database, Organization/team and users
* the Organization have to be not related with nothing or you can not delete it.
* you have to remove all the databases before and all the users access Roles
*/
async function deleteUsersAndTeamsIfExists(){
    try{
        /*With this operation the Userstill exists is only not related with the Organization any more*/
        await accessControl.deleteUserFromOrg(team__01,user__02)
        await accessControl.deleteUserFromOrg(team__01,user__03)

        /*Important delete the databases before the Admin User 
        If no Admin user is related with the Organization 
        you can not remove the databases (you'll get an incorrect authorization error)*/
        await deleteDatabase(db__01)
        
        /*if a capability connect an user with an database,
        you have to remove the capability before the database*/
        await accessControl.deleteDatabaseRole(team__01,user__03,db__02)
        await deleteDatabase(db__02)       
        
        /*I remove the relationship between the Team__01 and the User__01*/
        await accessControl.deleteUserFromOrg(team__01,user__01)
        /*Now that the Organization is not related with nothing I can delete it*/
        await accessControl.deleteOrganization(team__01)

        await accessControl.deleteUserFromOrg(team__03,user__01)
        await accessControl.deleteOrganization(team__03)

        await accessControl.deleteUserFromOrg(team__02,user__03)
        await accessControl.deleteOrganization(team__02)

        /*The user has NO capability on any resource, so you can remove it*/
        await accessControl.deleteUser(user__01)
        await accessControl.deleteUser(user__02)
        await accessControl.deleteUser(user__03)
    }catch(err){
        console.log(err.message)
    }
}


async function run (){
    /*create a custom role*/
    try{
        await createCustomRole()
        console.log("Created the custom role reader ......")
        console.log("...............")
        /*create all the users and teams*/
        await createUsersAndTeams()
        console.log("Created Organizations and Users ......")
        console.log("................")

        await createDB()
        console.log("Created Databases ......")
        console.log("................")

        /*see the Team's Users Role*/
        const teamCapabilities = await accessControl.getListUserRoles(team__01)
        console.log("the Team__01 Users Role")
        console.log( JSON.stringify(teamCapabilities,null,4))
        console.log(".....................")

        /*get all the database under this Organization*/
        const dbList = await accessControl.getDatabaseList(team__01)
        console.log("Team__01 databases")
        console.log(JSON.stringify(dbList,null,4))
        console.log(".....................")
        
        //the User has a role access level for the Organization and all the databases under this Organization
        //the system administrator (admin) can assign to a User a different role for a specific database
        //the role at database level works only if it is a higher role than the Organization access level
        await accessControl.createDatabaseRole(team__01,user__03,db__02,adminRole)
        /*return the User roles at database level if setted*/
        const databaseCap= await accessControl.getUserDatabasesRoles(user__03)
        console.log("The User__03 database Roles")
        console.log(JSON.stringify(databaseCap,null,4))

    }catch(err){
        const data = err.data || {}
        console.log(err.message)
        if(data.message)console.log(data.message)
    }
}

/*if you need to delete a User or an Organization look at this function*/
async function deleteall(){
    await deleteUsersAndTeamsIfExists()
}
run()


