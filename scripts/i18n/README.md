# I18N Workflow Manager v2.5

Welcome to the command center for our app's internationalization (I18N). This directory contains a powerful CLI tool designed to make translating our app less of a chore and more of a breeze. It acts as a linter, formatter, and synchronization engine for our entire translation system.

It handles everything from finding new text in the code to getting it translated, so you can focus on building features, not wrestling with JSON files.

## The TL;DR

```bash
# First time setup for a new language?
python scripts/i18n/manager.py init fr

# Added new text or pluralization rules to a script_lines.js file? Run this.
# The script is smart and will guide you if it detects potential mistakes.
python scripts/i18n/manager.py sync

# Want to re-apply all comments and sort all JSON files?
python scripts/i18n/manager.py format

# Want to check if anything is out of sync or missing?
python scripts/i18n/manager.py check --details

# Want to remove old, unused translations from all language files?
python scripts/i18n/manager.py clean
```

---

## Core Philosophy

This system was built with three principles in mind:

1.  **Automate the Tedious Stuff:** You shouldn't have to manually copy-paste strings, find duplicates, or figure out what's new. The `sync` command handles that.
2.  **Developer Experience is Key:** The process is transparent and easy. The script provides warnings for common mistakes, rewritten files are self-documenting with inline comments, `--dry-run` lets you preview everything, and the CLI is straightforward.
3.  **Zero Component Refactoring:** The `script_lines.js` files act as a "smart" abstraction layer. Components import from them as if they were simple static objects, requiring **no changes** to existing component code.

---

## Prerequisites

Before you begin, ensure you have the following set up:

1.  **Python 3.7+**
2.  **Required Libraries:**
    ```bash
    pip install esprima-python python-dotenv deepl
    ```
    *(Or install from a `requirements.txt` file if one is provided in this directory).*

3.  **DeepL API Key:** This is essential for the automatic translation step.
    -   Create a `.env` file in the project's root directory (the same level as `package.json`).
    -   Add your API key to it. This file is git-ignored, so your key stays safe.
    ```
    # /.env
    DEEPL_API_KEY="your-deepl-api-key-goes-here"
    ```

---

## The Developer Workflow

Here’s the standard, simplified workflow for adding, managing, and cleaning up UI text.

### Step 1: Add or Edit Text in `script_lines.js`

This is your **single source of truth** for all English text. Go to the relevant `script_lines.js` file and add or modify strings as needed.

#### **Example 1: Adding a Simple String**

```javascript
// BEFORE running sync
// in: src/features/register/utils/script_lines.js
export const scriptLines_Steps = {
    step0BusinessInfo: {
        errors: {
            formDataMissing: "Error: Form data is missing for this step.",
            businessUrlInvalid: "Please provide a valid business URL.", // <-- Our new string
        },
    },
};
```

#### **Example 2: Adding a Pluralized String**

For strings that change based on a number (e.g., "1 item" vs. "2 items"), use a specific object structure with `one` and `other` keys.

**Important:** The script requires double-braces `{{count}}` for placeholders to work correctly with the translation service.

```javascript
// BEFORE running sync
// in: src/features/cart/utils/script_lines.js
export const scriptLines_Cart = {
    itemCount: {
      one: "{{count}} item in your cart",
      other: "{{count}} items in your cart"
    },
};
```

### Step 2: Run the Sync Command

From the project root (`frontend/`), run the sync command.

```bash
python scripts/i18n/manager.py sync
```

This command will:
1.  **Find new strings** and pluralization rules.
2.  **Add them to `en/translation.json`**, creating keys like `register.steps.step0BusinessInfo.errors.businessUrlInvalid` or `cart.itemCount_one` and `cart.itemCount_other`.
3.  **Send new text to DeepL** for automatic translation into other languages.
4.  **Rewrite the `script_lines.js` file** for simple strings, turning them into self-translating modules with helpful comments.
    *Note: Pluralization blocks are NOT rewritten, as they need to remain as objects for `i18next` to use them correctly.*

**Your simple string is now a self-translating module:**
```javascript
/**
 * @auto-managed
 * ...
 */
import i18n from '../../../i18n';

export const scriptLines_Steps = {
  step0BusinessInfo: {
    errors: {
      formDataMissing: i18n.t('register.steps.step0BusinessInfo.errors.formDataMissing'), // "Error: Form data is missing for this step."
      businessUrlInvalid: i18n.t('register.steps.step0BusinessInfo.errors.businessUrlInvalid'), // "Please provide a valid business URL."
    }
  },
};
```

### Step 3: Keep Your I18N System Healthy

Over time, you'll want to run maintenance commands.

**To re-apply comments and sort all JSON files:**
```bash
python scripts/i18n/manager.py format
```

**To check for issues like unused keys or missing translations:**
```bash
python scripts/i18n/manager.py check --details
```

**To remove unused (orphaned) keys from all translation files:**
```bash
python scripts/i18n/manager.py clean
```

### Step 4: Commit Your Changes

Commit all modified files to Git. No component refactoring is ever needed.
-   The updated `script_lines.js` file(s).
-   The updated `locales/` translation files.
-   The updated `I18N_GUIDE.md` if any policies changed.

---

## Full CLI Command Reference

### `init <lang_code>`
Initializes a new language directory and configuration. Run this once for each new language you want to support.
```bash
python scripts/i18n/manager.py init ja
```

### `sync`
The main command to find new strings, update JSON files, and translate. The script will interactively warn you if it finds common mistakes, like incorrect placeholder syntax.
```bash
# Standard sync (only processes changed files)
python scripts/i18n/manager.py sync

# Force a rescan of all script_lines.js files
python scripts/i18n/manager.py sync --force

# Sync and only translate for specific languages
python scripts/i18n/manager.py sync --lang es de
```

### `format`
**(ROBUST)** A code polisher that uses AST parsing to reliably update all inline comments in `script_lines.js` files based on the current English `translation.json`. It also sorts all keys in every language's JSON file for consistency.
```bash
python scripts/i18n/manager.py format
```

### `check`
**(ENHANCED)** A full I18N linter that runs multiple checks:
1.  **File Sync:** Reports if any `script_lines.js` files have been modified since the last sync.
2.  **Orphaned Keys:** Finds keys in `translation.json` that are no longer used in the code.
3.  **Missing Keys:** Finds keys used in the code that are missing from `translation.json`.
4.  **Missing Translations:** Reports which keys are missing from each target language file.

```bash
# Run a summary check
python scripts/i18n/manager.py check

# Run with a detailed list of all issues
python scripts/i18n/manager.py check --details
```

### `clean`
**(IMPLEMENTED)** Finds and removes orphaned (unused) keys from all translation files after prompting for confirmation.
```bash
# Interactively clean orphaned keys
python scripts/i18n/manager.py clean

# Automatically clean without a prompt (for CI/CD scripts)
python scripts/i18n/manager.py clean --yes
```