# ICO As Service User Frontend

User dashboard for viewing/registering:

  - KYC
  - Investment

## Installation 

### Dependencies

`npm i`

## Configuration

  - Copy the template file `.env.example` into own file `.env`

  - Only the `PORT=8090` as HTTP port of the `admin board` might not be changed, the following params must be changed/adapted according to the workspace: 

    - `REACT_APP_DATA_SERVER`: `data-api` server URL

    - `REACT_APP_KYCAML_PHOTO`: location that stores the uploaded images/files

## System start

### Production

  - cmd: `pm2 start pm2/script_start_user_board.sh`

  - Server listens at port `8090`

### Local development

  - cmd: `npm run dev`

  - Server listens at port `8090`

## Access the running app

This is a web app running and listenning at port `8090`.
To determine its URL, have a look at the `Machines` small panel and then right-click on (for example) `truffle/dev-machine` to select `Servers`. This will show up a view where the web-app `https` link can be seen at the
row `http-server`. Please be noted that, all the ports displayed in this view mean to be reserved for external access.

