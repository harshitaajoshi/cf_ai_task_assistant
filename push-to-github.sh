#!/bin/bash
# Quick GitHub push script
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="cf_ai_task_assistant"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "Setting up remote: ${REPO_URL}"
git remote remove origin 2>/dev/null
git remote add origin "${REPO_URL}"
git branch -M main
echo ""
echo "Ready to push! Make sure you've created the repository at:"
echo "https://github.com/new (name it: ${REPO_NAME})"
echo ""
read -p "Press Enter to push to GitHub..."
git push -u origin main
