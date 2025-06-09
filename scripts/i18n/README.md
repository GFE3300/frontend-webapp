
# **I18N Workflow Manager v3.0**

Welcome to the command center for our app's internationalization (I18N). This directory contains a powerful CLI tool designed to make translating our app less of a chore and more of a breeze. It acts as a linter, formatter, and synchronization engine for our entire translation system.

It handles everything from finding new text in the code to getting it translated, so you can focus on building great features, not wrestling with JSON files.

## Core Philosophy

This system is built on a simple but powerful idea: **separate static UI text from dynamic content.**

1.  **Static UI Text** (labels, buttons, tooltips) lives in `script_lines.js` files next to your features. Our script automates the entire translation process for this text.
2.  **Dynamic Content** (product names, category descriptions) lives in the database and is translated via the backend's `django-modeltranslation` system. The frontend simply requests the data, and the backend provides the correct language.

This guide focuses on the **frontend static UI text** workflow, which is managed by this script.

## The TL;DR for the Impatient

```bash
# Added a new string to your feature's script_lines.js file?
# This one command does it all: finds text, translates, and rewrites the file.
python scripts/i18n/manager.py sync

# Want to check for any issues, like unused keys?
python scripts/i18n/manager.py check --details

# Want to remove old, unused translations?
python scripts/i18n/manager.py clean

# Just want to add comments and sort the JSON files?
python scripts/i18n/manager.py format
```

---

## The Developer's Guide to Translating a New Feature

Follow these steps every time you build a new feature with user-facing text.

### **Step 1: Centralize All Text in `script_lines.js`**

This is your **single source of truth** for all English text in your feature. As you build your components, instead of writing strings directly in your JSX, place them in a dedicated `script_lines.js` file within your feature's directory (e.g., `src/features/your-feature/utils/script_lines.js`).

#### **Writing Simple Strings**

For a simple button label or title, just add it as a key-value pair.

*File: `src/features/your-feature/utils/script_lines.js`*
```javascript
// BEFORE running sync
export const scriptLines_YourFeature = {
    modalTitle: "Create New Widget",
    buttons: {
        confirm: "Confirm & Save",
        cancel: "Cancel",
    },
};
```

#### **Writing Pluralized Strings**

For strings that depend on a number (e.g., "1 item" vs. "5 items"), use a special object with `one` and `other` keys. This is the standard i18next convention.

**IMPORTANT:** Placeholders for dynamic values **must** use double curly braces `{{variable}}`. Our script will warn you if you forget.

*File: `src/features/your-feature/utils/script_lines.js`*
```javascript
// BEFORE running sync
export const scriptLines_YourFeature = {
    widgetCount: {
      one: "{{count}} widget in your inventory",
      other: "{{count}} widgets in your inventory"
    },
};
```

### **Step 2: Run the `sync` Command**

Once you've added your text, open your terminal at the project root (`frontend/`) and run the main command:

```bash
python scripts/i18n/manager.py sync
```

This single command automates the entire workflow:

1.  **Detects Changes:** It finds your new `script_lines.js` file or any modifications to existing ones.
2.  **Extracts & Creates Keys:** It parses the file, creating i18n keys based on the object path (e.g., `yourFeature.modalTitle` or `yourFeature.widgetCount_one`).
3.  **Updates Source Language:** It adds the new keys and their English text to `src/locales/en/translation.json`.
4.  **Auto-Translates:** It sends the new English text to the DeepL API to get machine translations for all other supported languages (like Spanish) and updates their `translation.json` files.
5.  **Rewrites Your File:** It converts your simple string definitions into self-translating `i18n.t()` function calls.

**After `sync`, your simple string file will look like this:**
```javascript
/**
 * @auto-managed
 * ...
 */
import i18n from '../../../i18n';

export const scriptLines_YourFeature = {
    modalTitle: i18n.t('yourFeature.modalTitle'),
    buttons: {
        confirm: i18n.t('yourFeature.buttons.confirm'),
        cancel: i18n.t('yourFeature.buttons.cancel'),
    },
};
```

**Note:** The pluralization block for `widgetCount` will be left untouched in your `script_lines.js` file, as it needs to remain an object. The script is smart enough to handle this.

### **Step 3: Use the Translated Text in Your Component**

Now, import from your `script_lines.js` file and use the values directly. You don't need to change anything in your component code—it just works.

*File: `src/features/your-feature/components/YourComponent.jsx`*
```jsx
import { useTranslation } from 'react-i18next';
import { scriptLines_YourFeature } from '../utils/script_lines.js';

function YourComponent({ widgetCount }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* For simple strings */}
      <h1>{scriptLines_YourFeature.modalTitle}</h1>
      <button>{scriptLines_YourFeature.buttons.confirm}</button>

      {/* For pluralized strings, pass the key and the count object to t() */}
      <p>{t(scriptLines_YourFeature.widgetCount, { count: widgetCount })}</p>
    </div>
  );
}
```

### **Step 4: Commit Your Changes**

You're done! Commit the following files to your git repository:
*   The modified `script_lines.js` file.
*   All updated `src/locales/**/*.json` files.

That's it. Your feature is now fully translated and ready to go.

---

## **Full CLI Command Reference**

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
A code polisher that adds/updates helpful comments next to each `i18n.t()` call with the source English text. It also sorts keys in all `translation.json` files for consistency.
```bash
python scripts/i18n/manager.py format
```

### `repair`
An interactive tool to fix missing keys. If you manually add an `i18n.t('new.key')` to your code, this command will detect that `new.key` is missing from your `translation.json` files and prompt you to provide the source text for it. It then translates and updates all language files automatically.
```bash
# Interactively find and fix missing keys
python scripts/i18n/manager.py repair

### `check`
A full I18N linter that runs multiple checks:
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
Finds and removes orphaned (unused) keys from all translation files after prompting for confirmation. Essential for keeping translation files lean.
```bash
# Interactively clean orphaned keys
python scripts/i18n/manager.py clean

# Automatically clean without a prompt (for CI/CD scripts)
python scripts/i18n/manager.py clean --yes
```

---

## **A Note on Data Formatting (Currencies, Numbers, Dates, Icons and Data)**

This i18n system is exclusively for **translatable text**. It should not be used for data formatting concerns.

-   **DO NOT** put currency symbols (`$`, `€`), number formats, or date formats in `script_lines.js`.
-   **DO** use the native `Intl` API in JavaScript for this purpose. It is locale-aware and the correct tool for the job.

-   **DO NOT** write the placeholders for dynamic values like this: {value}
-   **DO** Placeholders for dynamic values **must** use double curly braces `{{variable}}`.

-   **DO NOT** add the Icons name into your script_lines file, Icons are based on Material Symbol
-   **DO** keep the name of the Icons no matter what

**Correct Way to Format Currency:**
A helper function, `formatCurrency`, is provided in `src/features/venue_management/utils/script_lines.js` for this. It uses `Intl.NumberFormat`.

```javascript
import { formatCurrency } from '...';

const price = 12.50;
const currencyCode = 'EUR'; // This should come from your business settings API

const formattedPrice = formatCurrency(price, currencyCode); // "12,50 €" (in a European locale)
```