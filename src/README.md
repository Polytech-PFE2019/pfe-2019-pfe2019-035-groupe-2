# Actuation Conflict Manager

IoT applications have been limited to collecting field information for a long time. 
However, Smart IoT Systems (SIS) are now not only composed of sensors, but also of actuators taking electrical input and turning it into physical actions. 
Therefore, in case of infrastructures with shared actuators, interactions with the physical environment raise additional challenges that cannot be ignored
Actuators not only raise concurrent and possibly conflicting accesses problems. 
They also raise problems of semantic coherency between the considered actions and their resulting effects in the environment (e.g., opening a window while heating).
The consequences of actions and their impacts in the physical environment may put at risk applications functionalities.
Indeed, applications being no longer isolated processes, they are not immune to the effects of the concurrent applications sharing the same environment and potentially producing antagonistic effects.

Actuation Conflict Manager (ACM) helps to identify, analyse and resolve different kind of conflicts (direct and indirect ones) so as to ensure SIS trustworthiness.

## Dependencies:
- node.js (tested with 8.11.2 and 10.15.1)
- npm (tested with 5.6.0 and 6.4.1)
- Java 8
- RethinkTD (install with https://www.rethinkdb.com/docs/install/)
- AGG (install with http://www.user.tu-berlin.de/o.runge/agg/down_V21_java8/index.html)

When deploying Node-RED, the target install needs to have the [ACM Node-RED nodes](https://gitlab.com/enact/actuation_conflict_manager_nodes) installed.

## Setup
### RethinkDB
After installing RethinkDB, you must verify that rethinkdb program is included in your PATH.
With the Linux installer, this is the case with the installer we tested, but it's not the case with the Windows one, as the "installer" is a zip file. 
So you must add your folder containing rethinkdb.exe in your PATH, depending on your OS.

For instance on Linux, if you are in the folder containing rethinkdb program:

    echo $PATH
    PATH=$PATH:`pwd`

or on Windows:

    echo %PATH%
    set PATH=%PATH%;C:\your\path\here\

This modification will be for your opened "command interpreter". If you want to add it permanently to you PATH variable, follow [this tutorial](https://docs.telerik.com/teststudio/features/test-runners/add-path-environment-variables).

### AGG
After install AGG, you must add the agg foder in your PATH. Use the same procedure as for ReThinkDB.

### Node packages
Install node packages from repository root:

    npm install
    
## Running
Start using npm in the acm-app folder

    cd acm-app
    npm start

If everything is up and running properly the actuation conflict management interface will be available at http://localhost:3333, and automatically opened in the default web browser.

Then to use the ACM Enabler, you just have to "Load model" and input the URL to the server (GeneSIS) or the flow (Node-RED) of the app to be analysed.

## Documentation and examples
More information including usage examples can be found [here](./docs/README.md)

Swagger API documentation is available at http://localhost:3333/api-docs/