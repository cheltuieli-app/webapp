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

import resources from "./i18n.json";

type KeyValue = Record<string, string>;

const dictionary = resources as unknown as Record<string, KeyValue>;

function translate(message: string, language: string) {
  return dictionary[language][message] || message || ``;
}

interface TextFormat {
  readonly text: string;
  readonly language: string;
  readonly placeholders?: Record<string, string | number>;
}

function formatText({ text, language, placeholders }: TextFormat) {
  text = translate(text, language);

  Object.entries(placeholders || {}).forEach(([k, v]) => {
    text = text.replace(k, v.toString());
  });

  return text;
}

const Whitespace = "\u2000";
const MaxPadding = "1.000.000,00 RON".length;

interface CurrencyFormat {
  readonly amount: number;
  readonly currency: string;
  readonly language: string;
  readonly noPadding?: boolean;
}

function formatCurrency({ amount, currency, language, noPadding }: CurrencyFormat) {
  const opts = { style: "currency", currency };
  const text = new Intl.NumberFormat(language, opts).format(amount / 100);

  return noPadding
    ? text
    : text.padStart(MaxPadding, Whitespace);
}

interface DateFormat {
  readonly date: Date;
  readonly language: string;
  readonly dateFormat?: string;
}

function formatDate({ date, dateFormat, language }: DateFormat) {
  const day = date.getDate().toString().padStart(2, Whitespace); // 01-31
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();

  switch (dateFormat) {
    case "m3/y":
      return formatText({ text: "month-" + month, language }).substring(0, 3) + " " + year;
    case "m/y":
      return formatText({ text: "month-" + month, language }) + " " + year;
    case "m3":
      return formatText({ text: "month-" + month, language }).substring(0, 3);
    case "m":
      return formatText({ text: "month-" + month, language });
    case "y":
      return year;
  }

  return day + " " + formatText({ text: "month-" + month, language }).substring(0, 3) + " " + year;
}

export { formatText, formatDate, formatCurrency };

export const languages: Array<[string, string]> = [
  ["ro-RO", "Salut!"],
  ["en-US", "Hello!"],
];