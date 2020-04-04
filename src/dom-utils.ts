import {
  Option,
  fromNullable,
  fold
} from "fp-ts/lib/Option";
import { IO, io } from "fp-ts/lib/IO";
import { SVGSupportedGraphicElements, createShapeControls } from "./geometries-factory";
import { pipe } from "fp-ts/lib/pipeable";



type PureDomSelector = (id: string) => IO<Option<HTMLElement>>;

export const safeGetDOMElement: PureDomSelector = (id: string) => () => {
  console.log("Get HTML ELEMENT", fromNullable(document.getElementById(id)));
  return fromNullable(document.getElementById(id));
};
export const safeAddEventListener = (
  elem: HTMLElement,
  eventName: string,
  callback: EventListenerOrEventListenerObject
) => () => {
  console.log("Add event listener");
  elem.addEventListener(eventName, callback);
};

export const safeAddElement = (
  element: HTMLElement | SVGElement,
  parent: HTMLElement | SVGElement
): IO<void> => () => {
  console.log("Add element to ", parent);

  parent.appendChild(element);
};


export const addShapeToCanvas = (shape: SVGSupportedGraphicElements):IO<void> => {
  return io.chain(safeGetDOMElement("shapes-continer"), (elemOpt) =>
    pipe(
      elemOpt,
      fold(
        () => () => console.log("No shape container found!"),
        (elem) => {
          return io.chain(safeGetDOMElement("manipulators-continer"), (manOpt) => 
            pipe(
              manOpt,
              fold(
                () => () => console.log("No manipulators conatiner found!"),
                (controlsContainer) => {
                  return io.chain(
                    safeAddElement(shape, elem), () => safeAddElement(createShapeControls(shape), controlsContainer)
                  ) 
                }
              )
            )
          );
        }
      )
    )
  )
}
