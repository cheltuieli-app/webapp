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

import { Fragment, useContext } from "react";
import * as rc from "recharts";
import { Point } from "platform";
import ctx from "src/app/context";
import { formatCurrency, formatDate } from "src/app/i18n";

type TimeSeriesAccumulator = [string[], Record<string, { [k: string]: number }>];

interface TimeSeriesProps {
  readonly xAxis: string;
  readonly yAxis: string;
  readonly yBase: string[];
  readonly limit: number;
  readonly colors: string[];
  readonly data: Array<[number, Point]>;
}

function TimeSeries({ xAxis: xAxis0, yAxis, yBase, data: data0, limit, colors }: TimeSeriesProps) {
  const { state } = useContext(ctx);
  const { currency, language } = state.issue;

  const xAxis = xAxis0.startsWith("d") ? xAxis0.split(" ").pop() as string : "m3/y";
  const data = data0.sort(([, a], [, b]) => a.d.getTime() < b.d.getTime() ? -1 : 1);

  const xs: TimeSeriesAccumulator = data.reduce(([ts, acc], [x, p]) => {
    const { a, b, c, d, s } = p;
    const features = { a, b, c } as Record<string, string>;
    // timeseriers bucket by date
    const dt: string = formatDate({ date: d, dateFormat: xAxis, language }).trim();
    const bucket = yBase.map(a => features[a]).join(' & ');
    const yValue = yAxis === 's' ? s : x;
    if (ts.indexOf(dt) === -1) ts.push(dt);

    if (dt in acc) {
      if (bucket in acc[dt]) {
        acc[dt][bucket] += yValue;
      } else {
        acc[dt][bucket] = yValue;
      }
    } else {
      acc[dt] = { [bucket]: yValue };
    }

    return [ts, acc];
  }, [[], {}] as TimeSeriesAccumulator);

  const [timeline, yValues] = xs;
  const remap: Record<string, string[]> = {};

  timeline.forEach(x => {
    Object.keys(yValues[x]).forEach(k => {
      if (k in remap) {
        remap[k].push(x);
      } else {
        remap[k] = [x];
      }
    });
  });

  const ys = Object.entries(remap).sort(([k1, a], [k2, b]) => {
    if (b.length === a.length) {
      const aSum = a.reduce((p, x) => p + (yValues[x][k1] || 0), 0);
      const bSum = b.reduce((p, x) => p + (yValues[x][k2] || 0), 0);

      return bSum - aSum;
    }

    return b.length - a.length;
  });

  const lines = new Set<string>();
  const points = ys.reduce((acc, [k, v]) => {
    if (lines.size < limit) {
      lines.add(k);

      v.forEach(x => {
        if (acc[x]) {
          if (!acc[x][k]) acc[x][k] = yValues[x][k];
        } else {
          acc[x] = { x, [k]: yValues[x][k] }
        }
      });
    }

    return acc;
  }, {} as Record<string, Record<string, string | number>>);

  return (
    <rc.ResponsiveContainer height={550}>
      <rc.LineChart data={timeline.map(x => points[x] || { x })} margin={{ left: 50 }}>
        <rc.CartesianGrid strokeDasharray="3 3" />
        {Array.from(lines).map((ln, i) =>
          <rc.Line isAnimationActive={false} dataKey={ln} key={i} stroke={colors[i]} strokeWidth={1.5} dot={<Fragment />} />)}
        <rc.YAxis tickFormatter={a => formatCurrency({ amount: a, currency, language })} fontSize={14} />
        <rc.XAxis dataKey="x" fontSize={12} />
        {yBase.length > 0
          && <rc.Legend />}
      </rc.LineChart>
    </rc.ResponsiveContainer>
  );
}

export default TimeSeries;
