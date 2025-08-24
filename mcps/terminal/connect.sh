#!/bin/bash

# Prompt for IP
read -p "Enter instance IP: " ip

# Build SSH command
SSH_CMD="ssh -i ~/Downloads/tester.pem ubuntu@$ip"

echo ""
echo "👉 Trying to connect: $SSH_CMD"
echo ""

# Uncomment below if you want to actually run SSH
# eval $SSH_CMD
