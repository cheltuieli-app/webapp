// Copyright (c) 2023 Alexandru Catrina <alex@codeissues.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, { useCallback, useContext } from "react";
import { Solution } from "abstract";
import ctx from "src/app/context";
import { State } from "src/app";
import { formatText, formatCurrency } from "src/app/i18n";

interface TextExpressionProps {
  readonly id: number;
  readonly source: string;
}

function TextExpression({ id, source }: TextExpressionProps) {
  const { state, dispatch } = useContext(ctx);

  const propagate = useCallback(
    ({ currentTarget: e }: React.FormEvent) => {
      if (source !== e.textContent)
        dispatch({ refresh: [state.page, id], source: format(e.textContent) });
    },
    [dispatch, state.page, id, source]
  );

  const preview = useCallback(
    () => {
      const { results } = state.data;

      return results[source]
        ? interpret(state, source)
        : formatText({ text: "nothing", language: state.issue.language });
    },
    [state, source]
  );

  return (
    <pre
      children={format(source)}
      onBlur={propagate}
      data-calc={preview()}
      contentEditable="true"
      suppressContentEditableWarning />
  );
}

export default TextExpression;

function format(text: string | null) {
  if (text) {
    const cleanText = text.replace(/\s+/g, ' ').replace(/(\\)/g, "$1\n");
    const lines = cleanText.split("\n");
    const maxPadding = lines.map(a => a.length).sort().pop() || 0;
    const formatted = lines.map((a, i) => {
      return i < lines.length - 1
        ? a.padStart(maxPadding + 1, ' ')
        : a.padStart(maxPadding - 1, ' ');
    });

    return formatted.join("\n");
  }

  return undefined;
}

function interpret({ issue, data }: State, key: string): string {
  const { language, currency } = issue;
  const { results, errors } = data;

  errors.forEach(console.debug);

  if (results[key]) {
    const [xs, type, value] = results[key];

    return (
      type === Solution.VALUE
        ? formatCurrency({ amount: value, currency, language }).trim()
        : type === Solution.INDEX && value > -1
          ? formatCurrency({ amount: xs[value][0], currency, language }).trim()
          : type === Solution.TUPLE
            ? xs.length === 0
              ? formatText({ text: "nothing", language })
              : formatText({ text: "nr. of results", placeholders: { "%d": xs.length }, language })
            : "?"
    );
  }

  return "?";
}