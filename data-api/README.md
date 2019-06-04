# API Server

Provides rest APIs for admin- and user boards

## Installation 

### Dependencies

`npm i`

and `npm audit fix --force` if required

### MongoDB

The workspace should be created with the techstack that has MongoDB pre-installation.

## Configuration

  - Copy the template file `.env.example` into own file `.env`

  - Only the `PORT` with default value of `3000` can be changed/adapted.

  - The remaining params leave untouched

## System start

### Start MongoDB

  - MongoDB server should be running by default for the running workspace

  - MongoDB server listens at port `27017`

### Create folder for storing KYC

Create a folder named `kyc` in `./static/` for storing the KYC images/files.

### Start server (production)

  - in background:  `npm start`

  - Server listens at port: `3000` (set by the `PORT` in `.env` file)

### Start server (development)

  - in foreground:  `npm run dev`

  - Server listens at port: `3000` (set by the `PORT` in `.env` file)

### MongoDB-related handling in NodeJS

Please refer to the following files:

  - data-api/src/config/mongoose.js: show how to connect to MongoDB
  - data-api/src/models/contract.model.js: show how to define db schema
  - data-api/src/controllers/contract.controller.js: show how to store/retrieve data into/from db
