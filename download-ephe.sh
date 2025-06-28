#!/bin/bash

# Download ephemeris files from PyJHora repository
echo "Downloading ephemeris files..."

# Create ephe directory if it doesn't exist
mkdir -p ephe

# Base URL for PyJHora ephemeris files
BASE_URL="https://github.com/naturalstupid/pyjhora/raw/main/src/jhora/data/ephe"

# List of required ephemeris files
FILES=(
    "seas_18.se1"
    "semo_18.se1" 
    "sepl_18.se1"
    "seas_18.se1"
)

# Download each file
for file in "${FILES[@]}"; do
    echo "Downloading $file..."
    curl -L -o "ephe/$file" "$BASE_URL/$file"
done

echo "Download complete! Check the ephe/ directory." 