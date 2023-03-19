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

import { useCallback, useContext, useEffect, useState } from "react";
import { Solution } from "abstract";
import ctx from "src/app/context";
import { State } from "src/app";
import { formatText, formatCurrency } from "src/app/i18n";

interface TextRelationshipProps {
  readonly id: number;
  readonly numerator: string;
  readonly denominator: string
}

function TextRelationship({ id, numerator: a, denominator: b }: TextRelationshipProps) {
  const { state, dispatch } = useContext(ctx);
  const [numerator, setNumerator] = useState<string>(a);
  const [denominator, setDenominator] = useState<string>(b);

  useEffect(
    () => {
      dispatch({ refresh: [state.page, id], source: numerator });
    },
    [dispatch, state.page, id, numerator, denominator]
  );

  const preview = useCallback(
    (value: string) => {
      const { results } = state.data;

      return results[value]
        ? interpret(state, value)
        : formatText({ text: "nothing", language: state.issue.language });
    },
    [state]
  );

  return (
    <table className="relationship">
      <tbody>
        <tr>
          <td
            children={numerator}
            onBlur={({ target }) => target.textContent && setNumerator(target.textContent)}
            contentEditable
            suppressContentEditableWarning />
          <td children="=" rowSpan={2} />
          <td children={preview(numerator)} />
          <td children="=" rowSpan={2} />
          <td children={calculate(state, numerator, denominator)} rowSpan={2} />
        </tr>
        <tr>
          <td
            children={denominator}
            onBlur={({ target }) => target.textContent && setDenominator(target.textContent)}
            contentEditable
            suppressContentEditableWarning />
          <td children={preview(denominator)} />
        </tr>
      </tbody>
    </table>
  );
}

export default TextRelationship;

function getValue({ data }: State, key: string) {
  const { results } = data;

  if (results[key]) {
    const [xs, type, value] = results[key];

    return (
      type === Solution.VALUE
        ? value
        : type === Solution.INDEX && value > -1
          ? xs[value][0]
          : type === Solution.TUPLE
            ? xs.length
            : NaN
    );
  }

  return NaN;
}

function calculate(state: State, numerator: string, denominator: string) {
  const a = getValue(state, numerator);
  const b = getValue(state, denominator);

  return isNaN(a) || isNaN(b)
    ? "?"
    : ((a / b) * 100).toFixed(2) + "%";
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