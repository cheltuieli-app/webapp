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

import { Fragment } from "react";
import * as lang from "language";
import Caption from "./Caption";
import Diagram from "./Diagram";
import Figure from "./Figure";
import Model from "./Model";
import Placeholder from "./Placeholder";
import Table from "./Table";
import Text from "./Text";
import TextDefinition from "./TextDefinition";
import TextExpression from "./TextExpression";
import TextRelationship from "./TextRelationship";

interface ComponentSwitchProps {
  readonly content: lang.Content;
  readonly index: number;
}

function ComponentSwitch({ content: { display, displayId, value, ...props }, index }: ComponentSwitchProps) {
  const src = props.ref || value;

  switch (display) {
    case lang.Display.P_TEXT:
      return (
        <Text id={index} source={value} />
      );
    case lang.Display.I_TEXT:
      return (
        <Fragment>
          {props.def
            ? <TextDefinition id={index} source={value} type={props.def} />
            : props.type === "ratio"
              ? <TextRelationship id={index} numerator={value} denominator={props.rel} />
              : <TextExpression id={index} source={value} />}
          <Caption id={index} source={props.ref} type={props.def || "expression"} index={displayId} />
        </Fragment>
      );
    case lang.Display.O_TEXT:
      return (
        <b onDoubleClick={props.action ? setupStatementAction(props.action) : undefined}>{value}</b>
      );
    case lang.Display.I_FORM:
      return (
        <Model type={props.type} />
      );
    case lang.Display.O_TABLE:
      return (
        <Fragment>
          <Table
            headers={value.split(process.env.REACT_APP_COMPOSITION as string)}
            maxRows={props.max}
            columns={props.cols.split("")}
            sortBy={props.sort}
            source={src}
            id={index} />
          <Caption id={index} source={src} type="table" index={displayId} />
        </Fragment>
      );
    case lang.Display.O_DIAGRAM:
      return (
        <Fragment>
          {props.type
            ? <Diagram type={props.type} limit={props.max} x={props.x} y={props.y} source={src} id={index} />
            : <Figure x={props.x} y={props.y} source={src} id={index} />}
          <Caption id={index} source={src} type="diagram" index={displayId} />
        </Fragment>
      );
    default:
      return (
        <Fragment children={JSON.stringify({ display, value })} />
      );
  }
}

const ui = {
  ComponentSwitch,
  Diagram,
  Figure,
  Model,
  Placeholder,
  Table,
  Text,
  TextDefinition,
  TextExpression,
};

export default ui;

function setupStatementAction(link: string) {
  return () => window.open(link, "_blank");
}