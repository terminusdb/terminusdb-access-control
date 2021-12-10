<a id="module_accesscontrol" class="anchor"></a>

## AccessControl
<a id="module_accesscontrol..accesscontrol" class="anchor"></a>

### AccessControl~AccessControl
the AccessControl Class to manage users

<a id="new_module_accesscontrol..accesscontrol_new" class="anchor"></a>

#### new AccessControl(client)

| Param | Type | Description |
| --- | --- | --- |
| client | <code>WOQLClient</code> | terminusDB client |

**Example**  
```js
const client = new WOQLClient("http://localhost:6363", {user:"admin",key:"root"})
const accessControl = new AccessControl(client)
async function newRole (){
 await accessControl.createRole("Role/myrole", "myrole" ,[ACTIONS.SCHEMA_READ_ACCESS,
                                                   ACTIONS.COMMIT_READ_ACCESS, 
                                                   ACTIONS.CLASS_FRAME,
                                                   ACTIONS.META_READ_ACCESS])
}  
```
<a id="createrole" class="anchor"></a>

#### accessControl.createRole(name, label, actions) ⇒ <code>Promise</code>
Create a new Role into the system database.

Roles are sets of actions (permissions) that you can use to grant 
or restrict access to specific resource and operations.
Only the global admin can create Role


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> |  |
| label | <code>string</code> |  |
| actions | <code>array</code> | array of ACTIONS |

<a id="createuserandorganization" class="anchor"></a>

#### accessControl.createUserAndOrganization(orgName, userName, userRoleId, [key]) ⇒ <code>Promise</code>
Create a new User and a new Organization and manage access.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| orgName | <code>string</code> |  | the Organization/team name |
| userName | <code>string</code> |  | the Username (what you need to identify your user) |
| userRoleId | <code>string</code> |  | the id of the Role in the system database, example "Role/admin" |
| [key] | <code>string</code> | <code>&quot;NO_KEY&quot;</code> | the Userpassword for base authentication,                          if the authentication is made with another system you can pass the NO_KEY |

<a id="addnewusertoorganization" class="anchor"></a>

#### accessControl.addNewUserToOrganization(orgName, userName, userRoleId, [key]) ⇒ <code>Promise</code>
Create a new user,  add the Userto an Organization and manage user access


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| orgName | <code>string</code> |  | the Organization/team name |
| userName | <code>string</code> |  | the Username (what you need to identify your user) |
| userRoleId | <code>string</code> |  | the id of the Role in the system database, example "Role/admin" |
| [key] | <code>string</code> | <code>&quot;NO_KEY&quot;</code> | the Userpassword for base authentication,                          if the authentication is made with another system you can pass the NO_KEY |

<a id="createorganization" class="anchor"></a>

#### accessControl.createOrganization(orgName, userName, userRoleId) ⇒ <code>Promise</code>
Create a new Organization, add the Userto an Organization and manage user access


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |
| userName | <code>string</code> | the Username (what you need to identify your user) |
| userRoleId | <code>string</code> | the id of the Role in the system database, example "Role/admin" |

<a id="addexistsusertoorganization" class="anchor"></a>

#### accessControl.addExistsUserToOrganization(orgName, userName, userRoleId) ⇒ <code>Promise</code>
Add an user to an Organization and manage user access


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |
| userName | <code>string</code> | the Username (what you need to identify your user) |
| userRoleId | <code>string</code> | the id of the Role in the system database, example "Role/admin" |

<a id="createusercapability" class="anchor"></a>

#### accessControl.createUserCapability(userName, resourceId, userRoleId) ⇒ <code>Promise</code>
Manage user access to a resource (Organization or database)


| Param | Type | Description |
| --- | --- | --- |
| userName | <code>string</code> | the Username (what you need to identify your user) |
| resourceId | <code>string</code> | the is of the resource inside the system database, like Organization/TeamName |
| userRoleId | <code>string</code> | the id of the Role in the system database, example "Role/admin" |

<a id="deleteuserfromorg" class="anchor"></a>

#### accessControl.deleteUserFromOrg(orgName, userName) ⇒ <code>Promise</code>
Remove the Userfrom an Organization


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |
| userName | <code>string</code> | the Username (what you need to identify your user) |

<a id="createdatabaserole" class="anchor"></a>

#### accessControl.createDatabaseRole(orgName, userName, dbName, userRoleId) ⇒
Manage user access to a database. 
You can use this to grant an higher access (higher than Organization user's role) to a specific database.

**Returns**: promise  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |
| userName | <code>string</code> | the Username (what you need to identify your user) |
| dbName | <code>string</code> | the database name |
| userRoleId | <code>string</code> | the id of the Role in the system database, example "Role/admin" |

<a id="deletedatabaserole" class="anchor"></a>

#### accessControl.deleteDatabaseRole(orgName, userName, dbName) ⇒ <code>Promise</code>
Remove a capability (access role) that connect a User with a database


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |
| userName | <code>string</code> | the Username (what you need to identify your user) |
| dbName | <code>string</code> | the database name |

<a id="deletecapability" class="anchor"></a>

#### accessControl.deleteCapability(capId) ⇒ <code>Promise</code>
To delete a specific capability/role


| Param | Type | Description |
| --- | --- | --- |
| capId | <code>string</code> | the capability Id like save in the system database (Capability/......) |

<a id="getuserdatabasesroles" class="anchor"></a>

#### accessControl.getUserDatabasesRoles(userName) ⇒ <code>Promise</code>
Get capability/role list that connect the Userwith databases


| Param | Type | Description |
| --- | --- | --- |
| userName | <code>string</code> | the Username (what you need to identify your user) |

<a id="getlistuserroles" class="anchor"></a>

#### accessControl.getListUserRoles(orgName) ⇒ <code>Promise</code>
Given an Organization, get the list of user roles


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |

<a id="getdatabaselist" class="anchor"></a>

#### accessControl.getDatabaseList(orgName) ⇒ <code>Promise</code>
Get the Organization's database list


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |

<a id="deleteorganization" class="anchor"></a>

#### accessControl.deleteOrganization(orgName) ⇒ <code>Promise</code>
Delete an Organization
You must be very careful when you remove database, Organization/team and users
the Organization have to be not related with nothing or you can not delete it   
if you have databases under your Organization, you have to remove the databases before


| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | the Organization/team name |

<a id="deleteuser" class="anchor"></a>

#### accessControl.deleteUser(userName) ⇒ <code>Promise</code>
Delete a User
Remove all the user's capability-role before remove it


| Param | Type | Description |
| --- | --- | --- |
| userName | <code>string</code> | the userName |

**Example**  
```js
async function removeUser(accessControl){
     await accessControl.deleteUserFromOrg(myteam,myuser)
     //if the Userhas capability-role at database level
     await accessControl.deleteDatabaseRole(myteam,myuser,mydb)
     await accessControl.deleteUser(myuser)
}
```
<a id="getsystemrolestype" class="anchor"></a>

#### accessControl.getSystemRolesType() ⇒ <code>Promise</code>
Get all the roles available in the system database

<a id="getsystemdbschema" class="anchor"></a>

#### accessControl.getSystemDBSchema() ⇒ <code>Promise</code>
Get the system database schema

