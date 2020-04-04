import { pipe } from "fp-ts/lib/pipeable";
import { IO, io } from "fp-ts/lib/IO";
import { Point } from "~adt";

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
	
	let initialMousePosition :Point = {x: 0, y: 0}
	shapeControl.addEventListener('click', () => {
		console.log('Click on control');
		
	})

	shapeControl.addEventListener('mousedown', (event) => {
		shapeControl.classList.add("dragging")
		console.log('Start drag on element');
		
	})

	shapeControl.addEventListener('mousemove', (event) => {
		event.preventDefault();
		if (shapeControl.classList.contains("dragging")) {
			var dragX = event.clientX;
			var dragY = event.clientY;
			shapeControl.setAttributeNS(null, "x", dragX.toString());
			shapeControl.setAttributeNS(null, "y", dragY.toString());
			console.log('Dragging drag on element');
		}
	})

	shapeControl.addEventListener('mouseup', (event) => {
		shapeControl.classList.remove("dragging")
		console.log('End drag on element');
		
	})

	return shapeControl;
}
