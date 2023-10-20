# Express.js API Stock Management System 

This is a Node.js Express API for a Stock Management System that uses Firebase for data storage. The API provides endpoints to manage security and stock-related operations. It is designed to facilitate the secure management of stock data in a Firebase-backed system. 

## Project Structure

The project structure consists of the following files and directories:

- **app.js**: The main entry point of the application that sets up the Express server and defines the API routes.
- **misc.js**: Contains miscellaneous functions and utilities used in the application.
- **package-lock.json**: Dependency file for npm packages.
- **stock-control.js**: Module for managing stock data, including stock manipulation, order management, and stock tracking.
- **creds.json**: Firebase credentials file.
- **package.json**: Project configuration file with dependencies and scripts.
- **Procfile**: Configuration for deploying the application to platforms like Heroku.
- **security-module.js**: Module for managing security, including user authentication and authorization.
- **test**: Directory containing test JSON data

## Installation

Before running the API, make sure you have Node.js and npm installed on your system. To install the required dependencies, run the following command in the project directory:

```
npm install
```

## Configuration

To configure the API with your Firebase project, you need to provide your Firebase Project Configuration in a JSON file. Create a file named `config.json` and add your Firebase Project Configuration:

```
{
  "apiKey": "your-api-key",
  "authDomain": "your-auth-domain",
  "projectId": "your-project-id",
  "storageBucket": "your-storage-bucket",
  "messagingSenderId": "your-messaging-sender-id",
  "appId": "your-app-id"
}
```

## Running the API

You can start the Express.js server by running the following command:

```
npm start
```

The API will be accessible at [http://localhost:5000](http://localhost:5000) or at the port specified in your environment variable `process.env.PORT`.

## API Endpoints

### Security Module
- **POST /security**: Handles security-related operations, including user authentication and authorization.

### Stock Control Module
- **POST /stock**: Manages stock-related operations, such as stock manipulation, order management, and stock tracking.

## Deployment

The project includes a `Procfile` that can be used for deploying the application to platforms like Heroku
