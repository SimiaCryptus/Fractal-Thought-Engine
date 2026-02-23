# Flatten git history so we have only 1 commit - squash it all and compact it. of course, HEAD .gitignore should filter files - matching files will be purged from the repo
set -e
# 1. Ensure the working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Please commit or stash changes first."
  exit 1
fi
# 2. Identify the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
# 3. Create a temporary orphan branch (no history)
git checkout --orphan temp_flatten_branch
# 4. Remove everything from the git index
# This ensures that files currently in .gitignore are purged from the new history
git rm -rf --cached .
# 5. Re-add all files (respecting the current .gitignore)
git add .
# 6. Create the single "flattened" commit
git commit -m "Initial commit (flattened history)"
# 7. Delete the original branch and rename the temporary one to take its place
git branch -D "$BRANCH"
git branch -m "$BRANCH"
# 8. Force garbage collection to purge old objects and compact the repo
git gc --prune=now --aggressive
echo "Success: History flattened to a single commit on branch '$BRANCH'."
echo "To update the remote repository, run: git push -f origin $BRANCH"