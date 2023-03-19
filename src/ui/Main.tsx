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

import { useEffect, useReducer } from "react";
import * as lang from "language";
import { Thread } from "platform/thread";
import ctx, { state as fs } from "src/app/context";
import { copy as copyMemory } from "src/app/session";
import ui from "src/ui/components";
import fold from "src/app";
import Toolbar from "./instruments";

interface MainProps {
  readonly context: [lang.Issue, WebSocket | null];
  readonly thread: Thread;
}

function Main({ context: [issue, _socket], thread }: MainProps) {
  const [state, dispatch] = useReducer(fold.bind(thread), { ...fs, issue });

  useEffect(() => {
    const listener = ({ data }: MessageEvent) => dispatch({ data });

    thread.addEventListener("message", listener);

    return () => thread.removeEventListener("message", listener);
  }, [thread, dispatch]);

  useEffect(() => {
    const { content } = state.issue.articles[state.page];

    thread.calculate(copyMemory(), content);
  }, [thread, state.page, state.issue.articles]);

  const cursor = [-1, -1] as [number, number]; // draggable cursor

  return (
    <ctx.Provider value={{ state, dispatch }}>
      <aside className="bookmark">
        <div className="logo" children="cheltuieli.app" />
        <ol>
          {issue.articles.map((a, page) =>
            <li data-active={state.page === page} key={page}>
              <span onClick={() => dispatch({ page })} children={a.title} />
            </li>)}
        </ol>
      </aside>
      <article>
        <h1 children={state.issue.articles[state.page].title} />
        {state.issue.articles[state.page].content.map((a, i) => (
          <section
            children={<ui.ComponentSwitch content={a} index={i} />}
            key={i}
            onDragStart={() => cursor[0] = i}
            onDragEnter={() => cursor[1] = i}
            onDragEnd={() => cursor[0] !== cursor[1] && dispatch({ sort: cursor })}
            draggable />
        ))}
      </article>
      <Toolbar />
    </ctx.Provider>
  );
}

export default Main;
