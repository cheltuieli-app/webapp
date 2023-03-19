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
import { formatCurrency, formatDate } from "src/app/i18n";
import { Point } from "platform";

type BarChartAccumulator = Record<string, number>;

interface BarChartProps {
  readonly data: Array<[number, Point]>;
  readonly color: string;
  readonly limit: number;
  readonly xAxis: string;
  readonly yAxis: string;
}

function BarChart({ xAxis, yAxis, data, color, limit }: BarChartProps) {
  const { state } = useContext(ctx);
  const { currency, language } = state.issue;

  const parse = (y: string) => {
    const [numerator, denominator0] = y.split('/', 2);

    const denominator = denominator0
      ? denominator0.split('')
      : [numerator];

    return { numerator, denominator };
  };

  const left = parse(yAxis);

  const xLeft: BarChartAccumulator = data.reduce((acc, [x, p]) => {
    const { a, b, c, d, s } = p;
    const features: Record<string, string> = {
      a, b, c, d: formatDate({ date: d, dateFormat: "m3", language })
    };

    const bucket = features[xAxis];
    const yValue = left.numerator === 's' ? s : x;

    if (bucket in acc) {
      acc[bucket] += yValue;
    } else {
      acc[bucket] = yValue;
    }

    return acc;
  }, {} as BarChartAccumulator);

  const points = Object
    .keys(xLeft)
    .sort((a, b) => xLeft[b] - xLeft[a])
    .reduce((p0, x) =>
      p0.length >= limit
        ? p0
        : [...p0, { y: xLeft[x], x }]
      , [] as Array<{ y: number, x: string }>);

  return (
    <rc.ResponsiveContainer height={500}>
      <rc.BarChart data={points} margin={{ left: 50 }}>
        <rc.CartesianGrid strokeDasharray="3 3" />
        <rc.Bar isAnimationActive={false} dataKey="y" fill={color} />
        <rc.YAxis tickFormatter={a => formatCurrency({ amount: a, currency, language })} fontSize={14} />
        <rc.XAxis dataKey="x" fontSize={12} interval={0} tickFormatter={reduceText.bind(points.length)} />
      </rc.BarChart>
    </rc.ResponsiveContainer>
  );
}

export default BarChart;


function reduceText(this: number, a: string) {
  const ellipsis = '…';

  if (this <= 6) return a;
  if (this <= 9) return a.length > 12 ? a.slice(0, 12) + ellipsis : a;
  if (this <= 12) return a.length > 6 ? a.slice(0, 6) + ellipsis : a;

  return a.slice(0, 3) + ellipsis;
};