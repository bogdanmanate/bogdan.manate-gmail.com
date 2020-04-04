import { pipe } from "fp-ts/lib/pipeable";
import { IO, io } from "fp-ts/lib/IO";
import { Point } from "~adt";
import { of, fromEvent, animationFrameScheduler } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn } from 'rxjs/operators';

const SVG_NS = "http://www.w3.org/2000/svg";

export type SVGSupportedGraphicElements =
  | SVGRectElement
  | SVGPathElement
  | SVGCircleElement;

export const rectFactory = (): IO<SVGSupportedGraphicElements> =>
  shapeFactory("rect");
export const circleFactory = () => shapeFactory("circle");

export const shapeFactory = (type: string): IO<SVGSupportedGraphicElements> => {
  const shapeIO = () => document.createElementNS(SVG_NS, type);
  return pipe(io.map(shapeIO, setDefaultProperties(type)));
};

const setDefaultProperties = (type: string) => (
  element: SVGSupportedGraphicElements
) => {
  if (type == "rect") {
    element.setAttribute("width", "100");
    element.setAttribute("height", "100");
    element.setAttribute("fill", "#cdcdcd");
    element.setAttribute("x", "250"); // Todo compute from svg size
    element.setAttribute("y", "300");
  }

  if (type == "circle") {
    element.setAttribute("fill", "#cdcdcd");
    element.setAttribute("cx", "250"); // Todo compute from svg size
    element.setAttribute("cy", "300");
    element.setAttribute("r", "50");
  }

  return element;
};


export const createShapeControls = (shape: SVGSupportedGraphicElements) => {
	const bounds = shape.getBBox()
	const shapeControl = document.createElementNS(SVG_NS, 'rect');
	shapeControl.setAttribute("width", bounds.width.toString());
	shapeControl.setAttribute("height", bounds.height.toString());
	shapeControl.setAttribute("x", bounds.x.toString());
	shapeControl.setAttribute("y", bounds.y.toString());
	shapeControl.setAttribute("fill", "transparent");
	shapeControl.setAttribute("stroke", "black");
	shapeControl.setAttribute("stroke-width", '2');
	
	const initialMousePosition :Point = {x: 0, y: 0}
	shapeControl.addEventListener('click', () => {
		console.log('Click on control');
		
	})

	const mousedown$ = fromEvent<MouseEvent>(shapeControl, 'mousedown');
	const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
	const mouseup$ = fromEvent<MouseEvent>(shapeControl, 'mouseup');

	const drag$ = mousedown$.pipe(
		switchMap(
			(start) =>
				mousemove$.pipe(map(mouseEvent => {
					mouseEvent.preventDefault();
					return {
						x: mouseEvent.offsetX, // - start.offsetX,
						y: mouseEvent.offsetY //- start.offsetY
					}
				}),
				// tap(point => console.log(point)),
				takeUntil(mouseup$))));
	
	const position$ = drag$.pipe(subscribeOn(animationFrameScheduler));
	
	position$.subscribe((pos: Point) => {
		shapeControl.setAttributeNS(null, "x", pos.x.toString());
		shapeControl.setAttributeNS(null, "y", pos.y.toString());
	});

	mouseup$.subscribe(
		() => {
			const controlX = shapeControl.getAttributeNS(null, 'x');
			const controlY = shapeControl.getAttributeNS(null, 'y');
			//Todo use transformation matrix - not all the SVG Elements have x and y coordinated
			// Circle move bug
			shape.setAttributeNS(null, "x", controlX);
			shape.setAttributeNS(null, "y", controlY);
		})

	return shapeControl;
}
