# I18N Workflow Manager

Welcome to the command center for our app's internationalization (I18N). This directory contains a powerful, semi-automated CLI tool designed to make translating our app less of a chore and more of a breeze.

It handles everything from finding new text in the code to getting it translated, so you can focus on building features, not wrestling with JSON files.

## The TL;DR

```bash
# First time setup for a new language?
python scripts/i18n/manager.py init fr

# Found new text in the app? Run this.
python scripts/i18n/manager.py sync

# Want to see what would change without touching files?
python scripts/i18n/manager.py sync --dry-run
```

---

## Core Philosophy

This system was built with three principles in mind:

1.  **Automate the Tedious Stuff:** You shouldn't have to manually copy-paste strings, find duplicates, or figure out what's new. The `sync` command handles that.
2.  **Developer Experience is Key:** The process should be transparent and easy. Rewritten files are commented, `--dry-run` lets you preview everything, and the CLI is straightforward.
3.  **Single Source of Truth:** All English text lives in `script_lines.js` files. This is where you add and edit strings. The `translation.json` files are the *destination*, automatically managed by this tool.

---

## Prerequisites

Before you begin, make sure you've got this stuff sorted.

1.  **Python 3.7+**
2.  **Required Libraries:**
    ```bash
    pip install -r scripts/i18n/requirements.txt
    ```
    *(We'll need to create a `requirements.txt` in that folder with `esprima-python`, `python-dotenv`, and `deepl`)*

3.  **DeepL API Key:** This is essential for the automatic translation step.
    *   Create a `.env` file in the project root (the same level as `package.json`).
    *   Add your API key to it. This file is git-ignored, so your key stays safe.

    ```bash
    # /.env
    DEEPL_API_KEY="your-deepl-api-key-goes-here"
    ```

---

## The Workflow: How to Add & Translate Text

Here’s the standard developer workflow.

### Step 1: Add or Edit Text

Go to the relevant `script_lines.js` file (e.g., `src/features/register/utils/script_lines.js`) and add your new English string just like you normally would.

**Example: Adding a new error message.**

```javascript
// src/features/register/utils/script_lines.js

export const scriptLines_Steps = {
    step0BusinessInfo: {
        errors: {
            formDataMissing: "Error: Form data is missing for this step.",
            updateFieldMissing: "Error: Form update mechanism is missing.",
            businessUrlInvalid: "Please provide a valid business URL.", // <-- Our new string
        },
        //...
    },
};
```

### Step 2: Run the Sync Command

Open your terminal at the project root (`frontend/`) and run the `sync` command.

```bash
python scripts/i18n/manager.py sync
```

**What just happened?**

1.  The manager detected a change in `features/register/utils/script_lines.js`.
2.  It parsed the file, found the new string `"Please provide a valid business URL."`.
3.  It generated a key: `register.steps.step0BusinessInfo.errors.businessUrlInvalid`.
4.  It added this key and value to `src/locales/en/translation.json`.
5.  It sent the new string to the DeepL API for all target languages (e.g., Spanish).
6.  It added the Spanish translation to `src/locales/es/translation.json`.
7.  It rewrote `features/register/utils/script_lines.js` to use the `t()` function, adding a helpful inline comment.

**Your rewritten file now looks like this:**

```javascript
// ... header ...
import { t as i18n_t } from '../../../i18n';

export const scriptLines_Steps = (t = i18n_t) => ({
  step0BusinessInfo: {
    errors: {
      formDataMissing: t('register.steps.step0BusinessInfo.errors.formDataMissing'), // "Error: Form data is missing for this step."
      updateFieldMissing: t('register.steps.step0BusinessInfo.errors.updateFieldMissing'), // "Error: Form update mechanism is missing."
      businessUrlInvalid: t('register.steps.step0BusinessInfo.errors.businessUrlInvalid'), // "Please provide a valid business URL."
    },
    // ...
  },
});
```

### Step 3: (One-Time Only) Refactor Your Components

The first time you run `sync` on a project, the `script_lines.js` files are converted from static objects to functions. You need to update your React components to call them as functions.

Our manager has a tool for that.

```bash
# First, run a dry run to see what will change
python scripts/i18n/manager.py refactor-components --dry-run

# If it looks good, run it for real
python scripts/i18n/manager.py refactor-components
```

This will automatically add the `useTranslation` hook and change `scriptLines.foo` to `scriptLines(t).foo` in your components.

### Step 4: Commit Your Changes

Commit all the modified files to Git:
*   The updated `script_lines.js` files.
*   The updated `locales/en/translation.json`.
*   The updated `locales/es/translation.json` (and any other languages).
*   The refactored `.jsx`/`.tsx` components (if you ran the refactor command).

That's it. Your new text is now fully integrated and translated.

---

## Full CLI Command Reference

### `init`
Initializes a new language directory and configuration.

```bash
# Usage: init <lang_code>
python scripts/i18n/manager.py init ja
```

### `sync`
The main command to find new strings, update JSON files, and translate.

```bash
# Standard sync
python scripts/i18n/manager.py sync

# Force rescan of all files, ignoring the state cache
python scripts/i18n/manager.py sync --force

# Only translate for Spanish, even if French is also configured
python scripts/i18n/manager.py sync --lang es
```

### `check`
A read-only command to see if any `script_lines.js` files have been modified since the last sync. Perfect for a pre-commit hook.

```bash
python scripts/i18n/manager.py check
```

### `refactor-components`
A one-time utility to update components to the new functional `script_lines(t)` pattern.

```bash
python scripts/i18n/manager.py refactor-components
```

### `clean` (Future)
This command will eventually scan the codebase for unused (orphaned) keys in the `translation.json` files and offer to remove them.