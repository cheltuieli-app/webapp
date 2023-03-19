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

import { useCallback, useContext, useState } from "react";
import { State } from "src/app";
import Grid from "./Table.Grid";
import ctx from "src/app/context";
import Placeholder from "./Placeholder";

interface TableProps {
  readonly id: number;
  readonly source: string;
  readonly sortBy: string;
  readonly headers: string[];
  readonly columns: string[];
  readonly maxRows: string;
}

function Table({ columns: cols, headers: h, maxRows, sortBy, source }: TableProps) {
  const [limit, setLimit] = useState<number>(+maxRows);
  const [columns, setColumns] = useState<string[]>(h.length > 1 ? [...cols, h[0]] : cols);

  const { state } = useContext(ctx);
  const rows = interpret(state, source);
  const [header, ascending] = sortBy.split(" ", 2);

  const setColumn = useCallback(
    (header: string) => {
      setColumns(v => {
        const cols = [...v];
        const pos = cols.indexOf(header);

        if (pos === -1) {
          cols.unshift(header);
        } else {
          cols.splice(pos, 1);
        }

        return cols;
      });
    },
    [setColumns]);

  return (
    <output>
      <div className="table preferences">
        <aside>
          <section>
            <Placeholder text="columns" tag="h5" />
            <span data-active={columns.includes("a")} onClick={() => setColumn("a")}>a</span>
            <span data-active={columns.includes("b")} onClick={() => setColumn("b")}>b</span>
            <span data-active={columns.includes("c")} onClick={() => setColumn("c")}>c</span>
            <span data-active={columns.includes("d")} onClick={() => setColumn("d")}>d</span>
          </section>
          <section>
            <Placeholder text="minimalize" tag="h5" />
            <span
              onClick={() => setLimit(+maxRows)}
              className="material-symbols-sharp"
              children="compress" />
          </section>
        </aside>
      </div>
      <Grid
        cols={columns}
        rows={rows}
        sort={{ ascending: ascending === "asc", header }}
        more={() => setLimit(v => +maxRows + v)}
        limit={limit} />
    </output>
  );
}

export default Table;

function interpret({ data }: State, source: string) {
  const { results, errors } = data;

  errors.forEach(console.debug);

  return results[source]
    ? results[source][0]
    : [];
}