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
 * Analyzes a character in context to determine if it should be typed
 * using the magic key or skip magic key.
 *
 * @param chars - Array of character code points for the full text
 * @param index - Current character index to analyze
 * @returns The type of magic key to use, or null if none
 */
export function getMagicType(
  chars: readonly { codePoint: number }[],
  index: number,
): MagicType {
  if (index < 0 || index >= chars.length) {
    return null;
  }

  const currentChar = String.fromCodePoint(
    chars[index].codePoint,
  ).toLowerCase();

  // Check for skip magic (requires at least 2 characters before)
  if (index >= 2) {
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

  // Check for magic key (requires at least 1 character before)
  if (index >= 1) {
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
