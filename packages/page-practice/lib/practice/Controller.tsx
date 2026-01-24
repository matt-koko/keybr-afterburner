import { type KeyId, useKeyboard } from "@keybr/keyboard";
import { lessonProps } from "@keybr/lesson";
import { type Result } from "@keybr/result";
import { useSettings } from "@keybr/settings";
import { type LineList } from "@keybr/textinput";
import { addKey, deleteKey, emulateLayout } from "@keybr/textinput-events";
import { makeSoundPlayer } from "@keybr/textinput-sounds";
import { type CodePoint } from "@keybr/unicode";
import {
  useDocumentEvent,
  useHotkeys,
  useTimeout,
  useWindowEvent,
} from "@keybr/widget";
import {
  memo,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Presenter } from "./Presenter.tsx";
import {
  type LastLesson,
  LessonState,
  makeLastLesson,
  type Progress,
} from "./state/index.ts";

export const Controller = memo(function Controller({
  progress,
  onResult,
}: {
  readonly progress: Progress;
  readonly onResult: (result: Result) => void;
}): ReactNode {
  const { settings, updateSettings } = useSettings();
  const {
    state,
    handleResetLesson,
    handleSkipLesson,
    handleKeyDown,
    handleKeyUp,
    handleInput,
  } = useLessonState(progress, onResult);

  const handleToggleKey = useCallback(
    (codePoint: CodePoint) => {
      const excludedKeys = settings.get(lessonProps.excludedKeys);
      const forcedKeys = settings.get(lessonProps.forcedKeys);

      // Find the current key state
      const key = state.lessonKeys.find(codePoint);
      if (key == null) return;

      const isExcluded = excludedKeys.includes(codePoint);
      const isForced = forcedKeys.includes(codePoint);

      let newExcludedKeys = excludedKeys.filter((cp) => cp !== codePoint);
      let newForcedKeys = forcedKeys.filter((cp) => cp !== codePoint);

      if (key.isIncluded) {
        // Key is currently included, so exclude it
        if (!isExcluded) {
          newExcludedKeys = [...newExcludedKeys, codePoint];
        }
      } else {
        // Key is currently excluded, so force include it
        if (!isForced) {
          newForcedKeys = [...newForcedKeys, codePoint];
        }
      }

      updateSettings(
        settings
          .set(lessonProps.excludedKeys, newExcludedKeys)
          .set(lessonProps.forcedKeys, newForcedKeys),
      );
    },
    [settings, updateSettings, state.lessonKeys],
  );

  useHotkeys({
    ["Ctrl+ArrowLeft"]: handleResetLesson,
    ["Ctrl+ArrowRight"]: handleSkipLesson,
    ["Escape"]: handleResetLesson,
  });
  useWindowEvent("focus", handleResetLesson);
  useWindowEvent("blur", handleResetLesson);
  useDocumentEvent("visibilitychange", handleResetLesson);
  return (
    <Presenter
      state={state}
      lines={state.lines}
      depressedKeys={state.depressedKeys}
      onResetLesson={handleResetLesson}
      onSkipLesson={handleSkipLesson}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onInput={handleInput}
      onToggleKey={handleToggleKey}
    />
  );
});

function useLessonState(
  progress: Progress,
  onResult: (result: Result) => void,
) {
  const keyboard = useKeyboard();
  const timeout = useTimeout();
  const [key, setKey] = useState(0); // Creates new LessonState instances.
  const [, setLines] = useState<LineList>({ text: "", lines: [] }); // Forces UI update.
  const [, setDepressedKeys] = useState<readonly KeyId[]>([]); // Forces UI update.
  const lastLessonRef = useRef<LastLesson | null>(null);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  return useMemo(() => {
    // New lesson.
    const state = new LessonState(progress, (result, textInput) => {
      setKey(key + 1);
      lastLessonRef.current = makeLastLesson(result, textInput.steps);
      onResultRef.current(result);
    });
    state.lastLesson = lastLessonRef.current;
    setLines(state.lines);
    setDepressedKeys(state.depressedKeys);
    const handleResetLesson = () => {
      state.resetLesson();
      setLines(state.lines);
      setDepressedKeys((state.depressedKeys = []));
      timeout.cancel();
    };
    const handleSkipLesson = () => {
      state.skipLesson();
      setLines(state.lines);
      setDepressedKeys((state.depressedKeys = []));
      timeout.cancel();
    };
    const playSounds = makeSoundPlayer(state.settings);
    const { onKeyDown, onKeyUp, onInput } = emulateLayout(
      state.settings,
      keyboard,
      {
        onKeyDown: (event) => {
          setDepressedKeys(
            (state.depressedKeys = addKey(state.depressedKeys, event.code)),
          );
        },
        onKeyUp: (event) => {
          setDepressedKeys(
            (state.depressedKeys = deleteKey(state.depressedKeys, event.code)),
          );
        },
        onInput: (event) => {
          state.lastLesson = null;
          const feedback = state.onInput(event);
          setLines(state.lines);
          playSounds(feedback);
          timeout.schedule(handleResetLesson, 10000);
        },
      },
    );
    return {
      state,
      handleResetLesson,
      handleSkipLesson,
      handleKeyDown: onKeyDown,
      handleKeyUp: onKeyUp,
      handleInput: onInput,
    };
  }, [progress, keyboard, timeout, key]);
}
