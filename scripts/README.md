# OpenId-Connect Login for Auth0

## Installation

`npm install`

## Configuration

Create a file called `config.json` in the root directory of the project. The file should contain the following:

```json
{
  "issuer": "https://example.com",
  "client_id": "fadsfsadfsafasf",
  "audiance": "https://api.example.com"
}
```

- `issuer`: The issuer of the OpenId-Connect provider. This is the URL of the Auth0 tenant.
- `client_id`: The client id of the application that is registered with the OpenId-Connect provider.
- `audiance`: The audiance of the application that is registered with the OpenId-Connect provider.

## Running the application

```bash
node index.js
```
