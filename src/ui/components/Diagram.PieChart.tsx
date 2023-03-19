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
import { Point } from "platform";
import ctx from "src/app/context";
import { formatCurrency, formatDate } from "src/app/i18n";

type PieChartAccumulator = Record<string, number>;

interface PieChartProps {
  readonly colors: string[];
  readonly limit: number;
  readonly xAxis: string;
  readonly yAxis: string;
  readonly data: Array<[number, Point]>;
}

function PieChart({ xAxis, yAxis, data, limit, colors }: PieChartProps) {
  const { state: { issue: { currency, language } } } = useContext(ctx);

  const xLeft: PieChartAccumulator = data.reduce((acc, [x, { a, b, c, d, s }]) => {
    const yValue = yAxis === 's' ? s : x;

    const features: Record<string, string> = {
      a, b, c, d: formatDate({ date: d, dateFormat: "m", language })
    };

    const bucket = features[xAxis];

    if (bucket in acc) {
      acc[bucket] += yValue;
    } else {
      acc[bucket] = yValue;
    }

    return acc;
  }, {} as PieChartAccumulator);

  const points = Object
    .keys(xLeft)
    .sort((a, b) => xLeft[b] - xLeft[a])
    .reduce((p0, x) =>
      p0.length >= limit
        ? p0
        : [...p0, { y: xLeft[x], x }]
      , [] as Array<{ y: number, x: string }>);

  const label = ({ x, y }: any) => {
    const value = formatCurrency({ amount: y, currency, language }).trim();

    return `${x}: ${value}`;
  };

  return (
    <rc.ResponsiveContainer height={500}>
      <rc.PieChart>
        <rc.Pie
          cx="50%"
          cy="50%"
          data={points}
          isAnimationActive={false}
          dataKey="y"
          outerRadius={150}
          fill="#8884d8"
          label={({ index }) => label(points[index])}>
          {points.map((_, index) => (
            <rc.Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </rc.Pie>
      </rc.PieChart>
    </rc.ResponsiveContainer >
  );
}

export default PieChart;