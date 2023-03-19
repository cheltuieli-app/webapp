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

import { useCallback, useEffect, useState } from "react";
import * as lang from "language";
import { viaUpload } from "src/app/session";
import { formatText, languages } from "src/app/i18n";

const url = {
  youtube: "https://www.youtube.com/@cheltuieli-app",
  github: "https://github.com/cheltuieli-app",
};

interface StartProps {
  readonly whenSuccessful: (a: [lang.Issue, WebSocket | null]) => void;
}

function Start({ whenSuccessful: next }: StartProps) {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("user.language") || navigator.language
  );

  // NOTE: store in browser for future reuse e.g. when user returns to app
  useEffect(() => localStorage.setItem("user.language", language), [language]);

  const upload = useCallback(
    (files: FileList) => {
      if (files.length > 0) viaUpload(files[0], language).then(next);
    },
    [next, language]
  );

  return (
    <div className="start">
      {languages.map(([a, b]) =>
        <b onClick={() => setLanguage(a)} data-active={language === a} key={a} children={b} />)}
      <aside className="toolbar">
        <label htmlFor="upload">
          <span className="material-symbols-sharp" children="drive_folder_upload" />
        </label>
        <input type="file" id="upload" onChange={e => e.target.files && upload(e.target.files)} />
      </aside>
      <footer>
        <i className="fa-brands fa-youtube" />
        <a href={url.youtube} title={url.youtube} children="YouTube" />
        <i className="fa-brands fa-github" />
        <a href={url.github} title={url.github} children="GitHub" />
        <span children={formatText({ text: "copyright notice", language })} />
      </footer>
    </div>
  );
}

export default Start;
