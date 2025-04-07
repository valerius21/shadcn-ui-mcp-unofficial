#!/bin/bash

# Define the project directory
PROJECT_DIR="/home/janardhan/Documents/code/Ai/mcp-v2"

# Navigate to project directory
cd $PROJECT_DIR

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