import { safeGetDOMElement } from "./dom-utils";
import { io, IO } from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/pipeable";
import {
  fold
} from "fp-ts/lib/Option";

describe("Dom utils function", () => {

  describe("safeGetDOMElement", () => {
    beforeAll(() => {
      document.body.innerHTML =
    '<div>' +
    '  <div id="canvas" ></div>' +
    '  <button id="button" />' +
    '</div>';
    })
    it("should return IO<some<HTMLElement>> when element was found", () => {
      io.chain(safeGetDOMElement('canvas'), (opt) => 
        pipe(
          opt,
          fold(
            () => () => fail('It should not reach this branch!'),
            (elem) => () => {
              expect(elem.getAttribute('id')).toBe('canvas')
            }
          )
        )
      )()
    });

    it("should return IO<none> when element NOT found", () => {
      io.chain(safeGetDOMElement('canvas1'), (opt) => 
        pipe(
          opt,
          fold(
            () => () => expect(true).toBeTruthy(),
            (elem) => () => fail('Wrong! There is no element with this ID')
          )
        )
      )()
    });
  })


});
