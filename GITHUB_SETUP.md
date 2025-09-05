# Push LVL UP Performance to GitHub - Step by Step Guide

## Prerequisites
- A GitHub account
- Git installed on your local machine
- Terminal/Command line access

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `lvl-up-performance` (or your preferred name)
   - **Description**: `Next-generation HR performance management and feedback system - SaaS platform with Universal Feedback Link System`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (since we already have these)
5. Click "Create repository"

## Step 2: Get Your Repository URL

After creating the repository, GitHub will show you the repository URL. It will look like:
```
https://github.com/yourusername/lvl-up-performance.git
```

Copy this URL - you'll need it in the next step.

## Step 3: Push Your Code (Run these commands in Replit's Shell)

Open the Shell tab in Replit and run these commands one by one:

### Clear any git lock issues (if needed)
```bash
rm -f .git/index.lock
```

### Check current git status
```bash
git status
```

### Add all files to git
```bash
git add .
```

### Create your first commit
```bash
git commit -m "Initial commit: LVL UP Performance SaaS platform

- Complete HR performance management system
- Universal Feedback Link System with QR codes
- Multi-tenant architecture with role-based access
- Goal management with progress tracking
- React/TypeScript frontend with shadcn/ui
- Express/Node.js backend with PostgreSQL
- Replit Auth integration for authentication"
```

### Add your GitHub repository as remote origin
```bash
git remote add origin https://github.com/yourusername/lvl-up-performance.git
```
*Replace `yourusername` and `lvl-up-performance` with your actual GitHub username and repository name*

### Push to GitHub
```bash
git push -u origin main
```

## Step 4: Verify Your Repository

1. Go back to your GitHub repository page
2. Refresh the page
3. You should see all your project files
4. Verify that sensitive files are not included (no .env files, etc.)

## Repository Structure You Should See

```
├── client/                 # Frontend React application
├── server/                # Backend Express application  
├── shared/                # Shared schemas and types
├── attached_assets/       # Project assets
├── node_modules/          # Dependencies (should be ignored)
├── .gitignore            # Git ignore rules
├── DEPLOYMENT_GUIDE.md   # Complete deployment documentation
├── GITHUB_SETUP.md       # This setup guide
├── package.json          # Project dependencies
├── README.md             # Project overview (if you create one)
└── Other config files
```

## Step 5: Set Up Branch Protection (Optional but Recommended)

For a professional setup:

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Branches" in the left sidebar
4. Click "Add rule" for branch protection
5. Set branch name pattern to `main`
6. Enable:
   - "Require pull request reviews before merging"
   - "Require status checks to pass before merging"
   - "Include administrators"

## Step 6: Add Collaborators (Optional)

If you're working with a team:

1. Go to repository "Settings"
2. Click "Manage access"
3. Click "Invite a collaborator"
4. Enter their GitHub username or email

## Troubleshooting

### If you get authentication errors:
- Make sure you're logged into GitHub
- You might need to set up a Personal Access Token if using HTTPS
- Or set up SSH keys for easier authentication

### If the push is rejected:
```bash
git pull origin main --rebase
git push origin main
```

### If you need to change the remote URL:
```bash
git remote set-url origin https://github.com/yourusername/your-new-repo-name.git
```

## Next Steps After GitHub Setup

1. **Set up CI/CD** (Optional): Consider setting up GitHub Actions for automated testing and deployment
2. **Add a README.md** with project overview and setup instructions
3. **Create Issues** for any bugs or feature requests
4. **Set up Projects** for task management
5. **Configure Dependabot** for automatic dependency updates

## Important Security Notes

✅ **What's Safe to Commit:**
- Source code files
- Configuration templates
- Documentation
- Public assets

❌ **Never Commit These:**
- `.env` files with real secrets
- API keys or passwords
- Database credentials
- Personal information
- Large binary files

The `.gitignore` file has been updated to prevent accidentally committing sensitive files.

---

**Need Help?** Check the [GitHub Documentation](https://docs.github.com/) or contact your development team.