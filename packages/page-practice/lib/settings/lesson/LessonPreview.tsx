import { type Lesson, lessonProps } from "@keybr/lesson";
import { CurrentKeyRow, KeySetRow } from "@keybr/lesson-ui";
import { LCG } from "@keybr/rand";
import { useSettings } from "@keybr/settings";
import {
  TextInput,
  toTextDisplaySettings,
  toTextInputSettings,
} from "@keybr/textinput";
import { StaticText } from "@keybr/textinput-ui";
import { type CodePoint } from "@keybr/unicode";
import { FieldSet } from "@keybr/widget";
import { type ReactNode, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLessonKeys } from "../../practice/state/useLessonKeys.ts";
import * as styles from "./LessonPreview.module.less";

export function LessonPreview({
  lesson,
}: {
  readonly lesson: Lesson;
}): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  const lessonKeys = useLessonKeys(lesson);
  const textInput = useMemo(() => {
    return new TextInput(
      lesson.generate(lessonKeys, LCG(123)),
      toTextInputSettings(settings),
    );
  }, [settings, lesson, lessonKeys]);

  const handleToggleKey = useCallback(
    (codePoint: CodePoint) => {
      const excludedKeys = settings.get(lessonProps.excludedKeys);
      const forcedKeys = settings.get(lessonProps.forcedKeys);

      // Find the current key state
      const key = lessonKeys.find(codePoint);
      if (key == null) return;

      let newExcludedKeys = excludedKeys.filter((cp) => cp !== codePoint);
      let newForcedKeys = forcedKeys.filter((cp) => cp !== codePoint);

      if (key.isIncluded) {
        // Prevent disabling the last included key
        const includedKeys = lessonKeys.findIncludedKeys();
        if (includedKeys.length <= 1) {
          return;
        }
        // Key is currently included, so exclude it
        newExcludedKeys = [...newExcludedKeys, codePoint];
      } else {
        // Key is currently excluded, so force include it
        newForcedKeys = [...newForcedKeys, codePoint];
      }

      updateSettings(
        settings
          .set(lessonProps.excludedKeys, newExcludedKeys)
          .set(lessonProps.forcedKeys, newForcedKeys),
      );
    },
    [settings, updateSettings, lessonKeys],
  );

  const handleSetFocusedKey = useCallback(
    (codePoint: CodePoint) => {
      const currentFocusedKey = settings.get(lessonProps.focusedKey);
      // Toggle: if already focused, clear it; otherwise set it
      const newFocusedKey = currentFocusedKey === codePoint ? 0 : codePoint;
      updateSettings(settings.set(lessonProps.focusedKey, newFocusedKey));
    },
    [settings, updateSettings],
  );

  return (
    <FieldSet
      legend={formatMessage({
        id: "t_Lesson_preview:",
        defaultMessage: "Lesson preview",
      })}
    >
      <div className={styles.root}>
        <KeySetRow
          lessonKeys={lessonKeys}
          onKeyClick={(key) => {
            handleToggleKey(key.letter.codePoint);
          }}
          onKeySetFocused={(key) => {
            handleSetFocusedKey(key.letter.codePoint);
          }}
        />
        <CurrentKeyRow lessonKeys={lessonKeys} />
        <div className={styles.text}>
          <StaticText
            settings={toTextDisplaySettings(settings)}
            lines={textInput.lines}
          />
        </div>
      </div>
    </FieldSet>
  );
}
