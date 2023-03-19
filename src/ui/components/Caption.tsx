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

import { useCallback, useContext, useMemo } from "react";
import { formatText } from "src/app/i18n";
import ctx from "src/app/context";

interface CaptionProps {
  readonly source: string;
  readonly index: string;
  readonly type: string;
  readonly id: number;
}

function Caption({ id, index: idx, source, type }: CaptionProps) {
  const { state: { page, issue: { language } }, dispatch } = useContext(ctx);

  const indicator = useMemo(
    () => formatText({ text: type, language, placeholders: { "%s": idx } }),
    [type, language, idx]
  );

  const invokePrompt = useCallback(
    () => {
      const reference = window.prompt(indicator, source);
      if (reference !== null) dispatch({ refresh: [page, id], reference })
    },
    [dispatch, page, id, indicator, source]
  );

  return (
    <div className="caption">
      <var onClick={invokePrompt}>
        {indicator.trim()}
        <span data-ref={source?.length > 0}>{source}</span>
      </var>
    </div>
  );
}

export default Caption;