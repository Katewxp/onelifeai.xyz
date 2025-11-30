#!/bin/bash
# OneLife GitHub Push Script
# Uses SSH with port 443 for GitHub connection

cd "$(dirname "$0")"

echo "🚀 Pushing OneLife to GitHub..."

# Use SSH with port 443 (GitHub alternative port)
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_github_kate -o IdentitiesOnly=yes -p 443 -o Hostname=ssh.github.com" git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ Push failed. Please check your connection and try again."
    exit 1
fi

