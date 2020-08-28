import { pipe } from "fp-ts/lib/pipeable";
import { Reader } from "fp-ts/lib/Reader";
import { IO, io } from "fp-ts/lib/IO";
import { Point } from "../data/adt";
import { log } from "fp-ts/lib/Console";
import { of, fromEvent, animationFrameScheduler } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn, pairwise } from 'rxjs/operators';
import { left } from "fp-ts/lib/Either";

const SVG_NS = "http://www.w3.org/2000/svg";

export type SVGSupportedGraphicElements =
  | SVGRectElement
  | SVGPathElement
  | SVGSVGElement
  | SVGCircleElement;

export const rectFactory = (): IO<SVGSupportedGraphicElements> =>
  shapeFactory("rect");
export const circleFactory = () => shapeFactory("circle");

export const shapeFactory = (type: string): IO<SVGSupportedGraphicElements> => {
  const shapeIO = () => document.createElementNS(SVG_NS, type);
  return io.map(shapeIO, setDefaultProperties(type));
};

export const defsFactory = () => shapeFactory("defs")()
export const svgFactory = (svg: SVGSVGElement, id:string) => {
	const childSVG = shapeFactory("svg")()
	
	childSVG.setAttribute("id", id)
	childSVG.setAttribute('width', svg.getAttribute('width'))
	childSVG.setAttribute('height', svg.getAttribute('height'))

	return childSVG;
}
const setDefaultProperties = (type: string) => (
  element: SVGSupportedGraphicElements
) => {
  if (type === "rect") {
    element.setAttribute("width", "100");
    element.setAttribute("height", "100");
    element.setAttribute("fill", "#cdcdcd");
    // element.setAttribute("x", "250"); // Todo compute from svg size
    // element.setAttribute("y", "300");
  }

  if (type === "circle") {
    element.setAttribute("fill", "#cdcdcd");
    element.setAttribute("cx", "50"); // cx and cy need to be equal to radius
    element.setAttribute("cy", "50");
    element.setAttribute("r", "50");
	}

  return element;
};


export const createShapeControls = (shape: SVGSupportedGraphicElements): Reader<SVGSVGElement, SVGElement> => (container: SVGSVGElement) => {
	const bounds = shape.getBBox()
	const shapeControlGroup = document.createElementNS(SVG_NS, 'g');

	const svgMatrix = createSVGMatrix().translate(bounds.x, bounds.y)
	
	shapeControlGroup.transform.baseVal.initialize(shape.ownerSVGElement.createSVGTransformFromMatrix(svgMatrix))
	const shapeControl = document.createElementNS(SVG_NS, 'rect');

	shapeControl.setAttribute("width", bounds.width.toString());
	shapeControl.setAttribute("height", bounds.height.toString());
	shapeControl.setAttribute("fill", "transparent");
	shapeControl.setAttribute("stroke", "black");
	shapeControl.setAttribute("stroke-width", '2');

	shapeControlGroup.appendChild(shapeControl)

	const topLeftControl = createControl();
	topLeftControl.setAttribute("x", (-2).toString());
	topLeftControl.setAttribute("y", (-2).toString());
	topLeftControl.classList.add("top-left-control")
	
	shapeControlGroup.appendChild(topLeftControl)
	
	const topMiddleControl = createControl();
	topMiddleControl.setAttribute("x", (bounds.width/2-2).toString());
	topMiddleControl.setAttribute("y", (-2).toString());
	topMiddleControl.classList.add("top-middle-control")
	
	shapeControlGroup.appendChild(topMiddleControl)
	
	const topRightControl = createControl();
	topRightControl.setAttribute("x", (bounds.width-2).toString());
	topRightControl.setAttribute("y", (-2).toString());
	topRightControl.classList.add("top-right-control")
	
	shapeControlGroup.appendChild(topRightControl)
	
	const leftControl = createControl();
	leftControl.setAttribute("x", (-2).toString());
	leftControl.setAttribute("y", (bounds.height/2-2).toString());
	leftControl.classList.add("left-control")
	
	shapeControlGroup.appendChild(leftControl)
	
	const rightControl = createControl();
	rightControl.setAttribute("x", (bounds.width-2).toString());
	rightControl.setAttribute("y", (bounds.height/2-2).toString());
	rightControl.classList.add("right-control")
	
	shapeControlGroup.appendChild(rightControl)
	
	const bottomLeftControl = createControl();
	bottomLeftControl.setAttribute("x", (-2).toString());
	bottomLeftControl.setAttribute("y", (bounds.height-2).toString());
	bottomLeftControl.classList.add("bottom-left-control")
	
	shapeControlGroup.appendChild(bottomLeftControl)
	
	const bottomMiddleControl = createControl();
	bottomMiddleControl.setAttribute("x", (bounds.width/2-2).toString());
	bottomMiddleControl.setAttribute("y", (bounds.height-2).toString());
	bottomMiddleControl.classList.add("bottom-middle-control")
	
	shapeControlGroup.appendChild(bottomMiddleControl)
	
	const bottomRightControl = createControl();
	bottomRightControl.setAttribute("x", (bounds.width-2).toString());
	bottomRightControl.setAttribute("y", (bounds.height-2).toString());
	bottomRightControl.classList.add("bottom-right-control")

	shapeControlGroup.appendChild(bottomRightControl)
	
	shapeControl.addEventListener('click', () => {
		log('Click on control');
		
	})

	const mousedown$ = fromEvent<MouseEvent>(shapeControl, 'mousedown');
	const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
	const mouseup$ = fromEvent<MouseEvent>(shapeControl, 'mouseup');

	const drag$ = mousedown$.pipe(
		switchMap(
			(start) =>
				mousemove$.pipe(
					startWith(start),
					pairwise(),
					map(([prevMouseEvent, mouseEvent]) => {
					mouseEvent.preventDefault();
					const deltaX = mouseEvent.pageX - prevMouseEvent.pageX;
					const deltaY = mouseEvent.pageY - prevMouseEvent.pageY;

					return {
						x: deltaX,
						y: deltaY
					}
				}),
				tap(point => log(point)),
				takeUntil(mouseup$))));
	
	const position$ = drag$.pipe(subscribeOn(animationFrameScheduler));
	
	position$.subscribe((pos: Point) => {
		// const m = createSVGMatrix().translate(pos.x, pos.y);
		const targetMatrix = shapeControlGroup.getCTM()
		log("------");
		log(targetMatrix)
		targetMatrix.e = targetMatrix.e + pos.x
		targetMatrix.f = targetMatrix.f + pos.y
		// log(targetMatrix)
		// log(pos)
		shapeControlGroup.transform.baseVal.initialize(shapeControlGroup.ownerSVGElement.createSVGTransformFromMatrix(targetMatrix))
		log(shapeControlGroup.getCTM());
		
		shapeControl.setAttributeNS(null, "x", "0");
		shapeControl.setAttributeNS(null, "y", "0");
	});

	mouseup$.subscribe(
		() => {
			const targetMatrix = shapeControlGroup.getCTM()
			// Todo use transformation matrix - not all the SVG Elements have x and y coordinated
			// Circle move bug
			const shapeTransformMatrix = shape.getCTM();
			shapeTransformMatrix.e = targetMatrix.e;
			shapeTransformMatrix.f = targetMatrix.f;
			// shape.setAttributeNS(null, "x", targetMatrix.e.toString());
			// shape.setAttributeNS(null, "y", targetMatrix.f.toString());
			shape.transform.baseVal.initialize(shape.ownerSVGElement.createSVGTransformFromMatrix(shapeTransformMatrix))
		})

	return 	shapeControlGroup;
}

const createSVGMatrix = ():SVGMatrix => document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();

const createControl = () => {
	const control = document.createElementNS(SVG_NS, 'rect');
	control.setAttribute("width", "4");
	control.setAttribute("height", "4");
	control.setAttribute("fill", "#ff0000");

	return control;
}