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

import parseXML, * as lang from "language";
import { Point } from "platform";

const cache: Record<string, Point[]> = {};

function copy(...src: string[]): Point[] {
  if (src.length === 0) return Object.values(cache).flat();

  return src.reduce((p, a) => [...cache[a] || [], ...p], [] as Point[]);
}

async function fromUpload(file: File): Promise<void> {
  const fr = new FileReader();

  fr.readAsText(file, "utf-8");
  fr.onerror = () => alert(fr.error?.message);
  fr.onload = ({ target }) => {
    const csv = target?.result as string;

    csv.split("\n").filter(a => a.trim().length > 0).forEach(x => {
      const ln = x.split(",").map(y => y.trim().replace(/\s+/g, " "));
      const [author, beneficiary, category, date, sum, currency] = ln;
      const [integer, fractional] = sum.split('.', 2);
      const sum0 = Number(integer + (fractional || ''));
      // if (Sum.exponent < fractional.length)
      //   Sum.exponent = fractional.length;
      const a = sum0 < 0 ? beneficiary : author;
      const b = sum0 < 0 ? author : beneficiary;
      const c = category;
      const d = new Date(date); // must be UTC
      const s = Math.abs(sum0);
      const point: Point = { a, b, c, d, s };

      if (currency in cache) {
        cache[currency].push(point);
      } else {
        cache[currency] = [point];
      }
    });
  }
}

async function viaUpload(file: File, locale: string) {
  await fromUpload(file);

  const response = await fetch(locale + ".xml");
  const xml = await response.text();

  return [parseXML(new DOMParser(), xml), null] as [lang.Issue, null];
}

async function viaMobile() {
  //
}

export { copy, viaUpload, viaMobile };