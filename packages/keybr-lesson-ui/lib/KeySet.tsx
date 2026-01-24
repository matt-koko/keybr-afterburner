import { type LessonKey, type LessonKeys } from "@keybr/lesson";
import { type ClassName } from "@keybr/widget";
import { useRef } from "react";
import { Key } from "./Key.tsx";

export const KeySet = ({
  id,
  className,
  lessonKeys,
  onKeyHoverIn,
  onKeyHoverOut,
  onKeyClick,
  onKeySetFocused,
}: {
  id?: string;
  className?: ClassName;
  lessonKeys: LessonKeys;
  onKeyHoverIn?: (key: LessonKey, elem: Element) => void;
  onKeyHoverOut?: (key: LessonKey, elem: Element) => void;
  onKeyClick?: (key: LessonKey, elem: Element) => void;
  onKeySetFocused?: (key: LessonKey, elem: Element) => void;
}) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <span
      ref={ref}
      id={id}
      className={className}
      onMouseOver={(event) => {
        relayEvent(ref.current!, event, onKeyHoverIn);
      }}
      onMouseOut={(event) => {
        relayEvent(ref.current!, event, onKeyHoverOut);
      }}
      onMouseDown={(event) => {
        // Prevent click from stealing focus from TextArea
        if (onKeyClick || onKeySetFocused) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        // Shift+Click = set as focused/current key
        if (event.shiftKey && onKeySetFocused) {
          relayEvent(ref.current!, event, onKeySetFocused);
        } else {
          relayEvent(ref.current!, event, onKeyClick);
        }
      }}
    >
      {[...lessonKeys].map((lessonKey) => (
        <Key key={lessonKey.letter.codePoint} lessonKey={lessonKey} />
      ))}
    </span>
  );
};

function relayEvent(
  root: Element,
  { target }: { target: any },
  handler?: (key: LessonKey, elem: Element) => void,
) {
  while (
    handler != null &&
    target instanceof Element &&
    root.contains(target)
  ) {
    const key = Key.attached(target);
    if (key) {
      handler(key, target);
      return;
    }
    target = target.parentElement;
  }
}
