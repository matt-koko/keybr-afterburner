/**
 * Afterburner keyboard layout magic key rules.
 *
 * The Afterburner layout uses two special keys to minimize same-finger usage:
 * - Magic key: output based on the last key pressed
 * - Skip Magic key: output based on the second-to-last key pressed
 *
 * @see https://blog.simn.me/posts/2025/afterburner/
 */

export type MagicType = "magic" | "skipMagic" | null;

/**
 * Magic key rules: after pressing key X, the magic key outputs Y.
 * Map from trigger character (lowercase) to output character.
 */
const MAGIC_RULES: ReadonlyMap<string, string> = new Map([
  ["a", "o"], // chaos → cha#s
  ["g", "s"], // legs → leg#
  ["h", "y"], // why → wh#
  ["u", "e"], // fuel → fu#l
  ["x", "t"], // extra → ex#ra
  ["y", "h"], // anyhow → any#ow
]);

/**
 * Skip magic key rules: when second-to-last key is X and current char is Y,
 * skip magic should be used.
 * Map from trigger character (lowercase) to output character.
 */
const SKIP_MAGIC_RULES: ReadonlyMap<string, string> = new Map([
  ["a", "o"], // another → an$ther
  ["b", "n"], // bank → ba$k
  ["d", "t"], // edit → edi$
  ["f", "s"], // fast → fa$t
  ["g", "s"], // changes → change$
  ["h", "y"], // hey → he$
  ["j", "y"], // joy → jo$
  ["k", "t"], // market → marke$
  ["l", "r"], // color → colo$r
  ["m", "k"], // make → ma$ke
  ["o", "a"], // personal → person$l
  ["p", "n"], // open → ope$n
  ["q", "e"], // request → requ$st
  ["r", "l"], // roll → ro$ll
  ["u", "e"], // feature → featur$e
  ["v", "t"], // invite → invi$te
  ["x", "t"], // exit → exi$t
  ["y", "h"], // anything → anyt$hing
  [",", "i"], // so, I → so, $i
  [".", "i"], // it. I → it. $i
  ["-", "i"], // so - I → so - $i
  ["/", "a"], // /tableflip → /t$ableflip
  [";", "e"], // too; even → to#o; $even
]);

/**
 * Checks if a character at the given index would be typed using the magic key.
 * This is used to determine if skip magic should apply - if the character
 * at index-2 was typed with magic, there's no SFS to avoid.
 */
function wouldUseMagicKey(
  chars: readonly { codePoint: number }[],
  index: number,
): boolean {
  if (index < 1 || index >= chars.length) {
    return false;
  }

  const currentChar = String.fromCodePoint(
    chars[index].codePoint,
  ).toLowerCase();
  const lastChar = String.fromCodePoint(
    chars[index - 1].codePoint,
  ).toLowerCase();

  // Check if magic rule applies
  const magicOutput = MAGIC_RULES.get(lastChar);
  if (magicOutput === currentChar) {
    return true;
  }

  // Check if magic repeat applies (same char, no specific magic rule)
  if (lastChar === currentChar && !MAGIC_RULES.has(lastChar)) {
    return true;
  }

  return false;
}

/**
 * Checks if a character at the given index would be typed using the skip magic key.
 * This is used to determine if magic should apply - if the character
 * at index-1 was typed with skip magic, there's no SFB to avoid.
 *
 * This function also considers whether skip magic would have been suppressed
 * due to other options (e.g., if the char at index-2 used magic).
 */
function wouldUseSkipMagicKey(
  chars: readonly { codePoint: number }[],
  index: number,
  options: {
    suppressSkipMagicAfterMagic: boolean;
    suppressSkipMagicAfterSpace: boolean;
  },
): boolean {
  if (index < 2 || index >= chars.length) {
    return false;
  }

  // Check if skip magic would be suppressed due to magic at index-2
  if (
    options.suppressSkipMagicAfterMagic &&
    wouldUseMagicKey(chars, index - 2)
  ) {
    return false;
  }

  // Check if skip magic would be suppressed due to space at index-1
  if (
    options.suppressSkipMagicAfterSpace &&
    chars[index - 1].codePoint === 0x0020
  ) {
    return false;
  }

  const currentChar = String.fromCodePoint(
    chars[index].codePoint,
  ).toLowerCase();
  const secondToLastChar = String.fromCodePoint(
    chars[index - 2].codePoint,
  ).toLowerCase();

  // Check if skip magic rule applies
  const skipMagicOutput = SKIP_MAGIC_RULES.get(secondToLastChar);
  if (skipMagicOutput === currentChar) {
    return true;
  }

  // Check if skip magic repeat applies (same char, no specific skip magic rule)
  if (
    secondToLastChar === currentChar &&
    !SKIP_MAGIC_RULES.has(secondToLastChar)
  ) {
    return true;
  }

  return false;
}

/**
 * Options for magic type detection.
 */
export type MagicOptions = {
  /**
   * When true, skip magic is suppressed if the character at index-2
   * was typed using the magic key (no SFS to avoid).
   * Default: true
   */
  readonly suppressSkipMagicAfterMagic: boolean;
  /**
   * When true, magic is suppressed if the character at index-1
   * was typed using the skip magic key (no SFB to avoid).
   * Default: true
   */
  readonly suppressMagicAfterSkipMagic: boolean;
  /**
   * When true, skip magic is suppressed if the character at index-1
   * is a space. This prevents skip magic from crossing word boundaries,
   * allowing consistent muscle memory per word.
   * Default: false
   */
  readonly suppressSkipMagicAfterSpace: boolean;
};

const defaultMagicOptions: MagicOptions = {
  suppressSkipMagicAfterMagic: true,
  suppressMagicAfterSkipMagic: true,
  suppressSkipMagicAfterSpace: false,
};

/**
 * Analyzes a character in context to determine if it should be typed
 * using the magic key or skip magic key.
 *
 * @param chars - Array of character code points for the full text
 * @param index - Current character index to analyze
 * @param options - Options for magic detection behavior
 * @returns The type of magic key to use, or null if none
 */
export function getMagicType(
  chars: readonly { codePoint: number }[],
  index: number,
  options: MagicOptions = defaultMagicOptions,
): MagicType {
  if (index < 0 || index >= chars.length) {
    return null;
  }

  const currentChar = String.fromCodePoint(
    chars[index].codePoint,
  ).toLowerCase();

  // Check for skip magic (requires at least 2 characters before)
  if (index >= 2) {
    // If suppressSkipMagicAfterMagic is enabled, check if the character
    // at index-2 was typed using magic key. If so, skip the skip magic check
    // because there's no SFS to avoid (the actual key pressed was the magic key).
    const charAtMinus2UsedMagic =
      options.suppressSkipMagicAfterMagic && wouldUseMagicKey(chars, index - 2);

    // If suppressSkipMagicAfterSpace is enabled, check if the character
    // at index-1 is a space. This prevents skip magic from crossing word
    // boundaries, allowing consistent muscle memory per word.
    const prevCharIsSpace =
      options.suppressSkipMagicAfterSpace &&
      chars[index - 1].codePoint === 0x0020;

    const shouldSuppressSkipMagic = charAtMinus2UsedMagic || prevCharIsSpace;

    if (!shouldSuppressSkipMagic) {
      const secondToLastChar = String.fromCodePoint(
        chars[index - 2].codePoint,
      ).toLowerCase();
      const skipMagicOutput = SKIP_MAGIC_RULES.get(secondToLastChar);

      if (skipMagicOutput === currentChar) {
        return "skipMagic";
      }

      // Skip magic also repeats if same character (e.g., "none" → "no$e")
      if (
        secondToLastChar === currentChar &&
        !SKIP_MAGIC_RULES.has(secondToLastChar)
      ) {
        return "skipMagic";
      }
    }
  }

  // Check for magic key (requires at least 1 character before)
  if (index >= 1) {
    // If suppressMagicAfterSkipMagic is enabled, check if the character
    // at index-1 was typed using skip magic key. If so, skip the magic check
    // because there's no SFB to avoid (the actual key pressed was skip magic).
    const shouldSuppressMagic =
      options.suppressMagicAfterSkipMagic &&
      wouldUseSkipMagicKey(chars, index - 1, {
        suppressSkipMagicAfterMagic: options.suppressSkipMagicAfterMagic,
        suppressSkipMagicAfterSpace: options.suppressSkipMagicAfterSpace,
      });

    if (!shouldSuppressMagic) {
      const lastChar = String.fromCodePoint(
        chars[index - 1].codePoint,
      ).toLowerCase();
      const magicOutput = MAGIC_RULES.get(lastChar);

      if (magicOutput === currentChar) {
        return "magic";
      }

      // Magic key also repeats (e.g., "all" → "al#")
      // Only suggest repeat if current char equals previous char
      // and there's no specific magic rule that applies
      if (lastChar === currentChar && !MAGIC_RULES.has(lastChar)) {
        return "magic";
      }
    }
  }

  return null;
}

/**
 * CSS background color for magic key characters (orange).
 */
export const MAGIC_BACKGROUND_COLOR = "#f80b";

/**
 * CSS background color for skip magic key characters (blue).
 */
export const SKIP_MAGIC_BACKGROUND_COLOR = "#2adb";
