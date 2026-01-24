import { type LessonKey, type LessonKeys } from "@keybr/lesson";
import { type ClassName } from "@keybr/widget";
import { useRef } from "react";
import { Key } from "./Key.tsx";

export const KeySet = ({
  id,
  className,
  lessonKeys,
  onKeyClick,
  onKeySetFocused,
  onKeyShowDetails,
}: {
  id?: string;
  className?: ClassName;
  lessonKeys: LessonKeys;
  onKeyClick?: (key: LessonKey, elem: Element) => void;
  onKeySetFocused?: (key: LessonKey, elem: Element) => void;
  onKeyShowDetails?: (key: LessonKey, elem: Element) => void;
}) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <span
      ref={ref}
      id={id}
      className={className}
      onMouseDown={(event) => {
        // Prevent click from stealing focus from TextArea
        if (onKeyClick || onKeySetFocused || onKeyShowDetails) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        // Alt+Click (Option+Click on Mac) = show details popup
        if (event.altKey && onKeyShowDetails) {
          relayEvent(ref.current!, event, onKeyShowDetails);
        }
        // Shift+Click = set as focused/current key
        else if (event.shiftKey && onKeySetFocused) {
          relayEvent(ref.current!, event, onKeySetFocused);
        }
        // Click = toggle enable/disable
        else {
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
