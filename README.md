# ICO Service Portal

Contain a number of components all together for providing the ICO-as-service:

  - `admin-board`: provide the admin board
  - `data-api`: provide rest APIs for data storage
  - `chain-api`: provide rest APIs for blockchain-related handling
  - `user-board`: provide the user board
  - `token vesting`: team token vesting

Each component is described in detail in its `README`

## Installation, Configuration and System Start

  - It's recommended to create a 5GB-RAM workspace with pre-installed MongoDB for deployment.

  - Please refer to the `REAME.md` file provided in each component.

  - The components must be started with the following sequence:

    - `data-api`
    - `chain-api`
    - `admin-board`
    - `user-board`
