# TerminusDB Role-Based Access Control

![Access Control](./image/accesscontrol__01_new.png)

Here the full [documentations](https://terminusdb.github.io/terminusdb-access-control/#/) 

## What is this?

In this tutorial, you will learn about the role-based access control in [TerminusDB](https://terminusdb.com). 
We are going to use the [AccessControl](https://terminusdb.com/docs/index/terminusx-db/reference-guides/javascript-client-reference/accesscontrol) driver in terminusDB-Client library to access the terminusDB system database and manage the access control for three different users. 

### What is access control?
In the process of access control, after we establish who the user is and what he can access to, we need to actively prevent that users can access anything they should not, the required security for a particular resource is enforced. At a high level, database access control is a selective restriction of access to data. It consists of two main components: authentication and authorization.

### Authentication
Authentication is a technique used to verify that someone is who they claim to be. Most of the time this verification process includes a username and a password but other methods such as token, PIN number, fingerprint scan, smart card and such are adapted as well. In order to conduct the process of authentication, it is essential that the user has an account in the system so that the authentication mechanism can interrogate that account.

### Authorization
In authorization process, it is established if the user (who is already authenticated) is allowed to have access to a resource. In other words, authorization determines what a user is and is not permitted to do. The level of authorization that is to be given to a user is determined by the user role. 

![Access Control](./image/accesscontrol__02.png)

### Role-Based Access Control in TerminusDB
TerminusDB provides mechanisms to allow users to limit the access to their resources. Role/Capability system ensures that all users may perform only the operations permitted to them.

![Access Control](./image/accesscontrol__03.png)

You need to be the database administrator to add user, organization and manage access and roles.
We start with the main concepts.

#### USER 
The database user has the capability to access a resource with a specific role.

#### Role
The roles are grouping of actions that the user can perform. (create_database etc..)
The default Roles that you can find inside terminusDB are: admin (All the actions are allowed ) and consumer.
You can create roles in the system database for different access needs. 

#### Capability
A capability is a relationship between a resource (scope) and a role (what the user can do).
A User with a capability/role is allowed to perform a set of actions over organization and database.

#### Resource
Organization/Team or Database

#### Organization/Team
Group of database

#### Database 
The databases belong to an organization and they inherit the organization User Role.
You can override this role, adding a capability/role at database level to increase the user level of access.


### Install Terminusdb  Access control

Please [clone and install TerminusDB](https://github.com/terminusdb/terminusdb-bootstrap) and have it
running.

Please clone access control tutorial

```bash
git clone https://github.com/terminusdb/terminusdb-access-control.git
cd terminusdb-access-control
$ npm install

```
Here the full code documentation [documentations](https://terminusdb.github.io/terminusdb-access-control/#/) 

Now run the example.

```bash
$ npm run dev
```