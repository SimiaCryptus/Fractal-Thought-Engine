#!/bin/bash
# Function to convert title to slug
title_to_slug() {
    echo "$1" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | tr '[:upper:]' '[:lower:]'
}
# Function to get date from file (using modification date as fallback)
get_date() {
    local file="$1"
    local mod_date=$(stat -c %y "$file" | cut -d' ' -f1)
    echo "$mod_date"
}
# Rename all posts in _posts subdirectories
find ./_posts -name "*.md" -type f | while read file; do
    # Extract directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file" .md)
    # Skip if already properly named (starts with date pattern)
    if [[ "$filename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}- ]]; then
        echo "Skipping already properly named: $file"
        continue
    fi
    # Get date and create slug
    date=$(get_date "$file")
    slug=$(title_to_slug "$filename")
    # Create new filename
    new_filename="${date}-${slug}.md"
    new_path="${dir}/${new_filename}"
    echo "Renaming: $file -> $new_path"
    mv "$file" "$new_path"
done
