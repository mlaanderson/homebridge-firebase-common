# browser-platform
An example Platform implementation using homebridge-firebase-common/lib/platform.js

You can run this application on [RawGit](https://rawgit.com) by clicking this 
[link](https://cdn.rawgit.com/mlaanderson/homebridge-firebase-common/master/examples/browser-platform/index.html).

## Setup
The application will initially ask for your Firebase URL. As long as your
browser supports Local Storage, it should only ask this the first time.

Once the Firebase database is connected the application will require you
to login with an email and password. This must be a valid user under your
Firebase database. To learn how to create an account, check [the Firebase Docs](https://www.firebase.com/docs/web/guide/login/password.html)

## Overview
The platform scans your Firebase instance for all matching defined Accessories.
Then it populates a tree that lets you monitor and modify the values for those
accessories. If you have the firebase-platform instance running on a Homebridge
server you will see the change notifications populate to HomeKit apps.

## TODO
The next step for development in this project is to develop a series of 
example widgets that will respond to and update the Firebase database, and
thus complete the example implementations.