import { type Lesson, lessonProps } from "@keybr/lesson";
import { makeKeyStatsMap, useResults } from "@keybr/result";
import { useSettings } from "@keybr/settings";
import { useMemo } from "react";

/**
 * Hook to compute lessonKeys with manual overrides applied.
 * This ensures consistent behavior between the main practice flow
 * and settings previews.
 */
export function useLessonKeys(lesson: Lesson) {
  const { settings } = useSettings();
  const { results } = useResults();

  return useMemo(() => {
    const lessonKeys = lesson.update(
      makeKeyStatsMap(lesson.letters, lesson.filter(results)),
    );
    // Apply manual key overrides from user settings
    lessonKeys.applyOverrides(
      settings.get(lessonProps.excludedKeys),
      settings.get(lessonProps.forcedKeys),
      settings.get(lessonProps.focusedKey),
    );
    return lessonKeys;
  }, [lesson, results, settings]);
}
