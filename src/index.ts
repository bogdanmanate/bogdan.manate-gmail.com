// Import option monad
import {
  chain,
  fold,
  none,
  Option,
  some,
  fromNullable,
  option,
} from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";

import { IO, io } from "fp-ts/lib/IO";
import {
	addShapeToCanvas,
} from "./utils/dom-utils";
import { bindControlButton } from "./utils/bindings";
import {
  rectFactory,
  SVGSupportedGraphicElements,
  circleFactory,
} from "./geometry/geometries-factory";
import { initializePage } from "./geometry/page";

const insertIO = (btnID: string, factoryIO: IO<SVGSupportedGraphicElements>) =>
  bindControlButton(btnID, handlerIO(factoryIO));

const handlerIO = (factoryIO: IO<SVGSupportedGraphicElements>) =>
  pipe(
    io.chain(factoryIO, (svg) =>
      addShapeToCanvas(svg)
    )
  );

const insertRectIO = insertIO("insertRectBtn", rectFactory());
const insertCircleIO = insertIO("insertCircleBtn", circleFactory());

insertRectIO();
insertCircleIO();

const initIO: IO<void> = initializePage('canvas')

initIO();
