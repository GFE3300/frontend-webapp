# I18N Workflow Manager v2.2

Welcome to the command center for our app's internationalization (I18N). This directory contains a powerful, semi-automated CLI tool designed to make translating our app less of a chore and more of a breeze.

It handles everything from finding new text in the code to getting it translated, so you can focus on building features, not wrestling with JSON files.

## The TL;DR

```bash
# First time setup for a new language?
python scripts/i18n/manager.py init fr

# Added new text to a script_lines.js file? Run this.
python scripts/i18n/manager.py sync

# Want to see what would change without touching any files?
python scripts/i18n/manager.py sync --dry-run
```

---

## Core Philosophy

This system was built with three principles in mind:

1.  **Automate the Tedious Stuff:** You shouldn't have to manually copy-paste strings, find duplicates, or figure out what's new. The `sync` command handles that.
2.  **Developer Experience is Key:** The process should be transparent and easy. Rewritten files are self-documenting with inline comments, `--dry-run` lets you preview everything, and the CLI is straightforward.
3.  **Zero Component Refactoring:** The `script_lines.js` files act as a "smart" abstraction layer. Components import from them as if they were simple static objects, requiring **no changes** to existing component code.

---

## Prerequisites

Before you begin, ensure you have the following set up:

1.  **Python 3.7+**
2.  **Required Libraries:** Install the necessary Python packages.
    ```bash
    pip install -r scripts/i18n/requirements.txt
    ```
    *(A `requirements.txt` file should be created in `scripts/i18n/` containing `esprima-python`, `python-dotenv`, and `deepl`)*

3.  **DeepL API Key:** This is essential for the automatic translation step.
    *   Create a `.env` file in the project's root directory (the same level as `package.json`).
    *   Add your API key to this file. This file is git-ignored, so your key stays safe.
    ```
    # /.env
    DEEPL_API_KEY="your-deepl-api-key-goes-here"
    ```

---

## The Developer Workflow

Here’s the standard, simplified workflow for adding or changing UI text.

### Step 1: Add or Edit Text in `script_lines.js`

This is your **single source of truth** for all English text. Go to the relevant `script_lines.js` file and add or modify strings as needed.

**Example: Adding a new error message.**

```javascript
// BEFORE running sync
// in: src/features/register/utils/script_lines.js

export const scriptLines_Steps = {
    step0BusinessInfo: {
        errors: {
            formDataMissing: "Error: Form data is missing for this step.",
            businessUrlInvalid: "Please provide a valid business URL.", // <-- Our new string
        },
        //...
    },
};
```

### Step 2: Run the Sync Command

From the project root (`frontend/`), run the sync command.

```bash
python scripts/i18n/manager.py sync
```

**What the Magic Does:**

1.  The manager detects the change in `script_lines.js`.
2.  It parses the file, finds the new string `"Please provide a valid business URL."`.
3.  It generates a unique key (e.g., `register.steps.step0BusinessInfo.errors.businessUrlInvalid`).
4.  It adds this new key and the English string to `src/locales/en/translation.json`.
5.  It sends *only the new string* to the DeepL API, which intelligently translates it while ignoring placeholders like `{variable}`.
6.  It adds the new key and its translation to all target language files (e.g., `src/locales/es/translation.json`).
7.  Finally, it rewrites `script_lines.js`, replacing the static string with a call to the `i18n.t()` function and adding a helpful inline comment.

**Your `script_lines.js` file is now a self-translating module:**

```javascript
/**
 * @auto-managed
 * ...
 * @last-synced 2025-06-07 11:45:00 UTC
 */
import i18n from '../../../i18n';

export const scriptLines_Steps = {
  step0BusinessInfo: {
    errors: {
      formDataMissing: i18n.t('register.steps.step0BusinessInfo.errors.formDataMissing'), // "Error: Form data is missing for this step."
      businessUrlInvalid: i18n.t('register.steps.step0BusinessInfo.errors.businessUrlInvalid'), // "Please provide a valid business URL."
    }
  },
  // ... more keys
};
```

### Step 3: Commit Your Changes

Commit all modified files to Git. No component refactoring is needed.
*   The updated `script_lines.js` file(s).
*   The updated `locales/en/translation.json`.
*   The updated `locales/es/translation.json` (and any other languages).

That's it. Your new text is now fully integrated and translated across the app.

---

## Full CLI Command Reference

### `init`
Initializes a new language directory and configuration. Run this once for each new language you want to support.

```bash
# Usage: init <lang_code>
python scripts/i18n/manager.py init ja
```

### `sync`
The main command to find new strings, update JSON files, and translate.

```bash
# Standard sync (only processes changed files)
python scripts/i18n/manager.py sync

# Force a rescan of all script_lines.js files
python scripts/i18n/manager.py sync --force

# Sync and only translate for specific languages
python scripts/i18n/manager.py sync --lang es de
```

### `check`
A read-only command to see if any `script_lines.js` files have been modified since the last sync. Perfect for a pre-commit hook or CI check.

```bash
python scripts/i18n/manager.py check
```

### `clean` (Future)
This command is a placeholder to eventually find and remove unused (orphaned) keys from translation files.

```bash
python scripts/i18n/manager.py clean
```