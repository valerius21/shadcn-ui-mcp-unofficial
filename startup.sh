#!/bin/bash

# Clean the project
echo "Cleaning the project..."
npm run clean

# Build the project
echo "Building the project..."
npm run build

# Start the server
echo "Starting the server..."
npm run start

echo "Server startup complete!"