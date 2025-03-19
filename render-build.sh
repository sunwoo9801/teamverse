#!/bin/bash
echo "Installing ncurses for tput support..."
sudo apt-get update && sudo apt-get install -y ncurses-bin
echo "Starting build process..."
./gradlew bootJar
