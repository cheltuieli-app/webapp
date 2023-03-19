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

import React, { useContext } from "react";
import { formatCurrency, formatDate, formatText } from "src/app/i18n";
import ctx from "src/app/context";

enum Tag {
  h1 = "h1",
  h2 = "h2",
  h3 = "h3",
  h4 = "h4",
  h5 = "h5",
  li = "li",
  p = "p",
  span = "span",
  td = "td",
  th = "th",
  em = "em",
  u = "u",
}

interface PlaceholderProps {
  readonly tag?: keyof typeof Tag;
  readonly text?: string;
  readonly datetime?: Date;
  readonly currency?: number;
  readonly placeholders?: Record<string, string | number>;
  readonly link?: {
    readonly title: string;
    readonly href: string;
    readonly onClick?: (e: React.MouseEvent) => Promise<void> | void;
  };
}

function Placeholder({ text, tag, link, datetime, currency: $, placeholders }: PlaceholderProps) {
  const { state: { issue: { language, currency } } } = useContext(ctx);

  if ($) return render([formatCurrency({ amount: $, currency, language })], tag);
  if (datetime) return render([formatDate({ date: datetime, language })], tag);

  if (text) {
    const message = formatText({ text, placeholders, language });
    const wrapper: Array<string | JSX.Element> = [];

    if (link !== undefined) {
      const opening = message.indexOf('[');
      const closing = message.indexOf(']');
      if (opening > -1 && closing > -1) {
        wrapper.push(message.slice(0, opening));
        wrapper.push(
          <a href={link.href} onClick={link.onClick} title={link.title} key="link">
            <Placeholder text={message.slice(opening + 1, closing)} />
          </a>);
        wrapper.push(message.slice(closing + 1));
      }
    }

    return render(wrapper.length ? wrapper : [message], tag);
  }

  return null;
}

export default Placeholder;

function render(content: Array<string | JSX.Element>, tag?: string): JSX.Element {
  switch (tag) {
    case Tag.h1:
      return <h1>{content}</h1>;
    case Tag.h2:
      return <h2>{content}</h2>;
    case Tag.h3:
      return <h3>{content}</h3>;
    case Tag.li:
      return <li>{content}</li>;
    case Tag.h4:
      return <h4>{content}</h4>;
    case Tag.h5:
      return <h5>{content}</h5>;
    case Tag.p:
      return <p>{content}</p>;
    case Tag.span:
      return <span>{content}</span>;
    case Tag.td:
      return <td>{content}</td>;
    case Tag.th:
      return <th>{content}</th>;
    case Tag.em:
      return <em>{content}</em>;
    case Tag.u:
      return <u>{content}</u>;
    default:
      return <React.Fragment>{content}</React.Fragment>;
  }
}