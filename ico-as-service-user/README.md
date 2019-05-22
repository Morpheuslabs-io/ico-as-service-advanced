# ICO As Service User UI

User dashbaord UI for Ico as service

## Installation

``` bash
# clone the repo
$ git clone https://github.com/Morpheuslabs-io/ico-as-service-user.git

# go into app's directory
$ cd ico-as-service-user

# install app's dependencies
$ npm install
```

Copy `.env.example` to `.env` and config parameters

```dotenv
PORT=9090
CHOKIDAR_USEPOLLING=true

REACT_APP_WIZARD_URL=http://localhost:3000
REACT_APP_API_HOST=http://localhost:3777/v1
REACT_APP_RNDKEY=0xekfjguryehwghdfsvxbcndhfyetry4
REACT_APP_KYCAML_PHOTO=http://localhost:3777/static/kyc

```

## Run

```bash
# run app
$ npm start
```
visit http://localhost:9090
