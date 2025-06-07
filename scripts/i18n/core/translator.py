import logging
import re
from typing import List, Optional, Tuple

try:
    import deepl
except ImportError:
    logging.critical("DeepL library not found. Please run 'pip install deepl'.")
    exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Regex to find placeholders like {variable} or {{variable}}
# It will match the inner-most brackets if they are nested.
PLACEHOLDER_REGEX = re.compile(r"(\{[\w.-]+\})")

def _protect_placeholders(text: str) -> str:
    """
    Wraps dynamic placeholders in non-translatable XML tags.
    Example: "Hello {name}" -> "Hello <ph>{name}</ph>"
    """
    return PLACEHOLDER_REGEX.sub(r'<ph>\1</ph>', text)

def _unprotect_placeholders(text: str) -> str:
    """
    Removes the protective XML tags from a translated string.
    Example: "Hola <ph>{name}</ph>" -> "Hola {name}"
    """
    return text.replace('<ph>', '').replace('</ph>', '')

def initialize_translator(api_key: str) -> Optional[deepl.Translator]:
    """
    Initializes and returns the DeepL translator instance.

    Checks for a valid API key and handles potential authentication errors
    during initialization.

    Args:
        api_key: The DeepL API key.

    Returns:
        A deepl.Translator instance if initialization is successful,
        otherwise None.
    """
    if not api_key:
        logging.error("DeepL API key is missing. Cannot initialize translator.")
        return None
    
    try:
        translator = deepl.Translator(api_key)
        # Verify authentication by checking usage data
        translator.get_usage()
        logging.info("DeepL translator initialized and authentication successful.")
        return translator
    except deepl.AuthorizationError as e:
        logging.error(f"DeepL authentication failed. Please check your API key. Error: {e}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred during DeepL translator initialization: {e}")
        return None


def translate_texts(
    translator: deepl.Translator, 
    texts: List[str], 
    target_lang_code: str
) -> Optional[List[str]]:
    """
    Translates a batch of texts to a specified target language using DeepL,
    while protecting dynamic placeholders.

    Args:
        translator: An initialized deepl.Translator instance.
        texts: A list of strings to be translated.
        target_lang_code: The target language code (e.g., 'ES', 'FR', 'DE-DE').

    Returns:
        A list of translated strings in the same order as the input,
        or None if a critical API error occurs.
    """
    if not texts:
        logging.info("No new texts to translate.")
        return []

    logging.info(f"Sending {len(texts)} text(s) to DeepL for translation into '{target_lang_code.upper()}'.")
    
    # Pre-process texts to protect placeholders
    protected_texts = [_protect_placeholders(text) for text in texts]
    
    target_lang = target_lang_code.upper()

    try:
        # Use tag_handling='xml' to make DeepL respect our custom tags.
        # Use ignore_tags to specify which tags contain non-translatable content.
        results = translator.translate_text(
            protected_texts,
            target_lang=target_lang,
            tag_handling='xml',
            ignore_tags=['ph']
        )
        
        # Post-process results to remove protection tags
        translated_texts = [_unprotect_placeholders(result.text) for result in results]
        
        logging.info("Successfully received and processed translations from DeepL.")
        return translated_texts

    except deepl.QuotaExceededException:
        logging.error("DeepL API quota exceeded. Cannot perform translation.")
        return None
    except deepl.DeepLException as e:
        logging.error(f"An error occurred with the DeepL API during translation: {e}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred while translating texts: {e}")
        return None