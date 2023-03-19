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
import ctx from "src/app/context";

interface TextDefinitionProps {
  readonly id: number;
  readonly type: string;
  readonly source: string;
}

function TextDefinition({ id, source }: TextDefinitionProps) {
  const { state, dispatch } = useContext(ctx);

  const propagate = useCallback(
    ({ currentTarget: e }: React.FormEvent) => {
      if (source !== e.textContent)
        dispatch({ refresh: [state.page, id], source: format(e.textContent) });
    },
    [dispatch, state.page, id, source]
  );

  return (
    <pre
      children={format(source)}
      onBlur={propagate}
      contentEditable="true"
      suppressContentEditableWarning />
  );
}

export default TextDefinition;

function format(text: string | null) {
  if (text) {
    const cleanText = text.replace(/\s+/g, ' ').replace(/(;)/g, "$1\n");
    const lines = cleanText.replace(/=>/g, '').split("\n");

    return lines.map(a => '=> ' + a.trim()).join("\n");
  }

  return undefined;
}

