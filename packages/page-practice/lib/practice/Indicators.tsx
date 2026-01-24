import { type LessonKey } from "@keybr/lesson";
import {
  CurrentKeyRow,
  DailyGoalRow,
  GaugeRow,
  KeySetRow,
  names,
  StreakListRow,
} from "@keybr/lesson-ui";
import { type CodePoint } from "@keybr/unicode";
import { Popup, Portal } from "@keybr/widget";
import { memo, type ReactNode, useCallback, useEffect, useState } from "react";
import * as styles from "./Indicators.module.less";
import { KeyExtendedDetails } from "./KeyExtendedDetails.tsx";
import { type LessonState } from "./state/index.ts";

export const Indicators = memo(function Indicators({
  state: { keyStatsMap, summaryStats, lessonKeys, streakList, dailyGoal },
  onToggleKey,
  onSetFocusedKey,
}: {
  readonly state: LessonState;
  readonly onToggleKey?: (codePoint: CodePoint) => void;
  readonly onSetFocusedKey?: (codePoint: CodePoint) => void;
}): ReactNode {
  type PopupState = Readonly<
    { type: "hidden" } | { type: "visible"; key: LessonKey; elem: Element }
  >;
  const [popupState, setPopupState] = useState<PopupState>({ type: "hidden" });

  // Close popup when clicking outside
  const handleClickOutside = useCallback(() => {
    setPopupState({ type: "hidden" });
  }, []);

  useEffect(() => {
    if (popupState.type !== "visible") {
      return;
    }
    // Add click listener to close popup when clicking outside
    const handleClick = () => {
      handleClickOutside();
    };
    // Delay adding the listener to avoid immediate close from the opening click
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClick);
    };
  }, [popupState.type, handleClickOutside]);

  return (
    <div id={names.indicators} className={styles.indicators}>
      <GaugeRow summaryStats={summaryStats} names={names} />
      <KeySetRow
        lessonKeys={lessonKeys}
        names={names}
        onKeyClick={(key) => {
          onToggleKey?.(key.letter.codePoint);
        }}
        onKeySetFocused={(key) => {
          onSetFocusedKey?.(key.letter.codePoint);
        }}
        onKeyShowDetails={(key: LessonKey, elem: Element) => {
          // Toggle popup: if already showing this key, hide it; otherwise show it
          if (popupState.type === "visible" && popupState.key === key) {
            setPopupState({ type: "hidden" });
          } else {
            setPopupState({ type: "visible", key, elem });
          }
        }}
      />
      <CurrentKeyRow lessonKeys={lessonKeys} names={names} />
      <StreakListRow streakList={streakList} names={names} />
      {dailyGoal.goal > 0 && (
        <DailyGoalRow dailyGoal={dailyGoal} names={names} />
      )}
      {popupState.type === "visible" && (
        <Portal>
          <Popup anchor={popupState.elem} onClick={(e) => e.stopPropagation()}>
            <KeyExtendedDetails
              lessonKey={popupState.key}
              keyStats={keyStatsMap.get(popupState.key.letter)}
            />
          </Popup>
        </Portal>
      )}
    </div>
  );
});
