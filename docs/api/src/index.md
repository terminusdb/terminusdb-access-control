
# index.js

The following code example uses the AccessControl class in TerminusClient library
to manage users access control to Organizations and databases


```javascript
/* Import terminusdb-client */
const TerminusClient = require("@terminusdb/terminusdb-client")

/*Import the list of allowed actions */
const {ACTIONS} = TerminusClient.UTILS

/*We are using TerminusDB for Authorization 
so we'll create all the User with a NO_KEY password*/
const NO_KEY = "NO_KEY"

/*TerminusDB server host url*/
const serverHost ="http://127.0.0.1:6363"
```

Initialize the Terminusdb Client with the admin's credentials.
Only the global admin can create Teams/Organizations and Users 

```javascript
const client = new TerminusClient.WOQLClient(serverHost, {user:"admin",key:"root"})
const accessControl = new TerminusClient.AccessControl(serverHost,{user:"admin",key:"root"})

/*
* roles name
*/
const customReaderRole =  "reader"
const customWriterRole = "writer"
const customAppAdmin =  "appAdmin"
const customSchemaWriter =  "schema_writer"

const appAdminActions = [ ACTIONS.CREATE_DATABASE,
                        ACTIONS.DELETE_DATABASE,
                        ACTIONS.SCHEMA_READ_ACCESS,
                        ACTIONS.SCHEMA_WRITE_ACCESS,
                        ACTIONS.INSTANCE_READ_ACCESS,
                        ACTIONS.INSTANCE_WRITE_ACCESS,
                        ACTIONS.COMMIT_READ_ACCESS,
                        ACTIONS.COMMIT_WRITE_ACCESS,
                        ACTIONS.META_READ_ACCESS,
                        ACTIONS.META_WRITE_ACCESS,
                        ACTIONS.CLASS_FRAME,
                        ACTIONS.BRANCH,
                        ACTIONS.CLONE,
                        ACTIONS.FETCH,
                        ACTIONS.PUSH,
                        ACTIONS.REBASE]

const readerActions = [ ACTIONS.COMMIT_WRITE_ACCESS,
                        ACTIONS.SCHEMA_READ_ACCESS, 
                        ACTIONS.INSTANCE_READ_ACCESS, 
                        ACTIONS.CLASS_FRAME]

const writerActions = [ ACTIONS.COMMIT_WRITE_ACCESS,
                        ACTIONS.SCHEMA_READ_ACCESS, 
                        ACTIONS.INSTANCE_WRITE_ACCESS, 
                        ACTIONS.CLASS_FRAME]

const schemaWriterActions = [ ACTIONS.SCHEMA_WRITE_ACCESS]

```

Roles are sets of actions (permissions) that you can use to grant or restrict access to specific resource and operations.
Only the global admin can create Roles

```javascript
async function createCustomRoles(){
    try{
```

create the appAdmin role

```javascript
        const roleAppAdminId = await accessControl.createRole(customAppAdmin,appAdminActions)
        console.log(`The role ${roleAppAdminId} has been created`)
```

create the reader role

```javascript
        const roleReaderId = await accessControl.createRole(customReaderRole,readerActions)
        console.log(`The role ${roleReaderId} has been created`)
```

create the writer role

```javascript
        const roleWriterId = await accessControl.createRole(customWriterRole,writerActions)
        console.log(`The role ${roleWriterId} has been created`)
```

create the schema_writer role

```javascript
        const roleSchemaWriterId = await accessControl.createRole(customSchemaWriter,schemaWriterActions)
        console.log(`The role ${roleSchemaWriterId} has been created`)

    }catch(err){
        const errorType = err.data && err.data["api:error"] ? err.data["api:error"]["@type"] : null
        if(errorType !== 'api:DocumentIdAlreadyExists'){
            throw err
        }
        console.log(`The Document ${customRole} already exists`)
    }
}


```

The dataproducts (or databases) are create under a Team (or Organization). 
By linking a User to a Team (capability), 
the User has access to all the dataproducts under this Team

The list of all the users, teams and dataproducts that we are going to create

```javascript
const user__01 = "User__01"
const user__02 = "User__02"
const user__03 = "User__03"

const team__01 = "Team__01"
const team__02 = "Team__02"
const team__03 = "Team__03"

const db__01 = "dataproduct__01"
const db__02 = "dataproduct__02"

```

Using the admin user we are creating three different teams, 
in this moment no user is connected with this team

```javascript
async function createTeams(){
    const team_id01 = await accessControl.createOrganization(team__01)
    console.log("team__01 as been created", team_id01)
    const team_id02 = await accessControl.createOrganization(team__02)
    console.log("team__02 as been created", team_id02)
    const team_id03 = await accessControl.createOrganization(team__03)
    console.log("team__03 as been created", team_id03)
}

```

we are create the users with the same password "NO_KEY" 
we are using TerminusDB for authorization.


```javascript
async function createUsers(){
    const user_id01 = await accessControl.createUser(user__01,NO_KEY)
    console.log("user__01 as been created", user_id01)
    const user_id02 =await accessControl.createUser(user__02,NO_KEY)
    console.log("user__02 as been created", user_id02)
    const user_id03 = await accessControl.createUser(user__03,NO_KEY)
    console.log("user__01 as been created", user_id03)
}

```

The TerminusDB administrator (admin) can create such capability-role 
that lets another user to access a specific resource
A capability is a connection between Roles and Resource (teams or dataproducts) 
we are going to connect the teams with the user with the appAdmin role 
this user can create the dataproducts under the team, manage the schema insert data etc...


```javascript
async function connectTeamsWithUserAppAdminRole(){
    /* the user_01 is the appAdmin of team team__01, 
    team team__03 and the databases controlled by the team.*/
    const link01 = await accessControl.manageCapability(user__01, team__01, ["appAdmin"], "grant", "organization")
    console.log(`The user ${user__01} has been added to ${team__01} with appAdmin role, ${link01}`)
    const link03 = await accessControl.manageCapability(user__01, team__03, ["appAdmin"], "grant", "organization")
    console.log(`The user ${user__01} has been added to ${team__03} with appAdmin role, ${link03}`)

    /*the user_02 is the appAdmin of team team__02 
    and the databases controlled by the team.*/
    const link02 = await accessControl.manageCapability(user__02, team__02, ["appAdmin"], "grant",  "organization")
    console.log(`The user ${user__02} has been added to ${team__02} with appAdmin role, ${link02}`)
}


async function connectTeam01WithOtherUsers(){
    /*Connect User__02  assign the custom role Role/reader to access the team resource team__01*/
    const link04 = await accessControl.manageCapability(user__02, team__01, ["reader"], "grant","organization")
    console.log(`The user ${user__02} has been added to ${team__01} with appAdmin role, ${link04} `)

    const link05 = await accessControl.manageCapability(user__03, team__01, ["reader","writer"], "grant", "organization")
    console.log(`The user ${user__03} has been added to ${team__01} with appAdmin role, ${link05}`)
}

```

Create a new TerminusDB client instance for User__01 with NO_KEY setting. 
We assuming that the User is already logged in the system, the identity of the User is verified,
so we don't need to verify this again in TerminusDB.
The User can create a database under a team only if he has a Role that allow to "create_database"

```javascript
async function createDB(){
    const clientTeam01 = new TerminusClient.WOQLClient(serverHost, {user:user__01,key:NO_KEY,organization:team__01})
    await clientTeam01.createDatabase(db__01, {label: db__01 , comment: "add db", schema: true})
    console.log(`The dataproduct ${db__01} has been created by ${user__01}`) 
    await clientTeam01.createDatabase(db__02, {label: db__02 , comment: "add db", schema: true})  
    console.log(`The dataproduct ${db__02} has been created by ${user__01}`) 
    /* if you try to create a db without the write permission you'll get an error*/
}

```

we are testing that User__02 does not have the permission to create databases under team__01 

```javascript
async function errorCreateDatabase(){
    try{
        const clientTeamUser02 = new TerminusClient.WOQLClient(serverHost, {user:user__02,key:NO_KEY,organization:team__01})
        const accessControlUser02 = new TerminusClient.AccessControl(serverHost, {user:user__02,key:NO_KEY,organization:team__01})

        /* we can see the list of the action allowed for the connected user
        you can call this api if you are the admin user or only for yourself*/
        const roles = await accessControlUser02.getTeamUserRoles(user__02)

        console.log("user_02 roles" , JSON.stringify(roles,null, 4))
        /* this user does not have the "create_database" level of access */
        await clientTeamUser02.createDatabase("test_db", {label: "test_db" , comment: "add db", schema: true}) 
    }catch(err){
        const message = err.data ? err.data["api:message"] : err.message
        console.log("user__02 does not have permission to create databases", message)
    }
}

```

add a roles at dataproducts level. 
The user has no specific permissions at data product level, 
but each data product inherits the team access level, in this instance a reader role.
we are going to increase the permissions for the User_02 to access the dataproduct dataproduct_01
if the resource is a dataproduct we need to pass the team/dataproduct path 

```javascript
async function addCapabilityRolesForDataproduct(){
    const link06 = await accessControl.manageCapability(user__02, `${team__01}/${db__02}`, ["writer","schema_writer"], "grant","database")
    console.log(`The user ${user__02} has been added to ${team__01}/${db__02} with appAdmin role, ${link06} `)
    const accessControl01 = new TerminusClient.AccessControl(serverHost, {user:user__02,key:NO_KEY,organization:team__01})
    /* we can see that the roles for the user__02 */
    const roles = await accessControl01.getTeamUserRoles(user__02)
    console.log("user_02 roles", JSON.stringify(roles,null,4))

}

```

You must be very careful when you remove dataproduct, team and users
for removing a team you have to remove all the databse under that team and all the users 
that means revoke the capability between user and organization,
but before remove all the databases or you can not do it without user linked to the organization

```javascript
async function deleteDatabase (db){
    try{
        const clientTeam01 = new TerminusClient.WOQLClient(serverHost, {user:user__01,key:NO_KEY,organization:team__01})
        await clientTeam01.deleteDatabase(db)
        console.log(`the dataproduct ${db} has been deleted`)
    }catch(err){
        console.log(`the dataproduct ${db} doesn't exists`)
    }
}

async function deleteUsersAndTeamsIfExists(){
    try{
        /* Important delete the databases before the User with appAdmin role 
          If no appAdmin user is related with the Organization 
          you can not remove the databases*/
        await deleteDatabase(db__01) 
        await deleteDatabase(db__02) 

        /*The organization can not be removed as it is referred to by a capability. 
        We have to remove the grant of this capability to the organization before removing.
        With this operation the Users still exists is only not related with the Organization any more*/
        await accessControl.manageCapability (user__02, team__01, ["reader"], "revoke", "organization")
        console.log(`the ${user__02} has been deleted from the ${team__01}`)
        await accessControl.manageCapability (user__03, team__01, ["reader","writer"], "revoke","organization")
        console.log(`the ${user__03} has been deleted from the ${team__01}`)
        await accessControl.manageCapability (user__01, team__01, ["appAdmin"], "revoke","organization")
        console.log(`the ${user__01} has been deleted from the ${team__01}`)

        /* now I can remove the team_01 team */
        await accessControl.deleteOrganization(team__01)
        console.log(`the ${team__01} has been deleted`)
             
        await accessControl.manageCapability (user__02, team__02, ["appAdmin"], "revoke","organization")
        console.log(`the ${user__02} has been deleted from the ${team__02}`)
        await accessControl.manageCapability (user__01, team__03, ["appAdmin"], "revoke","organization")
        console.log(`the ${user__01} has been deleted from the ${team__03}`)


        await accessControl.deleteOrganization(team__02)
        console.log(`the ${team__02} has been deleted`)
        await accessControl.deleteOrganization(team__03)
        console.log(`the ${team__03} has been deleted`)

        await accessControl.deleteUser(user__01)
        console.log(`the ${user__01} has been deleted`)
        await accessControl.deleteUser(user__02)
        console.log(`the ${user__02} has been deleted`)
        await accessControl.deleteUser(user__03)
        console.log(`the ${user__03} has been deleted`)
    }catch(err){
        console.log(err.message)
    }
}

async function removeRoles (){
    await accessControl.deleteRole(customAppAdmin)
    console.log(`the ${customAppAdmin} role has been deleted`)

    await accessControl.deleteRole(customWriterRole)
    console.log(`the ${customWriterRole} role has been deleted`)

    await accessControl.deleteRole(customReaderRole)
    console.log(`the ${customReaderRole} role has been deleted`)

    await accessControl.deleteRole(customSchemaWriter)
    console.log(`the ${customSchemaWriter} role has been deleted`)
}

async function run (){
    /*create a custom role*/
    try{
        await createCustomRoles()
        console.log("the Roles have been created ......")
        console.log("...............")
        /*create all the teams*/
        await createTeams()
        console.log("the Teams have been created ......")
        console.log("................")
        /*create all the users*/
        await createUsers()
        console.log("the Users have been created ......")
        console.log("................")

        /*connest user with teams assigning specific roles*/
        await connectTeamsWithUserAppAdminRole()
        await connectTeam01WithOtherUsers()
        
        /*create dataproduct*/
        await createDB()
        console.log("the dataproducts have been created......")
        console.log("................")

        /*check permission*/
        await errorCreateDatabase()
        console.log("Demostrated- no permission for user_02 to create database......")
        console.log("................")

        /* update permission for dataproduct
        the User has a role access level for the team and all the databases under this team
        the system administrator (admin) can assign to a User a different role for a specific database
        the role at database level works only if it is a higher role than the team access level*/

        await addCapabilityRolesForDataproduct()
        console.log("the permission for a dataproduct has been granted")
        console.log("................")

        await deleteUsersAndTeamsIfExists()
        console.log("Dataproducts, teams and users elements have been deleted.....")
        console.log("................")
        
        await removeRoles()
        console.log("Roles have been deleted")
        console.log("................")
       

    }catch(err){
        const data = err.data || {}
        console.log(err.message)
        if(data.message)console.log(data.message)
    }
}

run()



```


