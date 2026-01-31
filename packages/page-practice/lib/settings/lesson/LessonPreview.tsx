import { type Lesson } from "@keybr/lesson";
import { CurrentKeyRow, KeySetRow } from "@keybr/lesson-ui";
import { LCG } from "@keybr/rand";
import { useSettings } from "@keybr/settings";
import {
  TextInput,
  toTextDisplaySettings,
  toTextInputSettings,
} from "@keybr/textinput";
import { StaticText } from "@keybr/textinput-ui";
import { FieldSet } from "@keybr/widget";
import { type ReactNode, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLessonKeys } from "../../practice/state/useLessonKeys.ts";
import * as styles from "./LessonPreview.module.less";

export function LessonPreview({
  lesson,
}: {
  readonly lesson: Lesson;
}): ReactNode {
  const { formatMessage } = useIntl();
  const { settings } = useSettings();
  const lessonKeys = useLessonKeys(lesson);
  const textInput = useMemo(() => {
    return new TextInput(
      lesson.generate(lessonKeys, LCG(123)),
      toTextInputSettings(settings),
    );
  }, [settings, lesson, lessonKeys]);
  return (
    <FieldSet
      legend={formatMessage({
        id: "t_Lesson_preview:",
        defaultMessage: "Lesson preview",
      })}
    >
      <div className={styles.root}>
        <KeySetRow lessonKeys={lessonKeys} />
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
