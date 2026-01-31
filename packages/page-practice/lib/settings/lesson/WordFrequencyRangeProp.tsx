import { lessonProps } from "@keybr/lesson";
import { useSettings } from "@keybr/settings";
import {
  Description,
  Explainer,
  Field,
  FieldList,
  TextField,
} from "@keybr/widget";
import { type ReactNode } from "react";

export function WordFrequencyRangeProp(): ReactNode {
  const { settings, updateSettings } = useSettings();
  const startValue = settings.get(lessonProps.guided.wordFrequencyStart);
  const endValue = settings.get(lessonProps.guided.wordFrequencyEnd);

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
      </Explainer>
    </>
  );
}
