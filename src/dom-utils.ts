import { chain, fold, none, Option, some,fromNullable } from 'fp-ts/lib/Option'


import { getMonoid, IO, io } from 'fp-ts/lib/IO'
import { pipe } from 'fp-ts/lib/pipeable';

type PureDomSelector = (id:string) => IO<Option<HTMLElement>>

export const safeGetDOMElement: PureDomSelector = (id: string) => () => {
		console.log('Get HTML ELEMENT', fromNullable(document.getElementById(id)));
		return fromNullable(document.getElementById(id));
}
export const safeAddEventListener = (elem: HTMLElement, eventName :string, callback: EventListenerOrEventListenerObject) => () => {
				console.log('Add event listener');
				elem.addEventListener(eventName, callback)
		}

export const safeAddElement = (element: HTMLElement|SVGElement, parent: HTMLElement|SVGElement): IO<void> => () => {
		console.log('Add element to ', parent);
		parent.appendChild(element)
	}
		