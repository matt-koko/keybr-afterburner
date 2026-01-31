import { type GuidedLesson, lessonProps } from "@keybr/lesson";
import { Filter } from "@keybr/phonetic-model";
import { useSettings } from "@keybr/settings";
import {
  Description,
  Explainer,
  Field,
  FieldList,
  TextField,
} from "@keybr/widget";
import { type ReactNode, useMemo } from "react";
import { useLessonKeys } from "../../practice/state/useLessonKeys.ts";

export function WordFrequencyRangeProp({
  lesson,
}: {
  readonly lesson: GuidedLesson;
}): ReactNode {
  const { settings, updateSettings } = useSettings();
  const lessonKeys = useLessonKeys(lesson);
  const startValue = settings.get(lessonProps.guided.wordFrequencyStart);
  const endValue = settings.get(lessonProps.guided.wordFrequencyEnd);

  // Calculate available word count based on current settings and letter filter
  const wordCount = useMemo(() => {
    const filter = new Filter(
      lessonKeys.findIncludedKeys(),
      lessonKeys.findFocusedKey(),
    );
    const words = lesson.dictionary.find(filter);
    return words.slice(startValue, endValue).length;
  }, [lesson, lessonKeys, startValue, endValue]);

  const handleStartChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      updateSettings(settings.set(lessonProps.guided.wordFrequencyStart, num));
    }
  };

  const handleEndChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      updateSettings(settings.set(lessonProps.guided.wordFrequencyEnd, num));
    }
  };

  return (
    <>
      <FieldList>
        <Field>Word frequency range:</Field>
        <Field>
          <TextField
            size={6}
            value={String(startValue)}
            onChange={handleStartChange}
          />
        </Field>
        <Field>to</Field>
        <Field>
          <TextField
            size={6}
            value={String(endValue)}
            onChange={handleEndChange}
          />
        </Field>
      </FieldList>
      <Explainer>
        <Description>
          Filter words by their frequency rank in the dictionary. Lower ranks
          are more common words (0 = &quot;the&quot;, 1 = &quot;to&quot;, etc.).
          Set 0-100 for only the most common words, or 500-1000 for less common
          words.
        </Description>
        <Description>
          <strong>
            With this frequency range and your current letters, there are{" "}
            {wordCount} word{wordCount !== 1 ? "s" : ""} available.
          </strong>
        </Description>
      </Explainer>
    </>
  );
}
