# ICO As Service Admin Frontend

Admin dashboard for controlling/managing:

  - ICO wizard
  - Token vesting wizard
  - KYC
  - Investor

## Installation 

### Dependencies

`yarn install`

## Configuration

  - Copy the template file `.env.example` into own file `.env`

  - Example: `PORT=9000`

## System start

### Production

  - cmd: `pm2 start pm2/script_admin_board.sh`

  - Server listens at: `104.248.144.168:9000`

### Local development

  - cmd: `yarn dev`

  - Server listens at: `localhost:9000`

