  import {
    Option,
    fromNullable,
    fold
  } from "fp-ts/lib/Option";
import { IO, io } from "fp-ts/lib/IO";
import { SVGSupportedGraphicElements, createShapeControls } from "./geometries-factory";
import { pipe } from "fp-ts/lib/pipeable";
import { log } from 'fp-ts/lib/Console'



type PureDomSelector = (id: string) => IO<Option<HTMLElement>>;

export const safeGetDOMElement: PureDomSelector = (id: string) => 
io.map(log("Get HTML ELEMENT"), () => fromNullable(document.getElementById(id)))

export const safeAddEventListener = (
  elem: HTMLElement,
  eventName: string,
  callback: EventListenerOrEventListenerObject
) => io.map(log("Add event listener"), () => elem.addEventListener(eventName, callback))


export const safeAddElement = (
  element: HTMLElement | SVGElement,
  parent: HTMLElement | SVGElement
): IO<void> => io.map(log("Add element to " + parent), () => parent.appendChild(element))

export const addShapeToCanvas = (shape: SVGSupportedGraphicElements):IO<void> =>
  io.chain(safeGetDOMElement("shapes-continer"), (elemOpt) =>
    pipe(
      elemOpt,
      fold(
        () => log("No shape container found!"),
        (elem) =>
          io.chain(safeGetDOMElement("controls-continer"), (manOpt) => 
            pipe(
              manOpt,
              fold(
                () => log("No controls conatiner found!"),
                (controlsContainer) =>
                  io.chain(
                    safeAddElement(shape, elem), () => safeAddElement(createShapeControls(shape), controlsContainer)
                  )
              )
            )
          )
      )
    )
  )
