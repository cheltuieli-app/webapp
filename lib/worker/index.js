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

const interpret = require("platform/backend").default;

async function calculate({ dataset, content }) {
  const output = { results: {}, errors: [] };

  if (content.length > 0)
    try {
      const { results, errors } = interpret(dataset, content);
      const presets = {};

      Object.keys(results).forEach(a => {
        const [xs, sol, val] = results[a];
        presets[a] = [[], sol, val];

        for (let i = 0; i < xs.length; i++)
          presets[a][0].push([xs[i].value, dataset.at(xs[i].index)]);
      });

      return { results: presets, errors };
    } catch (e) {
      output.errors.push(e.message);
    }

  return output;
}

addEventListener("message", e => calculate(e.data).then(postMessage));