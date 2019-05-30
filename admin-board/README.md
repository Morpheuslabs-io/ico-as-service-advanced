# ICO As Service Admin Frontend

Admin dashboard for controlling/managing:

  - ICO wizard
  - Token vesting wizard
  - KYC
  - Investor

## Installation 

### Dependencies

`npm i`

## Configuration

  - Copy the template file `.env.example` into own file `.env`

  - Only the `PORT=8080` as HTTP port of the `admin board` might not be changed, the following params must be changed/adapted according to the workspace: 

    - `REACT_APP_API_SERVER`: `data-api` server URL

    - `REACT_APP_WIZARD_API_RINKEBY`: `chain-api` server URL on Rinkeby

    - `REACT_APP_KYCAML_PHOTO`: location that stores the uploaded images/files

## System start

### Production

  - cmd: `pm2 start pm2/script_admin_board.sh`

  - Server listens at port `8080`

### Local development

  - cmd: `npm run dev`

  - Server listens at port `8080`

## Access the running app

This is a web app running and listenning at port `8080`.
To determine its URL, have a look at the `Machines` small panel and then right-click on (for example) `truffle/dev-machine` to select `Servers`. This will show up a view where the web-app `https` link can be seen at the
row `http-server`. Please be noted that, all the ports displayed in this view mean to be reserved for external access.

