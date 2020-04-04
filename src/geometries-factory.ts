import { pipe } from 'fp-ts/lib/pipeable';
import { getMonoid, IO, io } from 'fp-ts/lib/IO'

const SVG_NS = 'http://www.w3.org/2000/svg';

export type SVGSupportedGraphicElements = SVGRectElement| SVGPathElement | SVGCircleElement

export const rectFactory = ():IO<SVGSupportedGraphicElements> => shapeFactory('rect');
export const circleFactory = () => shapeFactory('circle');

export const shapeFactory = (type:string):IO<SVGSupportedGraphicElements> => {
	const rectIO = () => document.createElementNS(SVG_NS, type)
	return pipe(
			io.map(rectIO, setDefaultProperties(type))     
	)
}

const setDefaultProperties = (type: string) => (element: SVGSupportedGraphicElements) => {

	if (type == 'rect') {
		element.setAttribute('width', '100')
		element.setAttribute('height', '100')
		element.setAttribute('fill', '#cdcdcd')
		element.setAttribute('x', '250') //Todo compute from svg size
		element.setAttribute('y', '300')
	}

	if (type == "circle") {
		element.setAttribute('fill', '#cdcdcd')
		element.setAttribute('cx', '250') //Todo compute from svg size
		element.setAttribute('cy', '300')
		element.setAttribute('r', '50')
	}
	
	return element;
}
