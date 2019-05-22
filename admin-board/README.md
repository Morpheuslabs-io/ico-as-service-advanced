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

  - Example: `PORT=8080`

## System start

### Production

  - cmd: `pm2 start pm2/script_admin_board.sh`

  - Server listens at port `8080`

### Local development

  - cmd: `npm run dev`

  - Server listens at port `8080`

