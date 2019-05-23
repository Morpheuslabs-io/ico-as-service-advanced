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

  - Example: `PORT=3777`

## System start

### Start MongoDB

  - MongoDB server should be running by default for the running workspace

  - MongoDB server listens at port `27017`

### Start server (production)

  - in background:  `npm start`

  - Server listens at port: `3777`

### Start server (development)

  - in foreground:  `npm run dev`

  - Server listens at port: `3777`
