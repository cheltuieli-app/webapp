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

import React, { useCallback, useContext, useState } from "react";
import { Solution } from "abstract";
import ctx from "src/app/context";
import AreaChart from "./Diagram.AreaChart";
import BarChart from "./Diagram.BarChart";
import PieChart from "./Diagram.PieChart";
import TimeSeries from "./Diagram.TimeSeries";
import Placeholder from "./Placeholder";

enum DataVisualization {
  ScatterPlot = "scat",
  TimeSeries = "time",
  Histogram = "hist",
  AreaChart = "area",
  BarChart = "bar",
  PieChart = "pie",
}

interface DiagramProps {
  readonly x: string;
  readonly y: string;
  readonly id: number;
  readonly type: string;
  readonly limit: string;
  readonly source: string;
}

function Diagram({ type, x, y, limit: max, source }: DiagramProps) {
  const [chart, setChart] = useState<string>(type);
  const [limit, setLimit] = useState<number>(+max);
  const [xAxis, setXAxis] = useState<string>(x);
  const [yAxis, setYAxis] = useState<string>(parseYAxis(y).numerator);
  const [yBase, setYBase] = useState<string[]>(parseYAxis(y).denominator);

  const updateYBase = useCallback(
    (h: string) =>
      setYBase(v =>
        v.includes(h)
          ? v.filter(a => a !== h)
          : [...v, h]),
    [setYBase]
  );

  const updateLimit = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => setLimit(+target.value),
    [setLimit]
  );

  const { state: { data: { results, errors } } } = useContext(ctx);
  errors.forEach(console.debug);

  const [data, solution, value] = results[source] ? results[source] : [[], "", NaN];

  const rel: Record<string, string> = {
    [DataVisualization.TimeSeries]: "timeline",
    [DataVisualization.BarChart]: "stacked_bar_chart",
    [DataVisualization.PieChart]: "pie_chart",
  };

  const colors = ['f3722c', 'f8961e', 'f9c74f', '90be6d', '43aa8b'].map(a => '#' + a).sort(_ => .5 - Math.random());

  const showDiagram = useCallback(
    (chart: string) => {
      switch (chart) {
        case DataVisualization.BarChart:
          return (<BarChart xAxis={xAxis} yAxis={yAxis} data={data} color={colors[0]} limit={limit} />);
        case DataVisualization.PieChart:
          return (<PieChart xAxis={xAxis} yAxis={yAxis} data={data} colors={colors} limit={limit} />);
        case DataVisualization.TimeSeries:
          return (<TimeSeries xAxis={xAxis} yAxis={yAxis} yBase={yBase} data={data} colors={colors} limit={limit} />);
        default:
          return (<React.Fragment />);
      }
    },
    [data, limit, xAxis, yAxis, yBase, colors]
  );

  return (
    <output>
      {solution === Solution.TUPLE
        ? showDiagram(chart)
        : <AreaChart data={data} color={colors[0]} isIndex={solution === Solution.INDEX} value={value} />}
      <div className="diagram preferences">
        <div className="chart type">
          <Placeholder text="visualize" tag="h5" />
          {solution === Solution.TUPLE
            ? Object.keys(rel).map(a => (
              <span
                key={a}
                onClick={() => setChart(a)}
                className={"material-symbols-sharp" + (chart === a ? " active" : "")}
                children={rel[a]} />
            ))
            : <span className="material-symbols-sharp active" children="area_chart" />
          }
        </div>
        {solution === Solution.TUPLE
          && (
            <React.Fragment>
              <div className="chart y-axis">
                <Placeholder text="y-axis" tag="h5" />
                <span data-active={yAxis === "x"} onClick={() => setYAxis("x")}>x</span>
                <Placeholder text="or" tag="em" />
                <span data-active={yAxis === "s"} onClick={() => setYAxis("s")}>s</span>
                {chart.length !== 3
                  && (
                    <React.Fragment>
                      <hr />
                      <span data-active={yBase.includes("a")} onClick={() => updateYBase("a")}>a</span>
                      <span data-active={yBase.includes("b")} onClick={() => updateYBase("b")}>b</span>
                      <span data-active={yBase.includes("c")} onClick={() => updateYBase("c")}>c</span>
                    </React.Fragment>
                  )}
              </div>
              <div className="chart x-axis">
                <Placeholder text="x-axis" tag="h5" />
                {chart.length === 3 // TODO: might not be true in future (e.g. bar, pie)
                  ? (
                    <React.Fragment>
                      <span data-active={xAxis === "a"} onClick={() => setXAxis("a")}>a</span>
                      <span data-active={xAxis === "b"} onClick={() => setXAxis("b")}>b</span>
                      <span data-active={xAxis === "c"} onClick={() => setXAxis("c")}>c</span>
                      <span data-active={xAxis === "d"} onClick={() => setXAxis("d")}>d</span>
                    </React.Fragment>
                  )
                  : <span data-active="true">d</span>
                }
              </div>
              <div className="chart limits">
                <Placeholder text="max elements" tag="h5" />
                <input type="number" min={1} defaultValue={limit} onChange={updateLimit} />
              </div>
            </React.Fragment>
          )}
      </div>
    </output>
  );
}

export default Diagram;

function parseYAxis(y: string) {
  const [numerator, denominator0] = y.split('/', 2);

  const denominator = denominator0
    ? denominator0.split('')
    : [];

  return { numerator, denominator };
}
