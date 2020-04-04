import { pipe } from 'fp-ts/lib/pipeable';
import { getMonoid, IO, io } from 'fp-ts/lib/IO'

const SVG_NS = 'http://www.w3.org/2000/svg';

export const rectFactory = ():IO<SVGRectElement> => {
	const rectIO = () => document.createElementNS(SVG_NS, 'rect')
	return pipe(
			io.map(rectIO, (rect) => {
				rect.setAttribute('width', '100')
				rect.setAttribute('height', '100')
				rect.setAttribute('fill', '#fff000')
				rect.setAttribute('x', '250') //Todo compute from svg size
				rect.setAttribute('y', '300')
				return rect;
			}
		)     
	)
}

