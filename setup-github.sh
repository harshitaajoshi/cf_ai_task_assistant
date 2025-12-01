#!/bin/bash

# GitHub Repository Setup Script
# This script helps you create and push your repository to GitHub

echo "🚀 Setting up GitHub repository for CF AI Task Assistant"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote get-url origin
    read -p "Do you want to remove it and set a new one? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Keeping existing remote."
    fi
fi

# Get GitHub username
echo ""
echo "📝 Please provide your GitHub information:"
read -p "GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required!"
    exit 1
fi

REPO_NAME="cf_ai_task_assistant"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📦 Repository details:"
echo "   Name: ${REPO_NAME}"
echo "   URL: ${REPO_URL}"
echo ""

# Check if repository exists on GitHub
if curl -s -o /dev/null -w "%{http_code}" "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}" | grep -q "200"; then
    echo "✅ Repository already exists on GitHub"
else
    echo "📋 Please create the repository on GitHub:"
    echo "   1. Go to: https://github.com/new"
    echo "   2. Repository name: ${REPO_NAME}"
    echo "   3. Description: AI-powered Task Assistant Agent built on Cloudflare"
    echo "   4. Choose Public or Private"
    echo "   5. DO NOT initialize with README, .gitignore, or license"
    echo "   6. Click 'Create repository'"
    echo ""
    read -p "Press Enter after you've created the repository..."
fi

# Add remote
echo ""
echo "🔗 Adding remote repository..."
git remote add origin "${REPO_URL}" 2>/dev/null || git remote set-url origin "${REPO_URL}"

# Ensure we're on main branch
git branch -M main

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ Success! Your repository is now on GitHub:"
    echo "   ${REPO_URL}"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Copy the repository URL: ${REPO_URL}"
    echo "   2. Submit it in the assignment form"
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "   - The repository doesn't exist yet (create it first)"
    echo "   - You need to authenticate (run: gh auth login)"
    echo "   - You need to set up SSH keys or use a personal access token"
    echo ""
    echo "💡 Alternative: Use GitHub CLI:"
    echo "   gh auth login"
    echo "   gh repo create ${REPO_NAME} --public --source=. --remote=origin --push"
    echo ""
fi

