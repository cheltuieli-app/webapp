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
import { Point } from "platform";
import * as rc from "recharts";
import { formatCurrency } from "src/app/i18n";
import ctx from "src/app/context";

interface AreaChartProps {
  readonly data: Array<[number, Point]>;
  readonly color: string;
  readonly value: number;
  readonly isIndex: boolean;
}

function AreaChart({ data, color, value, isIndex }: AreaChartProps) {
  const { state: { issue: { currency, language } } } = useContext(ctx);

  const points = data.map(([y,], x) => ({ x, y }));
  const controller = points.length > 100 ? 100 : points.length;

  return (
    <rc.ResponsiveContainer height={500}>
      <rc.AreaChart data={points} margin={{ left: 50 }}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={color} stopOpacity={1.00} />
            <stop offset="90%" stopColor={color} stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <rc.CartesianGrid strokeDasharray="3 3" />
        <rc.Area isAnimationActive={false} dataKey="y" fill="url(#area)" stroke={color} />
        <rc.YAxis tickFormatter={a => formatCurrency({ amount: a, currency, language })} fontSize={14} />
        <rc.XAxis dataKey="x" fontSize={12} />
        {isIndex
          ? <rc.ReferenceLine x={value} stroke="red" />
          : <rc.ReferenceLine y={value} stroke="red" />}
        <rc.Brush endIndex={controller} travellerWidth={0} stroke="#c5c5c5" />
      </rc.AreaChart>
    </rc.ResponsiveContainer>
  );
}

export default AreaChart;
