import { IO } from "fp-ts/lib/IO";
import { initializePage } from "./page";

describe('Page functions should', () => {
    beforeAll(() => {
			document.body.innerHTML = '<svg id="canvas" width="600" width="900"></svg>'
		})

    it('initialize the page', () => {
			const pageIO: IO<void> = initializePage("canvas")
			pageIO() // Execute the side effects

			const svg = <SVGSVGElement><Element>document.getElementById('canvas')
			console.log('DING  '+svg.width)
			expect(svg.childNodes.length).toBe(3)

    })

})