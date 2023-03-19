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

import { useContext } from "react";
import * as rc from "recharts";
import ctx from "src/app/context";
import { formatText } from "src/app/i18n";

interface FigureProps {
  readonly x: string;
  readonly y: string;
  readonly id: number;
  readonly source: string;
}

function Figure({ source }: FigureProps) {
  const { state: { data, issue } } = useContext(ctx);

  const [xs, ,] = data.results[source] || [[], "", NaN];
  const { language } = issue;
  const ts = xs.reduce((p, [, { d }]) =>
    p.includes(d.getFullYear()) ? p : [...p, d.getFullYear()], [] as Array<number>);

  const points = new Array(12).fill(null).map((_, i) => {
    const x = formatText({ text: `month-${i + 1}`, language }).substring(0, 3);
    const y = xs.reduce((acc, [, { d }]) => {
      const year = d.getFullYear();

      if (d.getMonth() === i)
        if (year in acc) {
          acc[year] += 1;
        } else {
          acc[year] = 1;
        }

      return acc;
    }, {} as Record<string, number>);

    return { ...y, x };
  });

  const colors = ['f3722c', 'f8961e', 'f9c74f', '90be6d', '43aa8b'].map(a => '#' + a).sort(_ => .5 - Math.random());

  return (
    <output>
      <rc.ResponsiveContainer height={300}>
        <rc.BarChart data={points}>
          {ts.map((a, i) => (
            <rc.Bar isAnimationActive={false} dataKey={a} fill={colors[i]} stackId="y" key={i}>
              <rc.LabelList dataKey={a} fill="white" />
            </rc.Bar>
          ))}
          <rc.XAxis dataKey="x" fontSize={12} interval={0} />
          <rc.Legend />
        </rc.BarChart>
      </rc.ResponsiveContainer>
    </output>
  );
}

export default Figure;