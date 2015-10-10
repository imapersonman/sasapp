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
The directions for interfacing with MySQL through a GUI depend on the client you are using, although it should be trivial to translate the directions from the command line to the GUI.
