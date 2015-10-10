# sasapp

I'm working on it.  I promise.

# Getting Set Up

## Prerequisites

In order to get a sasapp development environment up and running, the following programs need to be installed:
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [MySQL](https://dev.mysql.com/doc/refman/5.5/en/installing.html)
* [NodeJS](https://docs.npmjs.com/getting-started/installing-node)

In the future this section should have links to tutorials for specific platforms, or better yet, a step by step guide written by a sasapp developer.

## Configuring the Environment

### Downloading sasapp

In the command line, navigate to the desired folder and clone the git repository into it.
```
$ cd <desired folder>
$ git clone https://github.com/imapersonman/sasapp.git
$ cd sasapp
```

### Configuring MySQL

If you are interfacing with MySQL through the command line:
```
$ mysql -u root -p
Enter password: <do what it says>
...
mysql> CREATE DATABASE sasapp;
mysql> use sasapp;
mysql> CREATE USER 'dev'@'localhost' IDENTIFIED BY 'devpassword';
mysql> GRANT CREATE ON sasapp.* TO 'dev'@'localhost';
mysql> GRANT ALTER ON sasapp.* TO 'dev'@'localhost';
mysql> GRANT REFERENCE ON sasapp.* TO 'dev'@'localhost';
mysql> GRANT EXECUTE ON sasapp.* TO 'dev'@'localhost';
mysql> quit
```
The above commands:

*  Created a database called 'sasapp'
* Created a user called 'dev' at 'localhost' with the password 'devpassword'.  This, as the name implies, is the developer account for sasapp.  It is a good
idea to keep the credentials the same across environments to simplify setup.  This is NOT secure and should NEVER be used in a production environment.
* Gave 'dev' access to the 'CREATE', 'ALTER', 'REFERENCE', and 'EXECUTE' commands.  Only the 'EXECUTE' command should be necessary for a production account.  Not sure though.

The directions for interfacing with MySQL through a GUI depend on the client you are using, although it should be trivial to translate the directions from the command line to the GUI.

Next, you want to create the database tables.  You do this by running the script 'createtables' in the 'dbmanager' folder.
```
$ cd dbmanager
$ node createtables new
...
$ cd ..
```
The command `node createtables new` first runs the node command, which takes the script `createtables` as input, which in turn takes `new` as its input.  `new` shouldn't be required in the future.  It is there for legacy reasons.

Sasapp uses stored procedures to interface with the MySQL database.  To set up stored procedures:
```
$ mysql -u root -p sasapp < dbmanager/procs.sql
Enter password: <don't stop doing what it says>
...
```
`<your name>` can really be anything you want, but `<your email>` has to be a valid google email, preferably one you have access to.  'admin' is the role of the user.  The other user roles are 'student' and 'teacher'.

At this point you \*should\* have a working sasapp server, accessable by running `node app` when in the root directory and navigating to 'localhost:3000' in your browser.  There, you will see a login button, which takes you to the google login page.  In order to link your google account with sasapp:
```
$ mysql -u root -p
Enter password: <you know what to do>
...
mysql> use sasapp
mysql> INSERT INTO users (name, email, type) VALUES ('<your name>', '<your google email>' 'admin');
mysql> quit
```

## Running sasapp

Start the server with `node app`, open your browser, and navigate to 'localhost:3000'.  Login with the google account you put in before, and you should see the administrative page.  Play around with the app.  You've earned it.
