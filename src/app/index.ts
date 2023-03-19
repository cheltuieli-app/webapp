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

import { Misinterpret, Solution } from "abstract";
import * as lang from "language";
import { Point } from "platform";
import { Thread } from "platform/thread";
import { copy as copyMemory } from "src/app/session";

type WebappAccumulator = [Array<[number, Point]>, Solution, number];

interface Interpreted {
  readonly results: Record<string, WebappAccumulator>;
  readonly errors: Array<Misinterpret>;
}

interface State {
  readonly issue: lang.Issue;
  readonly data: Interpreted;
  readonly page: number;
}

type Instrument =
  | "diagram.area"
  | "diagram.scat"
  | "diagram.hist"
  | "diagram.time"
  | "diagram.bar"
  | "diagram.pie"
  | "table"
  | "model"
  | "text.expression"
  | "text.definition"
  | "text.relationship"
  | "text";

interface Action {
  readonly reference?: string;
  readonly source?: string;
  readonly refresh?: [number, number];
  readonly data?: Interpreted;
  readonly page?: number;
  readonly sort?: [number, number];
  readonly new?: Instrument;
}

function fold(this: Thread, state: State, action: Action): State {
  const signature = Object.keys(action).join(" ");
  const [articleId, componentId] = action.refresh || [NaN, NaN];

  switch (signature) {
    case "refresh source": {
      const [newState, content] = recreate(state, {
        articleId, componentId, value: action.source
      });

      this.calculate(copyMemory(), content);

      return newState;
    }
    case "refresh reference": {
      const [newState, content] = recreate(state, {
        articleId, componentId, ref: action.reference
      });

      this.calculate(copyMemory(), content);

      return newState;
    }
    case "data":
      return { ...state, data: action.data as Interpreted };
    case "page":
      return { ...state, page: action.page as number };
    case "sort":
      return sortContent(state, action.sort as [number, number]);
    case "new":
      return create(state, action.new as Instrument);
  }

  throw new Error("cannot change app state");
}

export default fold;

export type { Action, State };

function sortContent(state: State, [from, to]: [number, number]) {
  const articleId = state.page;
  const { content } = state.issue.articles[articleId];
  const newContent = [...content];

  if (from > -1 && to > -1) {
    newContent.splice(from, 1);
    newContent.splice(to, 0, content[from]);
  }

  const newState: State = {
    ...state,
    issue: {
      ...state.issue,
      articles: [
        ...state.issue.articles.slice(0, articleId),
        {
          content: newContent,
          title: state.issue.articles[articleId].title
        },
        ...state.issue.articles.slice(articleId + 1),
      ]
    }
  };

  return newState;
}

function findIndex() {
  const sections = document.querySelectorAll('article > *:not(output)');

  for (let i = 0; i < sections.length; i++) {
    const { top } = sections[i].getBoundingClientRect();

    if (top > 0) return i;
  }

  return 0;
}

function create(state: State, instr: Instrument): State {
  let partials: object;

  switch (instr) {
    case "diagram.area":
    case "diagram.hist":
    case "diagram.scat":
    case "diagram.time":
    case "diagram.bar":
    case "diagram.pie":
      partials = {
        display: lang.Display.O_DIAGRAM,
        value: "",
        type: instr.split(".").pop(),
        max: 5,
        y: "x",
        x: "d",
      };
      break;
    case "table":
      partials = {
        display: lang.Display.O_TABLE,
        value: "",
        cols: "abcds",
        sort: "s",
        max: 10,
      };
      break;
    case "text":
      partials = {
        display: lang.Display.P_TEXT,
        value: "..."
      };
      break;
    case "text.definition":
      partials = {
        display: lang.Display.I_TEXT,
        value: "...",
        def: "local",
        ref: "...",
      };
      break;
    case "text.expression":
      partials = {
        display: lang.Display.I_TEXT,
        value: "..."
      };
      break;
    case "text.relationship":
      partials = {
        display: lang.Display.I_TEXT,
        value: "...",
        type: "ratio",
        rel: "..."
      };
      break;
    default:
      partials = {}
  }

  const componentId = findIndex();
  const articleId = state.page;
  const before = state.issue.articles[articleId].content.slice(0, componentId);
  const after = state.issue.articles[articleId].content.slice(componentId);

  const newState: State = {
    ...state,
    issue: {
      ...state.issue,
      articles: [
        ...state.issue.articles.slice(0, articleId),
        {
          content: [
            ...before,
            { displayId: "", ...partials as any }, // TODO: refactor with type support
            ...after,
          ],
          title: state.issue.articles[articleId].title
        },
        ...state.issue.articles.slice(articleId + 1),
      ]
    }
  };

  return newState;
}

interface Refreshable {
  readonly articleId: number;
  readonly componentId: number;
  readonly value?: string;
  readonly ref?: string;
}

function recreate(state: State, { articleId, componentId, ref, value }: Refreshable) {
  const item: lang.Content = {
    ...state.issue.articles[articleId].content[componentId]
  };

  const newContent = [
    ...state.issue.articles[articleId].content.slice(0, componentId),
    value ? { ...item, value } : ref ? { ...item, ref } : item,
    ...state.issue.articles[articleId].content.slice(componentId + 1)
  ];

  const newState: State = {
    ...state,
    issue: {
      ...state.issue,
      articles: [
        ...state.issue.articles.slice(0, articleId),
        {
          content: newContent,
          title: state.issue.articles[articleId].title
        },
        ...state.issue.articles.slice(articleId + 1),
      ]
    }
  };

  return [newState, newContent] as [State, Array<lang.Content>];
}
