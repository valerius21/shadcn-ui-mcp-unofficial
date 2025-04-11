#!/bin/bash

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "Error: build directory not found!"
    echo "Please ensure the TypeScript compilation was successful."
    exit 1
fi

# Check if build/index.js exists
if [ ! -f "build/index.js" ]; then
    echo "Error: build/index.js not found!"
    echo "Please ensure the TypeScript compilation was successful."
    exit 1
fi

# Start the server
echo "Starting the server (STDIO)..."
npm run start

echo "Server startup complete!"