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

import React, { useCallback, useState } from "react";
import { Point } from "platform";
import Placeholder from "./Placeholder";

interface GridProps {
  readonly limit: number;
  readonly more: Function;
  readonly rows: Array<[number, Point]>;
  readonly cols: string[];
  readonly sort: {
    readonly header: string;
    readonly ascending: boolean;
  }
}

function Grid({ cols, limit, more, rows: rows0, sort }: GridProps) {
  const [order, setOrder] = useState<[string, boolean]>([sort.header, sort.ascending]);

  const asHeader = useCallback(
    (a: string, i: number) => (
      <th onClick={() => setOrder(([, o]) => [a, !o])} key={i}>
        {a.length === 1
          ? <Placeholder text={`table ${a}-header`} />
          : a}
        {order[0] === a
          && <span className="material-symbols-sharp" children="unfold_more" />}
      </th>
    ),
    [order, setOrder]
  );

  const asRow = useCallback(
    (offset: number) => ([x, p]: [number, Point], i: number) => (
      <tr key={i}>
        {cols.map((h, j) => {
          const cell = { value: null as JSX.Element | null, title: "" };

          switch (h) {
            case "a":
              cell.value = <Placeholder text={p.a} />;
              cell.title = p.a;
              break;
            case "b":
              cell.value = <Placeholder text={p.b} />
              cell.title = p.b;
              break;
            case "c":
              cell.value = <Placeholder text={p.c} />
              cell.title = p.c;
              break;
            case "d":
              cell.value = <Placeholder datetime={p.d} />
              break;
            case "s":
              cell.value = <Placeholder currency={p.s} />
              break;
            default:
              cell.value = <Placeholder currency={x} />
          }

          return (
            <td data-row-index={offset + i + 1} title={cell.title} key={j}>
              <span children={cell.value} />
            </td>
          );
        })}
      </tr>
    ),
    [cols]
  );

  const rows = Array.from(rows0).sort(orderBy(...order));

  return (
    <table data-records={rows.length}>
      <thead>
        <tr children={cols.map(asHeader)} />
      </thead>
      <tbody>
        {rows.slice(0, limit).map(asRow(0))}
        {rows.length > limit
          && (
            <React.Fragment>
              <tr className="more" onClick={() => more()}>
                <td colSpan={cols.length} children="..." />
              </tr>
              {rows.slice(rows.length - 3).map(asRow(rows.length - 3))}
            </React.Fragment>
          )}
      </tbody>
    </table>
  );
}

export default Grid;

function orderBy(header: string, isAscending: boolean) {
  return ([a, first]: [number, Point], [b, second]: [number, Point]) => {

    const cmp = header === "a"
      ? first.a.localeCompare(second.a)
      : header === "b"
        ? first.b.localeCompare(second.b)
        : header === "c"
          ? first.c.localeCompare(second.c)
          : header === "d"
            ? first.d.getTime() < second.d.getTime() ? -1 : 1
            : header === "s"
              ? first.s < second.s ? -1 : 1
              : a < b ? -1 : 1;

    return isAscending
      ? cmp
      : cmp === -1
        ? 1 : cmp === 1
          ? -1 : 0;
  };
}
