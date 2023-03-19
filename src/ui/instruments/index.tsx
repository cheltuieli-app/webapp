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

import { useContext, useState } from "react";
import ctx from "src/app/context";

function Toolbar() {
  const [tools, setTools] = useState<boolean>(false);
  const { state, dispatch } = useContext(ctx);

  return (
    <aside className="toolbar">
      {tools
        && (
          <ul>
            <li data-type="plain-text" onClick={() => dispatch({ new: "text" })}>
              <span className="material-symbols-sharp" children="format_paragraph" /> text
            </li>
            <li data-type="expression" onClick={() => dispatch({ new: "text.expression" })}>
              <span className="material-symbols-sharp" children="data_object" /> expr.
            </li>
            <li data-type="table" onClick={() => dispatch({ new: "text.relationship" })}>
              <span className="material-symbols-sharp" children="percent" /> ratio
            </li>
            <li data-type="diagram" onClick={() => dispatch({ new: "diagram.time" })}>
              <span className="material-symbols-sharp" children="timeline" /> diagram
            </li>
            <li data-type="diagram" onClick={() => dispatch({ new: "diagram.bar" })}>
              <span className="material-symbols-sharp" children="bar_chart" /> diagram
            </li>
            <li data-type="diagram" onClick={() => dispatch({ new: "diagram.pie" })}>
              <span className="material-symbols-sharp" children="pie_chart" /> diagram
            </li>
            <li data-type="table" onClick={() => dispatch({ new: "table" })}>
              <span className="material-symbols-sharp" children="table_rows" /> table
            </li>
            <li data-type="definition" onClick={() => dispatch({ new: "text.definition" })}>
              <span className="material-symbols-sharp" children="function" /> def.
            </li>
          </ul>
        )}
      <div className="edit" onClick={() => setTools(v => !v)}>
        <span className="material-symbols-sharp" children="edit_note" />
      </div>
      {state.data.errors.length > 0 && !tools
        && (
          <div className="debug">
            <span className="material-symbols-sharp" children="warning" />
          </div>
        )}
    </aside>
  )
}

export default Toolbar;
