import { lessonProps } from "@keybr/lesson";
import { useSettings } from "@keybr/settings";
import {
  CheckBox,
  Description,
  Explainer,
  Field,
  FieldList,
} from "@keybr/widget";
import { type ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export function NaturalWordsProp(): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  return (
    <>
      <FieldList>
        <Field>
          <CheckBox
            label={formatMessage({
              id: "t_Allow_pseudo_words",
              defaultMessage: "Allow pseudo words",
            })}
            checked={settings.get(lessonProps.guided.allowPseudoWords)}
            onChange={(value) => {
              updateSettings(
                settings.set(lessonProps.guided.allowPseudoWords, value),
              );
            }}
          />
        </Field>
      </FieldList>
      <Explainer>
        <Description>
          <FormattedMessage
            id="settings.allowPseudoWords.description"
            defaultMessage="Use generated pseudo-words when there are less than 15 words in the list of valid dictionary words."
          />
        </Description>
      </Explainer>
    </>
  );
}
