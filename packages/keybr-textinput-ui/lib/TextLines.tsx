import {
  type Char,
  charArraysAreEqual,
  type Line,
  type LineList,
  type TextDisplaySettings,
  textDisplaySettings,
} from "@keybr/textinput";
import { clsx } from "clsx";
import {
  type ComponentType,
  type CSSProperties,
  memo,
  type ReactNode,
} from "react";
import { type MagicContext, renderChars } from "./chars.tsx";
import { Cursor } from "./Cursor.tsx";
import { textItemStyle } from "./styles.ts";
import * as styles from "./TextLines.module.less";

export type TextLineSize = "X0" | "X1" | "X2" | "X3";

export const TextLines = memo(function TextLines({
  settings = textDisplaySettings,
  lines,
  wrap = true,
  size = "X0",
  lineTemplate: LineTemplate,
  cursor,
  focus,
}: {
  readonly lines: LineList;
  readonly settings?: TextDisplaySettings;
  readonly wrap?: boolean;
  readonly size?: TextLineSize;
  readonly lineTemplate?: ComponentType<any>;
  readonly cursor: boolean;
  readonly focus: boolean;
}): ReactNode {
  const className = clsx(
    styles.root,
    wrap ? styles.wrap : styles.nowrap,
    focus ? styles.focus : styles.blur,
    size === "X0" && styles.size_X0,
    size === "X1" && styles.size_X1,
    size === "X2" && styles.size_X2,
    size === "X3" && styles.size_X3,
  );
  const children = lines.lines.map(({ text, chars, ...props }: Line) =>
    LineTemplate != null ? (
      <LineTemplate key={text} {...props}>
        <TextLine
          key={text}
          settings={settings}
          chars={chars}
          className={className}
          style={settings.font.cssProperties}
        />
      </LineTemplate>
    ) : (
      <TextLine
        key={text}
        settings={settings}
        chars={chars}
        className={className}
        style={settings.font.cssProperties}
      />
    ),
  );
  return cursor ? <Cursor settings={settings}>{children}</Cursor> : children;
});

/**
 * Item with its offset in the full line for magic context.
 */
type ItemWithOffset = {
  chars: readonly Char[];
  offset: number;
};

const TextLine = memo(
  function TextLine({
    settings,
    chars,
    className,
    style,
  }: {
    readonly settings: TextDisplaySettings;
    readonly chars: readonly Char[];
    readonly className: string;
    readonly style: CSSProperties;
  }): ReactNode {
    const items: ItemWithOffset[] = [];
    let itemChars: Char[] = [];
    let itemStart = 0;
    let ws = false;
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      switch (char.codePoint) {
        case 0x0009:
        case 0x000a:
        case 0x0020:
          ws = true;
          break;
        default:
          if (ws) {
            if (itemChars.length > 0) {
              items.push({ chars: itemChars, offset: itemStart });
              itemChars = [];
            }
            itemStart = i;
            ws = false;
          }
          break;
      }
      itemChars.push(char);
    }
    if (itemChars.length > 0) {
      items.push({ chars: itemChars, offset: itemStart });
      itemChars = [];
    }
    return (
      <div
        className={className}
        style={style}
        dir={settings.language.direction}
      >
        {items.map((item, index) => (
          <TextItem
            key={index}
            settings={settings}
            chars={item.chars}
            magicContext={{ contextChars: chars, offset: item.offset }}
          />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.settings === nextProps.settings &&
    charArraysAreEqual(prevProps.chars, nextProps.chars) && // deep equality
    prevProps.className === nextProps.className,
);

const TextItem = memo(
  function TextItem({
    settings,
    chars,
    magicContext,
  }: {
    readonly settings: TextDisplaySettings;
    readonly chars: readonly Char[];
    readonly magicContext?: MagicContext;
  }): ReactNode {
    return (
      <span style={textItemStyle}>
        {renderChars(settings, chars, magicContext)}
      </span>
    );
  },
  (prevProps, nextProps) =>
    prevProps.settings === nextProps.settings &&
    charArraysAreEqual(prevProps.chars, nextProps.chars) &&
    prevProps.magicContext?.offset === nextProps.magicContext?.offset, // compare offset
);
