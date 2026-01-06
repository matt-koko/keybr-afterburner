import { Layout } from "@keybr/keyboard";
import {
  Attr,
  type Char,
  type TextDisplaySettings,
  WhitespaceStyle,
} from "@keybr/textinput";
import { type CodePoint } from "@keybr/unicode";
import { type CSSProperties, type ReactNode } from "react";
import {
  getMagicType,
  MAGIC_BACKGROUND_COLOR,
  SKIP_MAGIC_BACKGROUND_COLOR,
} from "./afterburner-magic.ts";
import * as styles from "./chars.module.less";
import { getTextStyle } from "./styles.ts";

/**
 * Context for magic key detection.
 * Provides the full line's characters and the offset of the current slice.
 */
export type MagicContext = {
  readonly contextChars: readonly Char[];
  readonly offset: number;
};

/**
 * Checks if magic key highlighting should be shown.
 * Requires Afterburner layout AND the setting to be enabled.
 */
function shouldShowMagicHighlighting(settings: TextDisplaySettings): boolean {
  return (
    settings.layout?.id === Layout.EN_AFTERBURNER.id &&
    settings.magicKeyHighlighting
  );
}

/**
 * Gets the magic highlight style for a character if applicable.
 */
function getMagicStyle(
  settings: TextDisplaySettings,
  magicContext: MagicContext | undefined,
  localIndex: number,
): CSSProperties | undefined {
  if (!magicContext || !shouldShowMagicHighlighting(settings)) {
    return undefined;
  }

  const globalIndex = magicContext.offset + localIndex;
  const magicType = getMagicType(magicContext.contextChars, globalIndex, {
    suppressSkipMagicAfterMagic: settings.suppressSkipMagicAfterMagic,
    suppressMagicAfterSkipMagic: settings.suppressMagicAfterSkipMagic,
    suppressSkipMagicAfterSpace: settings.suppressSkipMagicAfterSpace,
  });

  if (magicType === "magic") {
    return { backgroundColor: MAGIC_BACKGROUND_COLOR };
  } else if (magicType === "skipMagic") {
    return { backgroundColor: SKIP_MAGIC_BACKGROUND_COLOR };
  }

  return undefined;
}

export function renderChars(
  settings: TextDisplaySettings,
  chars: readonly Char[],
  magicContext?: MagicContext,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const showMagic = shouldShowMagicHighlighting(settings) && magicContext;

  // When showing magic highlights, we need to render each character individually
  // to apply different background colors
  if (showMagic) {
    for (let i = 0; i < chars.length; i++) {
      const { codePoint, attrs, cls = null } = chars[i];
      const baseStyle = getTextStyle({ attrs, cls }, codePoint <= 0x0020);
      const magicStyle = getMagicStyle(settings, magicContext, i);
      const combinedStyle = magicStyle
        ? { ...baseStyle, ...magicStyle }
        : baseStyle;

      if (codePoint > 0x0020) {
        nodes.push(
          <span
            key={nodes.length}
            className={getClassName({ attrs })}
            style={combinedStyle}
          >
            {String.fromCodePoint(codePoint)}
          </span>,
        );
      } else {
        nodes.push(
          <span
            key={nodes.length}
            className={getClassName({ attrs })}
            style={combinedStyle}
          >
            {specialChar(settings.whitespaceStyle, codePoint)}
          </span>,
        );
      }
    }
    return nodes;
  }

  // Original grouping logic for non-Afterburner layouts
  type Span = { chars: CodePoint[]; attrs: number; cls: string | null };
  let span: Span = { chars: [], attrs: 0, cls: null };
  const pushSpan = (nextSpan: Span) => {
    if (span.chars.length > 0) {
      nodes.push(
        <span
          key={nodes.length}
          className={getClassName(span)}
          style={getTextStyle(span, /* special= */ false)}
        >
          {String.fromCodePoint(...span.chars)}
        </span>,
      );
    }
    span = nextSpan;
  };
  for (let i = 0; i < chars.length; i++) {
    const { codePoint, attrs, cls = null } = chars[i];
    if (codePoint > 0x0020) {
      if (span.attrs !== attrs || span.cls !== cls) {
        pushSpan({ chars: [], attrs, cls });
      }
      span.chars.push(codePoint);
    } else {
      pushSpan({ chars: [], attrs, cls });
      nodes.push(
        <span
          key={nodes.length}
          className={getClassName(span)}
          style={getTextStyle(span, /* special= */ true)}
        >
          {specialChar(settings.whitespaceStyle, codePoint)}
        </span>,
      );
    }
  }
  pushSpan({ chars: [], attrs: 0, cls: null });
  return nodes;
}

function specialChar(whitespaceStyle: WhitespaceStyle, codePoint: CodePoint) {
  switch (codePoint) {
    case 0x0009:
      return "\uE002";
    case 0x000a:
      return "\uE003";
    case 0x0020:
      switch (whitespaceStyle) {
        case WhitespaceStyle.Bar:
          return "\uE001";
        case WhitespaceStyle.Bullet:
          return "\uE000";
        default:
          return "\u00A0";
      }
    default:
      return `U+${codePoint.toString(16).padStart(4, "0")}`;
  }
}

function getClassName({ attrs }: { readonly attrs: Attr }) {
  return attrs === Attr.Cursor ? styles.cursor : undefined;
}

const cursorSelector = `.${styles.cursor}`;

export function findCursor(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(cursorSelector) ?? null;
}
