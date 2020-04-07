import { IO, io } from "fp-ts/lib/IO";

import {
    safeGetDOMElement
  } from "./dom-utils";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Option";
import { flow } from "fp-ts/lib/function";
import { defsFactory, svgFactory } from "./geometries-factory";
import { error } from "fp-ts/lib/Console";


export const initializePage: (x:string) => IO<void> = (id:string) => io.chain(safeGetDOMElement(id), (elemOpt) => pipe(
    elemOpt,
    fold(
        () => error("Page not found!"),
        (page) => () => {
					const svg = (page as Element) as SVGSVGElement;
					page.appendChild(defsFactory())
					page.appendChild(svgFactory(svg))
					page.appendChild(svgFactory(svg))
        }
    )
))




