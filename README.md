# Sedlex

## Installation

#### Install the npm dependencies

    npm install
    
Or, to install on the system globally:

    npm -g install

#### Configure the database

Copy the file config/config.json.example to config/config.json
Modify it to fit your current database settings.

#### Run the migration tool

Once the database is configured, the tables used by this application must be created, using the migration scripts.
The migration scripts can be launched using the follow command:

    node node_modules/.bin/sequelize db:migrate

You should now have a working copy of the Sedlex server.
