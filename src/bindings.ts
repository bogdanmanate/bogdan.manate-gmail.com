import { fold } from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable';
import { io } from 'fp-ts/lib/IO'
import {safeGetDOMElement, safeAddEventListener} from './dom-utils'

export const bindControlButton = (btnId:string, callback: EventListenerOrEventListenerObject) => pipe(
	io.chain(safeGetDOMElement(btnId), (opt) => 
			pipe(
					opt,
					fold(
							() => () => console.log("No element found!"),
							(elem) => safeAddEventListener(elem, 'click', callback)
					)
			)
	)  
) 