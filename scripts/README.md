# Fractal Thought Engine - Scripts & Tooling

This repository contains the source code and maintenance scripts for the **Fractal Thought Engine** static site. The project is built using **Jekyll** and utilizes a suite of custom **Node.js** and **Shell/PowerShell** scripts to manage content, validate links, handle assets, and deploy to AWS S3.

## 📋 Prerequisites

Before running these scripts, ensure you have the following installed:

*   **Node.js** (v14+ recommended)
*   **Ruby & Bundler** (for Jekyll)
*   **AWS CLI** (configured with appropriate credentials)
*   **ImageMagick** or **libvips** (prerequisite for the `sharp` library used in image processing)

### Installation

1.  **Install Node Dependencies:**
    ```bash
    npm install sharp gray-matter glob js-yaml
    ```

2.  **Install Ruby Gems:**
    ```bash
    bundle install
    ```

---

## 🚀 Deployment

Automated scripts are provided for building the Jekyll site and syncing it to the S3 bucket (`s3://fractalthoughtengine.com`) with proper cache headers and CloudFront invalidation.

### Linux / macOS (`deploy.sh`)
```bash
# Standard deployment
./scripts/deploy.sh

# Dry run (see what will happen without uploading)
./scripts/deploy.sh --dry-run

# Use a specific AWS profile
./scripts/deploy.sh --profile my-profile
```

### Windows (`deploy.ps1`)
```powershell
# Standard deployment
.\scripts\deploy.ps1

# Dry run
.\scripts\deploy.ps1 -DryRun

# Use a specific AWS profile
.\scripts\deploy.ps1 -Profile my-profile
```

**Features:**
*   Checks for AWS CLI and Jekyll installation.
*   Cleans previous builds (`_site`).
*   Sets `JEKYLL_ENV=production`.
*   Syncs to S3 with `--delete` (removes files on S3 that no longer exist locally).
*   Sets aggressive caching headers for CSS/JS/Images and no-cache for HTML.

---

## 📝 Content Management Workflows

The project uses a sophisticated "Export -> Transform -> Import" workflow to handle complex content structures and asset organization.

### 1. Exporting Posts (`export-posts.js`)
Converts standard Jekyll `_posts/*.md` files into a folder-based structure in `post_data/`.

*   **What it does:**
    *   Creates a folder for each post (e.g., `post_data/2024/01/my-post/`).
    *   Separates Frontmatter into `frontmatter.yaml`.
    *   Separates Markdown body into `content.md`.
    *   **Localizes Images:** Finds images referenced in the post, copies them into the post's folder, and updates the markdown references.

```bash
node scripts/export-posts.js
```

### 2. Importing Posts (`import-posts.js`)
Reconstructs Jekyll markdown files from the `post_data/` directory back into `_posts/`.

*   **What it does:**
    *   Combines `frontmatter.yaml` and content files.
    *   **Tab Generation:** Detects special content files (`tutorial.md`, `comic.md`, `socratic.md`, etc.) and automatically generates HTML tab navigation within the post.
    *   **Asset Organization:** Moves images to `assets/images/{post-slug}/` and updates paths in both Markdown and Frontmatter.
    *   **Auto-Tagging:** Adds tags based on content types found (e.g., adds `Game-Theory` tag if `gametheory.md` exists).

```bash
node scripts/import-posts.js
```

---

## 📊 Bulk Data Editing

These scripts allow you to edit Frontmatter (metadata) for all posts simultaneously using CSV files (e.g., in Excel or Google Sheets).

### 1. Extract Frontmatter (`extract-frontmatter.js`)
Scans all posts and creates CSV files in `_data/` for every unique frontmatter key found.

*   **Output:** `_data/title.csv`, `_data/tags.csv`, etc.
*   **Format:** `filepath, value`

```bash
node scripts/extract-frontmatter.js
```

### 2. Ingest Frontmatter (`ingest-frontmatter.js`)
Reads modified CSV files from `_data/` and updates the actual Markdown files in `_posts/`.

*   **Features:**
    *   Only updates files if values have changed.
    *   Smart type inference (converts "true" to boolean, handles JSON arrays).

```bash
node scripts/ingest-frontmatter.js
```

---

## 🔗 Link Validation & Repair

### Validate Links (`validate-links.js`)
A powerful utility to ensure site integrity.

*   **Checks:**
    *   Markdown links `[text](path.md)`.
    *   Frontmatter links (e.g., `parent_document`, `related_documents`).
*   **Auto-Fixing:**
    *   Uses **Levenshtein distance** to find the closest matching filename if a link is broken (e.g., fixes `conciousness.md` to `consciousness.md`).
    *   Fixes improper relative paths.
*   **Reporting:** Generates `link-validation-report.json` and `all-links-report.csv`.

```bash
node scripts/validate-links.js
```

---

## 🎨 Asset & Housekeeping Tools

### Generate Favicons (`generate-favicons.js`)
Generates a complete suite of favicons from a single source image.

*   **Input:** `assets/images/fractal_thought_engine_logo.png`
*   **Output:** `favicon.ico`, Apple Touch Icons, Android Chrome icons, and `site.webmanifest`.
*   **Features:** Automatically removes black backgrounds and handles transparency.

```bash
node scripts/generate-favicons.js
```

### Normalize Featured Images (`normalize-featured-images.js`)
Ensures every post has a valid `featured_image`.
*   If a post has a local image defined in frontmatter, it renames it to `main.png` for consistency.
*   Removes `featured_image` keys that point to missing files.

```bash
node scripts/normalize-featured-images.js
```

### Fix Post Dates (`fix-post-dates.js`)
Ensures the `date` in the Frontmatter matches the date in the filename.
*   *Example:* If filename is `2023-01-01-test.md` but frontmatter says `2022-12-31`, it updates the frontmatter to `2023-01-01`.

```bash
node scripts/fix-post-dates.js
```

### Rename Posts (`rename_posts.sh`)
Standardizes filenames based on the file creation/modification date and title.
*   **Format:** `YYYY-MM-DD-slugified-title.md`

```bash
./scripts/rename_posts.sh
```

---

## 🛠️ Common Workflows

### Scenario: Bulk Retagging
1.  Run `node scripts/extract-frontmatter.js`.
2.  Open `_data/tags.csv` in Excel.
3.  Modify tags as needed.
4.  Run `node scripts/ingest-frontmatter.js`.

### Scenario: Reorganizing a Post with Multiple Content Types
1.  Run `node scripts/export-posts.js`.
2.  Navigate to `post_data/YYYY/MM/slug/`.
3.  Add `comic.md` or `socratic.md` alongside `content.md`.
4.  Run `node scripts/import-posts.js`.
5.  The system will automatically build the tabs and update tags.

### Scenario: Pre-Deployment Check
1.  Run `node scripts/fix-post-dates.js`.
2.  Run `node scripts/validate-links.js` to fix broken references.
3.  Run `./scripts/deploy.sh`.

